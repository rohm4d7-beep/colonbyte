import axios from 'axios';
import * as cheerio from 'cheerio';
import { chromium } from 'playwright';

// Same full string websiteAnalyzer.js/googleMapsScraper.js use — a self-identifying or
// truncated bot UA gets flat-out 403'd by basic WAFs on plenty of working sites.
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

// TLD is intentionally lowercase-only: real domains render lowercase, while text
// concatenated onto the match with no separator (e.g. a "Call" button label glued
// onto "info@site.com" during text extraction) reliably starts uppercase, so this
// stops the greedy match at the real domain boundary instead of swallowing it.
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,24}/g;
const IGNORED_EXTENSIONS = /\.(png|jpg|jpeg|gif|svg|webp|css|js)$/i;
// `mystore.com` is Square Online's stock template address: it ships in the raw HTML of every
// unconfigured Square site (confirmed live on american-barbershop-101767.square.site, whose
// REAL address is a gmail one that only appears after JS renders). Without it here, the
// placeholder gets saved as the business's email - worse than finding none,
// since outreach would then go to a dead address that isn't theirs.
const JUNK_DOMAINS = /(sentry|wixpress|schema\.org|w3\.org|example\.(com|org|net)|domain\.com|yourdomain|godaddy|placeholder|test\.com|email\.com|mystore\.com|localhost|\.(png|jpg|jpeg|gif|svg|webp|css|js))$/i;

function looksReal(email) {
  const domain = email.split('@')[1] || '';
  return !IGNORED_EXTENSIONS.test(email) && !JUNK_DOMAINS.test(domain) && !JUNK_DOMAINS.test(email);
}

function extractFromMailto($) {
  // Re-run the href value through EMAIL_RE rather than trusting it verbatim — sites
  // sometimes ship malformed mailto hrefs with trailing garbage concatenated in
  // (e.g. href="mailto:info@site.aeRESERVATION").
  // `area` (not just `a`) - confirmed live on caledoniaplumbingandheating.co.uk, whose header
  // is one banner graphic with an old-school HTML image map overlaying clickable hotspots on
  // it; the mailto lives on an <area href="mailto:..."> hotspot, which an `a`-only selector
  // silently never sees even though the link is genuinely there in the HTML.
  const emails = $('a[href^="mailto:"], area[href^="mailto:"]')
    .toArray()
    .map(el => {
      const raw = ($(el).attr('href') || '').replace('mailto:', '').split('?')[0].trim();
      return raw.match(EMAIL_RE)?.[0] || '';
    });
  return emails.filter(Boolean).filter(looksReal);
}

function extractFromText($) {
  $('script, style, noscript').remove();
  // Cheerio's .text() concatenates raw text nodes with no separator, unlike a browser's
  // rendered innerText - so two adjacent block elements with nothing but a CSS line break
  // between their source text nodes run together into one token. Confirmed live: a "Email us"
  // label immediately followed by an "info@site.com" value block (only a rendered line break
  // between them, no literal whitespace character in the source) concatenated into
  // "usinfo@site.com" - the regex then swallowed "us" from the label as part of the email's
  // local part, corrupting a real, findable address into a wrong one. Force a space at every
  // block-level boundary before extracting text so the regex sees the same word breaks a
  // rendered page would.
  $('br').replaceWith(' ');
  $('div, p, li, tr, td, th, h1, h2, h3, h4, h5, h6, section, article, header, footer, button, label').each((_, el) => {
    $(el).append(' ');
  });
  const text = $('body').text();
  const matches = text.match(EMAIL_RE) || [];
  return [...new Set(matches)].filter(looksReal);
}

// Junk path patterns that mean a URL is Facebook/Instagram platform chrome — a share-widget
// action link, a share permalink, a tracking pixel, or a generic embed/plugin — never an
// actual business profile, even though it genuinely contains "facebook.com"/"instagram.com".
// sharer.php/share.php/share_channel/dialog/tr/plugins are all "click this and it acts on MY
// own logged-in account" endpoints — confirmed live: a lead's facebookUrl was saved as
// "facebook.com/share.php", which on click opens a "Create post" composer on the OPERATOR's
// own personal account, not any business page at all. `/share/<code>/` (no ".php") is
// Facebook's newer share-permalink format, generated when someone shares a page from the
// mobile app — confirmed live on a real lead's own website, whose "Facebook" link was exactly
// this kind of share permalink instead of their actual page URL.
const FACEBOOK_JUNK_PATH = /(sharer\.php|\/sharer\/|share\.php|share_channel|\/share\/|\/dialog\/|\/tr\?|\/plugins\/)/i;
const INSTAGRAM_JUNK_PATH = /\/(p|reel|explore|accounts)\//i;

