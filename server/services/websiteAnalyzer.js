import axios from 'axios';
import * as cheerio from 'cheerio';
import { chromium } from 'playwright';

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const SOCIAL_HOSTS = {
  'facebook.com': 'facebook_only',
  'fb.com': 'facebook_only',
  'instagram.com': 'instagram_only',
  'business.google.com': 'google_business_only',
  'g.page': 'google_business_only',
  'maps.google.com': 'google_business_only',
};

function hostnameOf(website) {
  try {
    const url = new URL(website.startsWith('http') ? website : `https://${website}`);
    return url.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

// A self-identifying bot UA (e.g. the old "ColonByteBot/1.0") gets flat-out blocked (403) by
// basic WAFs/CDNs (Cloudflare, Wordfence, etc.) on plenty of perfectly working sites — that
// false 403 used to get misclassified as 'broken'. A real browser UA + standard headers
// clears most of those.
// Returns { ok, html } on a real page load; otherwise { ok: false, blocked } — `blocked: true`
// means we got an actual HTTP response back (the site is up, it just refused us — that's
// evidence of bot protection, not a broken site); `blocked: false` means no response reached
// us at all (DNS failure, connection refused, timeout — that's evidence the site is genuinely
// down). This distinction is what separates 'broken' from 'unverified' below.
async function fetchViaAxios(url) {
  try {
    const res = await axios.get(url, {
      timeout: 8000,
      maxRedirects: 3,
      headers: {
        'User-Agent': BROWSER_UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      validateStatus: () => true,
    });
    if (res.status < 400 && typeof res.data === 'string') return { ok: true, html: res.data };
    return { ok: false, blocked: true };
  } catch {
    return { ok: false, blocked: false };
  }
}

// Enterprise WAFs (Akamai, Cloudflare Enterprise, PerimeterX) block plain HTTP clients on
// TLS/behavioral fingerprints no amount of header-spoofing gets past — a real perfectly-fine
// site (e.g. a hotel chain's official page) can still 403 a raw axios request. Only a real
// browser engine clears that, so fall back to headless Chromium (already a project dependency
// for the Maps scraper, which faces the same class of bot detection) before calling it broken.
//
// `sharedBrowser` lets a batch caller (routes/scrape.js) pass one browser instance for the
// whole job instead of paying a fresh ~1-2s Chromium launch per item — with categories that
// trigger this fallback often (e.g. hotels behind Cloudflare), that launch cost alone was the
// dominant chunk of a scrape job's runtime. Falls back to launching its own when none is given.
async function fetchViaBrowser(url, sharedBrowser) {
  let ownBrowser;
  try {
    const browser = sharedBrowser || (ownBrowser = await chromium.launch({ headless: true }));
    const page = await browser.newPage({ userAgent: BROWSER_UA });
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      if (!response) return { ok: false, blocked: false };
      if (response.status() < 400) return { ok: true, html: await page.content() };
      return { ok: false, blocked: true };
    } finally {
      await page.close();
    }
  } catch {
    return { ok: false, blocked: false };
  } finally {
    if (ownBrowser) await ownBrowser.close();
  }
}

/**
 * Rule-based website classification + quality score (0-100), no AI calls.
 * Anything other than a solid `has_website` result is flagged highPriority,
 * since those are the businesses that actually need a new site.
 * `sharedBrowser` — see fetchViaBrowser above.
 */
export async function analyzeWebsite(website, sharedBrowser) {
  if (!website) {
    return { status: 'none', websiteQualityScore: 0, highPriority: true };
  }

  const hostname = hostnameOf(website);
  for (const [host, status] of Object.entries(SOCIAL_HOSTS)) {
    if (hostname === host || hostname.endsWith(`.${host}`)) {
      return { status, websiteQualityScore: 15, highPriority: true };
    }
  }

  const url = website.startsWith('http') ? website : `https://${website}`;

  const first = await fetchViaAxios(url);
  const second = first.ok ? null : await fetchViaBrowser(url, sharedBrowser);
  const result = first.ok ? first : second;

  if (!result.ok) {
    // Actively blocked (site responded, just refused us) is not the same claim as "broken" —
    // don't tell a business their working site is broken just because it has bot protection.
    // Treat it as unverified and NOT highPriority: we have no evidence their site is bad, and
    // a business with enterprise-grade bot protection is unlikely to be this agency's target
    // customer anyway, so it shouldn't get pitched a replacement site on a false premise.
    if (first.blocked || second?.blocked) {
      return { status: 'unverified', websiteQualityScore: 0, highPriority: false };
    }
    return { status: 'broken', websiteQualityScore: 0, highPriority: true };
  }

  const $ = cheerio.load(result.html);

  let score = 100;
  if (!url.startsWith('https://')) score -= 15;
  if ($('meta[name="viewport"]').length === 0) score -= 20;
  if (!$('title').text().trim()) score -= 15;
  if (!$('meta[name="description"]').attr('content')?.trim()) score -= 10;

  const bodyText = $('body').text();
  const copyrightMatch = bodyText.match(/(?:©|copyright)\s*(\d{4})/i);
  if (copyrightMatch) {
    const year = parseInt(copyrightMatch[1], 10);
    if (new Date().getFullYear() - year >= 3) score -= 15;
  }

  const hasSocialLinks =
    $('a[href*="facebook.com"], a[href*="instagram.com"], a[href*="linkedin.com"], a[href*="twitter.com"], a[href*="x.com"]').length > 0;
  if (!hasSocialLinks) score -= 10;

  const hasContactLink = $('a[href^="mailto:"], a[href*="contact"], a[href^="tel:"]').length > 0;
  if (!hasContactLink) score -= 10;

  score = Math.max(0, Math.min(100, score));

  const status = score < 40 ? 'outdated' : 'has_website';
  const highPriority = status !== 'has_website' || score < 60;

  return { status, websiteQualityScore: score, highPriority };
}
