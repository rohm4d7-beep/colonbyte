import { chromium } from 'playwright';

// Same size-suffix trick as googleMapsScraper.js's upsizePhotoUrl.
function upsizePhotoUrl(src) {
  if (!src) return '';
  return src.replace(/=w\d+-h\d+.*$/, '=w1200-h800-k-no');
}

async function waitForPlaceOrFeed(page, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (page.url().includes('/maps/place/')) return 'place';
    const feedCount = await page
      .locator('div[role="feed"] a[href*="/maps/place/"]')
      .count()
      .catch(() => 0);
    if (feedCount > 0) return 'feed';
    await page.waitForTimeout(300);
  }
  return 'timeout';
}

/**
 * The bulk scraper (googleMapsScraper.js) only ever captures a listing's single hero photo —
 * fine for scale, but useless for picking a *good* photo (see photoSelector.js). This re-visits
 * one specific listing (by search, since the CID we store isn't the `place_id:` format Maps'
 * direct URL expects) and opens its photo gallery to collect several candidates. Only called
 * on-demand for one lead at a time (demo generation), never during bulk scraping — opening the
 * gallery adds ~8-10s, which is fine for a single click but would tank bulk scrape throughput.
 * Never throws — callers get [] on any failure and fall back to the single scraped photo.
 */
export async function fetchListingPhotos(businessName, country) {
  if (!businessName) return [];

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' });
    const query = country ? `${businessName} ${country}` : businessName;

    await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    });

    const outcome = await waitForPlaceOrFeed(page, 8000);
    if (outcome === 'timeout') return [];

    if (outcome === 'feed') {
      const link = await page
        .locator('div[role="feed"] a[href*="/maps/place/"]')
        .first()
        .getAttribute('href')
        .catch(() => null);
      if (!link) return [];
      await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(800);
    }

    const heroCount = await page.locator('button[jsaction*="heroHeaderImage"]').count();
    if (heroCount === 0) return [];

    await page.locator('button[jsaction*="heroHeaderImage"]').first().click();
    await page.waitForTimeout(1500);

    // The photo gallery lightbox renders each tile as a div[role="img"] with a CSS
    // background-image rather than an <img src>, so it isn't reachable via the plain
    // `img` selector used for the single hero photo on the listing page itself.
    const urls = await page.evaluate(() => {
      const out = new Set();
      document.querySelectorAll('div.aHpZye[role="img"]').forEach((el) => {
        const bg = getComputedStyle(el).backgroundImage;
        const match = bg.match(/url\("?(.*?)"?\)/);
        if (match) out.add(match[1]);
      });
      return [...out];
    });

    return urls.map(upsizePhotoUrl).slice(0, 6);
  } catch {
    return [];
  } finally {
    await browser.close();
  }
}