// A website built on a free/cheap site builder commonly ships a "Powered by X" badge in its
// default footer template that links to the BUILDER's own social page, not the business's —
// the business never configured (or never noticed) it. Confirmed live: a real lead's own
// Wix-built site (airnizer.co) had its "Facebook" link scraped as "facebook.com/wix" — Wix's
// own corporate page, not the HVAC company's. This is the same class of problem as
// JUNK_DOMAINS below for emails (Square Online's mystore.com placeholder) — a well-known
// platform default masquerading as the business's own data. These are exact page-handle
// matches (the path segment right after the domain), not substring matches, so a real
// business whose name merely contains one of these words is never affected.
const PLATFORM_SOCIAL_HANDLES = new Set([
  'wix', 'squarespace', 'shopify', 'godaddy', 'godaddystudio', 'weebly', 'duda', 'jimdo',
  'strikingly', 'webflow', 'webnode', 'site123', 'wordpress', 'wordpressdotcom',
]);

function isPlatformOwnHandle(url) {
  const firstSegment = url.pathname.replace(/^\/+|\/+$/g, '').split('/')[0]?.toLowerCase();
  return PLATFORM_SOCIAL_HANDLES.has(firstSegment);
}

// A bare "instagram.com/" or "facebook.com/" with no path at all is a generic "follow us" icon
// a site template ships with by default that the business never actually configured with their
// real handle — it points at the PLATFORM's own homepage, not any profile. Confirmed live: a
// lead's instagramUrl/facebookUrl were both saved as exactly "instagram.com/" and
// "facebook.com/" — neither resolves to anything, let alone the business's own page.
function hasRealProfilePath(url) {
  return url.pathname.replace(/\/+$/, '').length > 0;
}

// Exported so callers that get a social URL from somewhere OTHER than scraping a page's own
// HTML (routes/scrape.js and routes/leads.js both take websiteStatus 'instagram_only'/
// 'facebook_only' leads' Google Maps "website" field and use it directly as the profile link,
// on the theory that a Maps listing whose "website" IS a social URL already points at the
// business's own profile) can validate it the same way, instead of trusting that field blindly.
// Confirmed live: real leads had a Facebook share-permalink (see FACEBOOK_JUNK_PATH above)
// saved directly as their Google Maps "website" field — the business owner had pasted a share
// link there instead of their actual page URL, and that flowed straight through unchecked.
export function isRealSocialProfileUrl(url, platform) {
  if (!url) return false;
  let parsed;
  try {
    parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
  } catch {
    return false;
  }
  const junkPath = platform === 'facebook' ? FACEBOOK_JUNK_PATH : INSTAGRAM_JUNK_PATH;
  if (junkPath.test(url)) return false;
  if (isPlatformOwnHandle(parsed)) return false;
  return hasRealProfilePath(parsed);
}

// Real business sites commonly link out to their own Instagram/Facebook in the header,
// footer, or a "follow us" block — same page load already paid for to find an email, so
// pulling these out too is free.
function extractSocialLinks($, base) {
  function firstProfileLink(hostPattern, platform) {
    const hrefs = $(`a[href*="${hostPattern}"]`)
      .toArray()
      .map(el => $(el).attr('href') || '')
      .filter(Boolean);

    for (const href of hrefs) {
      try {
        const resolved = new URL(href, base).toString();
        // Validate against the full resolved URL (query string intact) — one of the junk
        // patterns (/tr\?) specifically depends on the "?" still being present, so this must
        // run BEFORE the query gets stripped from the stored value below.
        if (isRealSocialProfileUrl(resolved, platform)) return resolved.split('?')[0];
      } catch {
        // malformed href - skip and try the next candidate
      }
    }
    return '';
  }

  return {
    instagramUrl: firstProfileLink('instagram.com', 'instagram'),
    facebookUrl: firstProfileLink('facebook.com', 'facebook'),
  };
}

