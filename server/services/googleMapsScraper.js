import { chromium } from 'playwright';

// A truncated UA (missing "(KHTML, like Gecko) Chrome/... Safari/537.36") previously used
// here doesn't match any real browser and is an easy bot-detection tell — same full string
// websiteAnalyzer.js/emailExtractor.js already use.
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

// Most businesses in any category already have a website, and routes/scrape.js now
// discards those before saving (this tool only wants no-website/poor-website leads) — so
// visiting only 20 raw listings would leave very few actual leads. Visit more candidates
// per job to compensate; ~80-100 is roughly what a single Maps local-pack search can
// surface via scrolling before results stop growing.
const MAX_RESULTS = 150;

// Listings were visited one at a time on a single tab — almost all of the time per item is
// spent waiting on network I/O (Maps navigation, website checks, email extraction, AI calls),
// so a handful of tabs working the same queue in parallel gives a near-linear speedup with
// little extra load. Kept modest since each worker's website-analysis fallback can itself
// launch a browser page (see websiteAnalyzer.js's shared analysisBrowser).
const CONCURRENCY = 4;

// None of the per-listing locator calls below specify a timeout, so a listing simply missing
// one of these fields (no rating shown, no category button, etc. — completely normal) was
// paying Playwright's default 30s actionability wait before the .catch() gave up on it. With
// up to ~10 such lookups per item, a handful of misses alone could stall a single lead for
// minutes; multiply by a full batch and a job crawls. The page has already loaded (goto +
// settle wait below) by the time these run, so if an element isn't there within 2s it isn't
// coming — fail fast instead of waiting out the default.
const FIELD_TIMEOUT = 2000;

// Google's own UI embeds icon-font glyphs as literal inline text nodes right before
// labels like the address (e.g. a leading U+E0C8) — these are Private Use Area
// codepoints with no meaning outside Google's icon font, so .textContent() picks up
// visible garbage. Strip all PUA ranges (BMP + both supplementary planes).
function stripIconGlyphs(text) {
  return (text || '').replace(/[\u{E000}-\u{F8FF}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]/gu, '').trim();
}

function guessCountry(address) {
  if (!address) return '';
  const parts = address.split(/,|\s-\s/).map(p => p.trim()).filter(Boolean);
  return parts[parts.length - 1] || '';
}

function extractCoordinates(url) {
  // A direct goto() to a place URL keeps Google's `!3d<lat>!4d<lng>` data payload
  // form; the `@lat,lng,zoom` form only appears after in-app SPA navigation. Try both.
  const dataMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (dataMatch) return { lat: parseFloat(dataMatch[1]), lng: parseFloat(dataMatch[2]) };

  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };

  return null;
}

function extractPlaceId(url) {
  const match = url.match(/!1s(0x[0-9a-f]+:0x[0-9a-f]+)/i);
  return match ? match[1] : '';
}

function parseLeadingNumber(text) {
  if (!text) return null;
  const match = text.replace(/,/g, '').match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

function upsizePhotoUrl(src) {
  if (!src) return '';
  // Google's photo URLs take a `=w<width>-h<height>-...` size suffix — request a
  // larger render than the small thumbnail Maps loads by default, for demo-site use.
  return src.replace(/=w\d+-h\d+.*$/, '=w1200-h800-k-no');
}

async function extractListingDetails(page) {
  const ratingAria = await page
    .locator('span[role="img"][aria-label*="stars"]')
    .first()
    .getAttribute('aria-label', { timeout: FIELD_TIMEOUT })
    .catch(() => null);

  const reviewsAria = await page
    .locator('span[role="img"][aria-label*="review"]')
    .first()
    .getAttribute('aria-label', { timeout: FIELD_TIMEOUT })
    .catch(() => null);

  const category = await page
    .locator('button[jsaction*="category"]')
    .first()
    .textContent({ timeout: FIELD_TIMEOUT })
    .catch(() => '') || '';

  const openingHoursSummary = await page
    .locator('span.ZDu9vd, div.MkV9')
    .first()
    .textContent({ timeout: FIELD_TIMEOUT })
    .catch(() => '') || '';

  const photoCount = await page
    .locator('button[jsaction*="heroHeaderImage"], [data-photo-index]')
    .count()
    .catch(() => 0);

  const heroPhotoSrc = await page
    .locator('button[jsaction*="heroHeaderImage"] img')
    .first()
    .getAttribute('src', { timeout: FIELD_TIMEOUT })
    .catch(() => null);

  return {
    rating: parseLeadingNumber(ratingAria),
    reviewCount: parseLeadingNumber(reviewsAria),
    category: stripIconGlyphs(category),
    openingHoursSummary: stripIconGlyphs(openingHoursSummary),
    photoCount,
    photos: heroPhotoSrc ? [upsizePhotoUrl(heroPhotoSrc)] : [],
  };
}

function resolveWebsite(href) {
  if (!href) return '';
  try {
    const url = new URL(href, 'https://www.google.com');
    const real = url.searchParams.get('q');
    return real || href;
  } catch {
    return href;
  }
}

async function autoScroll(page, feedSelector, targetCount) {
  let previousCount = 0;
  let stagnantRounds = 0;

  // Raised alongside MAX_RESULTS (80) — the stagnant-rounds break below still stops early
  // once Maps genuinely has no more results, so this only affects how long we're willing to
  // keep trying, not how long we wait when there's nothing left to load.
  //
  // A broad, country-level query (e.g. "hotels United Kingdom" rather than a city) makes Maps
  // load each next batch noticeably slower than a local search does — the old 700ms wait /
  // 3-stagnant-round break combo was tripping the "no more results" exit while a batch was
  // still in flight, capping `found` around 10-20 well short of MAX_RESULTS. More tolerance
  // for slow batches fixes that; it costs nothing once results genuinely stop growing since the
  // stagnant-round check still exits early in that case.
  for (let i = 0; i < 60; i++) {
    const count = await page.locator(`${feedSelector} a[href*="/maps/place/"]`).count();
    if (count >= targetCount) break;

    if (count === previousCount) {
      stagnantRounds++;
      if (stagnantRounds >= 6) break;
    } else {
      stagnantRounds = 0;
    }
    previousCount = count;

    // Google's virtualized feed list responds far more reliably to a real wheel event than to
    // a programmatic scrollTop change — the latter can silently fail to trigger the next batch
    // load on broad searches even though it works fine for typical city-scoped ones.
    const box = await page.locator(feedSelector).boundingBox().catch(() => null);
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.wheel(0, 1200);
    } else {
      await page.evaluate((sel) => {
        const feed = document.querySelector(sel);
        if (feed) feed.scrollBy(0, 1200);
      }, feedSelector);
    }

    await page.waitForTimeout(1100);
  }
}

