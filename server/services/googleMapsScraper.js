import { chromium } from 'playwright';

const MAX_RESULTS = 20;

function guessCountry(address) {
  if (!address) return '';
  const parts = address.split(/,|\s-\s/).map(p => p.trim()).filter(Boolean);
  return parts[parts.length - 1] || '';
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

  for (let i = 0; i < 15; i++) {
    const count = await page.locator(`${feedSelector} a[href*="/maps/place/"]`).count();
    if (count >= targetCount) break;

    if (count === previousCount) {
      stagnantRounds++;
      if (stagnantRounds >= 3) break;
    } else {
      stagnantRounds = 0;
    }
    previousCount = count;

    await page.evaluate((sel) => {
      const feed = document.querySelector(sel);
      if (feed) feed.scrollBy(0, 1200);
    }, feedSelector);

    await page.waitForTimeout(700);
  }
}

export async function scrapeGoogleMaps(keyword, { onProgress, processItem } = {}) {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    const page = await browser.newPage({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' });
    const url = `https://www.google.com/maps/search/${encodeURIComponent(keyword)}`;
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

        item = {
          businessName: businessName.trim(),
          website: website || '',
          phone,
          address: address.trim(),
          country: guessCountry(address.trim()),
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
