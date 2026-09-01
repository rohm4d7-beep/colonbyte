import { chromium } from 'playwright';

// Most businesses in any category already have a website, and routes/scrape.js now
// discards those before saving (this tool only wants no-website/poor-website leads) — so
// visiting only 20 raw listings would leave very few actual leads. Visit more candidates
// per job to compensate; ~80-100 is roughly what a single Maps local-pack search can
// surface via scrolling before results stop growing.
const MAX_RESULTS = 80;

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
    .getAttribute('aria-label')
    .catch(() => null);

  const reviewsAria = await page
    .locator('span[role="img"][aria-label*="review"]')
    .first()
    .getAttribute('aria-label')
    .catch(() => null);

  const category = await page
    .locator('button[jsaction*="category"]')
    .first()
    .textContent()
    .catch(() => '') || '';

  const openingHoursSummary = await page
    .locator('span.ZDu9vd, div.MkV9')
    .first()
    .textContent()
    .catch(() => '') || '';

  const photoCount = await page
    .locator('button[jsaction*="heroHeaderImage"], [data-photo-index]')
    .count()
    .catch(() => 0);

  const heroPhotoSrc = await page
    .locator('button[jsaction*="heroHeaderImage"] img')
    .first()
    .getAttribute('src')
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

export async function scrapeGoogleMaps(keyword, { onProgress, processItem, targetCountry } = {}) {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    const page = await browser.newPage({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' });
    const searchTerm = targetCountry ? `${keyword} ${targetCountry}` : keyword;
    const url = `https://www.google.com/maps/search/${encodeURIComponent(searchTerm)}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const feedSelector = 'div[role="feed"]';
    await page.waitForSelector(feedSelector, { timeout: 15000 }).catch(() => {});

    await autoScroll(page, feedSelector, MAX_RESULTS);

    const links = await page
      .locator(`${feedSelector} a[href*="/maps/place/"]`)
      .evaluateAll(els => els.map(el => el.href));

    const uniqueLinks = [...new Set(links)].slice(0, MAX_RESULTS);
    onProgress?.({ found: uniqueLinks.length, processed: 0, status: 'running' });

    for (let i = 0; i < uniqueLinks.length; i++) {
      let item = null;
      try {
        await page.goto(uniqueLinks[i], { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(600);

        const businessName = await page.locator('h1').first().textContent().catch(() => '') || '';

        const websiteHref = await page
          .locator('a[data-item-id="authority"]')
          .first()
          .getAttribute('href')
          .catch(() => null);
        const website = resolveWebsite(websiteHref);

        const phoneItemId = await page
          .locator('button[data-item-id^="phone:tel:"]')
          .first()
          .getAttribute('data-item-id')
          .catch(() => null);
        const phone = phoneItemId ? phoneItemId.replace('phone:tel:', '') : '';

        const address = await page
          .locator('button[data-item-id="address"]')
          .first()
          .textContent()
          .catch(() => '') || '';

        const placeUrl = page.url();
        const coords = extractCoordinates(placeUrl);
        const details = await extractListingDetails(page);

        item = {
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

        if (item.businessName) {
          if (processItem) await processItem(item);
          results.push(item);
        }
      } catch {
        // skip this listing, keep going
      }

      onProgress?.({ found: uniqueLinks.length, processed: i + 1, status: 'running' });
    }
  } finally {
    await browser.close();
  }

  return results;
}