async function visitListing(page, link) {
  await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(600);

  const businessName = await page.locator('h1').first().textContent({ timeout: FIELD_TIMEOUT }).catch(() => '') || '';

  const websiteHref = await page
    .locator('a[data-item-id="authority"]')
    .first()
    .getAttribute('href', { timeout: FIELD_TIMEOUT })
    .catch(() => null);
  const website = resolveWebsite(websiteHref);

  const phoneItemId = await page
    .locator('button[data-item-id^="phone:tel:"]')
    .first()
    .getAttribute('data-item-id', { timeout: FIELD_TIMEOUT })
    .catch(() => null);
  const phone = phoneItemId ? phoneItemId.replace('phone:tel:', '') : '';

  const address = await page
    .locator('button[data-item-id="address"]')
    .first()
    .textContent({ timeout: FIELD_TIMEOUT })
    .catch(() => '') || '';

  const placeUrl = page.url();
  const coords = extractCoordinates(placeUrl);
  const details = await extractListingDetails(page);

  return {
    businessName: stripIconGlyphs(businessName),
    website: website || '',
    phone,
    address: stripIconGlyphs(address),
    country: guessCountry(stripIconGlyphs(address)),
    placeId: extractPlaceId(placeUrl),
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    ...details,
  };
}

export async function scrapeGoogleMaps(keyword, { onProgress, processItem, onItemError, targetCountry } = {}) {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    const searchPage = await browser.newPage({ userAgent: BROWSER_UA });
    const searchTerm = targetCountry ? `${keyword} ${targetCountry}` : keyword;
    const url = `https://www.google.com/maps/search/${encodeURIComponent(searchTerm)}`;
    await searchPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const feedSelector = 'div[role="feed"]';
    await searchPage.waitForSelector(feedSelector, { timeout: 15000 }).catch(() => {});

    await autoScroll(searchPage, feedSelector, MAX_RESULTS);

    const links = await searchPage
      .locator(`${feedSelector} a[href*="/maps/place/"]`)
      .evaluateAll(els => els.map(el => el.href));

    await searchPage.close();

    const uniqueLinks = [...new Set(links)].slice(0, MAX_RESULTS);
    onProgress?.({ found: uniqueLinks.length, processed: 0, status: 'running' });

    // A handful of tabs pull from the same queue rather than a strict one-at-a-time loop —
    // see CONCURRENCY above.
    let nextIndex = 0;
    let processedCount = 0;

    async function worker() {
      const page = await browser.newPage({ userAgent: BROWSER_UA });
      try {
        while (true) {
          const i = nextIndex++;
          if (i >= uniqueLinks.length) break;

          // Under Maps load/throttling, a slow-to-settle navigation can get raced by Google's
          // own client-side JS auto-navigating the same page (a "similar places" redirect,
          // observed live as Playwright's "Navigation to X is interrupted by another
          // navigation to Y") - a transient collision, not a dead listing, so one retry
          // recovers most of them rather than losing the lead outright.
          let item;
          try {
            item = await visitListing(page, uniqueLinks[i]);
          } catch {
            try {
              item = await visitListing(page, uniqueLinks[i]);
            } catch (err) {
              console.error(`[googleMapsScraper] Failed processing ${uniqueLinks[i]}:`, err.message);
              onItemError?.(err);
            }
          }

          if (item?.businessName) {
            try {
              if (processItem) await processItem(item);
              results.push(item);
            } catch (err) {
              // Previously swallowed silently with no logging and no counts.* increment (every
              // counter lives inside processItem) - a listing that failed partway through
              // (e.g. a duplicate-key race between two concurrent workers on Lead.create, see
              // routes/scrape.js) simply vanished from every count with no trace. Log it and
              // let the caller count it instead of skipping silently. Not retried here (unlike
              // the visit above) - it already has its own DB-level recovery for the one known
              // transient case.
              console.error(`[googleMapsScraper] Failed processing ${uniqueLinks[i]}:`, err.message);
              onItemError?.(err);
            }
          }

          processedCount++;
          onProgress?.({ found: uniqueLinks.length, processed: processedCount, status: 'running' });
        }
      } finally {
        await page.close();
      }
    }

    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, uniqueLinks.length) }, worker));
  } finally {
    await browser.close();
  }

  return results;
}