async function fetchPage(url) {
  // Same fix as websiteAnalyzer.js: a self-identifying bot UA gets flat-out 403'd by basic
  // WAFs on plenty of working sites, silently starving this of an email it could've found.
  const res = await axios.get(url, {
    timeout: 8000,
    maxRedirects: 3,
    headers: {
      'User-Agent': BROWSER_UA,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    validateStatus: s => s < 500,
  });
  return res.data;
}

function findEmails(html) {
  const $ = cheerio.load(html);
  const mailtoEmails = extractFromMailto($);
  if (mailtoEmails.length > 0) return mailtoEmails;
  return extractFromText($);
}

async function findContactInfoOnSite(base) {
  const html = await fetchPage(base);
  const $ = cheerio.load(html);
  const emails = findEmails(html);
  const social = extractSocialLinks($, base);
  let email = emails[0] || '';

  if (!email) {
    const contactHref = $('a')
      .toArray()
      .map(el => $(el).attr('href') || '')
      .find(href => /contact/i.test(href));

    if (contactHref) {
      const contactUrl = new URL(contactHref, base).toString();
      const contactHtml = await fetchPage(contactUrl);
      const contactEmails = findEmails(contactHtml);
      if (contactEmails.length > 0) email = contactEmails[0];
      // A homepage that skips social links entirely sometimes still lists them in its
      // footer-less contact page (rare, but the fetch is already paid for either way).
      if (!social.instagramUrl || !social.facebookUrl) {
        const contact$ = cheerio.load(contactHtml);
        const contactSocial = extractSocialLinks(contact$, contactUrl);
        social.instagramUrl ||= contactSocial.instagramUrl;
        social.facebookUrl ||= contactSocial.facebookUrl;
      }
    }
  }

  return { email, ...social };
}

// The axios path above only ever sees a site's raw HTML response. Site builders aimed at small
// businesses (Square Online, Wix, Shopify, anything React-rendered) ship a near-empty shell and
// paint the real contact block in with JS afterwards, so the business's actual email is simply
// not in that HTML at any point — confirmed live on american-barbershop-101767.square.site,
// whose real address (a gmail one) first appears ~4s into rendering, while the raw HTML carries
// only Square's `hi@mystore.com` template placeholder. That class of site is extremely common
// among exactly the businesses this tool targets, so every one of them was silently coming back
// email-less. Rendering in a real browser is the only way to see those.
//
// Polls instead of waiting a flat delay so a site that paints its email early costs a fraction
// of the budget, while one that never has an email still gives up in bounded time.
// `sharedBrowser` — same rationale as websiteAnalyzer.js: a batch caller passes one browser for
// the whole job rather than paying a fresh Chromium launch per lead.
async function findEmailViaBrowser(base, sharedBrowser) {
  let ownBrowser;
  try {
    const browser = sharedBrowser || (ownBrowser = await chromium.launch({ headless: true }));
    const page = await browser.newPage({ userAgent: BROWSER_UA });
    try {
      await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 20000 });

      for (let waited = 0; waited <= 8000; waited += 500) {
        const html = await page.content();
        const found = findEmails(html);
        if (found.length > 0) {
          const $ = cheerio.load(html);
          return { email: found[0], ...extractSocialLinks($, base) };
        }
        await page.waitForTimeout(500);
      }

      // No email even fully rendered — still worth keeping whatever socials rendered in.
      const $ = cheerio.load(await page.content());
      return { email: '', ...extractSocialLinks($, base) };
    } finally {
      await page.close();
    }
  } catch {
    return { email: '', instagramUrl: '', facebookUrl: '' };
  } finally {
    if (ownBrowser) await ownBrowser.close();
  }
}

export async function extractContactInfoFromWebsite(website, sharedBrowser) {
  if (!website) return { email: '', instagramUrl: '', facebookUrl: '' };

  const base = website.startsWith('http') ? website : `https://${website}`;

  // A transient network blip here (not a genuinely email-less site) shouldn't cost a real
  // lead, so retry once before giving up entirely.
  let result = { email: '', instagramUrl: '', facebookUrl: '' };
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      result = await findContactInfoOnSite(base);
      break;
    } catch {
      // try again once, then fall through to the browser attempt below
    }
  }

  // Only escalate to a real browser when the cheap path actually came up empty — most sites
  // still hand over an email in their raw HTML and shouldn't pay for a page render.
  if (!result.email) {
    const rendered = await findEmailViaBrowser(base, sharedBrowser);
    return {
      email: rendered.email,
      instagramUrl: result.instagramUrl || rendered.instagramUrl,
      facebookUrl: result.facebookUrl || rendered.facebookUrl,
    };
  }

  return result;
}
