import axios from 'axios';
import * as cheerio from 'cheerio';

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

/**
 * Rule-based website classification + quality score (0-100), no AI calls.
 * Anything other than a solid `has_website` result is flagged highPriority,
 * since those are the businesses that actually need a new site.
 */
export async function analyzeWebsite(website) {
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

  let res;
  try {
    res = await axios.get(url, {
      timeout: 8000,
      maxRedirects: 3,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ColonByteBot/1.0)' },
      validateStatus: (s) => s < 500,
    });
  } catch {
    return { status: 'broken', websiteQualityScore: 0, highPriority: true };
  }

  if (!res || res.status >= 400 || typeof res.data !== 'string') {
    return { status: 'broken', websiteQualityScore: 0, highPriority: true };
  }

  const $ = cheerio.load(res.data);

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
