import axios from 'axios';
import * as cheerio from 'cheerio';

// TLD is intentionally lowercase-only: real domains render lowercase, while text
// concatenated onto the match with no separator (e.g. a "Call" button label glued
// onto "info@site.com" during text extraction) reliably starts uppercase, so this
// stops the greedy match at the real domain boundary instead of swallowing it.
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,24}/g;
const IGNORED_EXTENSIONS = /\.(png|jpg|jpeg|gif|svg|webp|css|js)$/i;
const JUNK_DOMAINS = /(sentry|wixpress|schema\.org|w3\.org|example\.(com|org|net)|domain\.com|yourdomain|godaddy|placeholder|test\.com|email\.com|localhost|\.(png|jpg|jpeg|gif|svg|webp|css|js))$/i;

function looksReal(email) {
  const domain = email.split('@')[1] || '';
  return !IGNORED_EXTENSIONS.test(email) && !JUNK_DOMAINS.test(domain) && !JUNK_DOMAINS.test(email);
}

function extractFromMailto($) {
  // Re-run the href value through EMAIL_RE rather than trusting it verbatim — sites
  // sometimes ship malformed mailto hrefs with trailing garbage concatenated in
  // (e.g. href="mailto:info@site.aeRESERVATION").
  const emails = $('a[href^="mailto:"]')
    .toArray()
    .map(el => {
      const raw = ($(el).attr('href') || '').replace('mailto:', '').split('?')[0].trim();
      return raw.match(EMAIL_RE)?.[0] || '';
    });
  return emails.filter(Boolean).filter(looksReal);
}

function extractFromText($) {
  $('script, style, noscript').remove();
  const text = $('body').text();
  const matches = text.match(EMAIL_RE) || [];
  return [...new Set(matches)].filter(looksReal);
}

// Real business sites commonly link out to their own Instagram/Facebook in the header,
// footer, or a "follow us" block — same page load already paid for to find an email, so
// pulling these out too is free. Skip share-widget/plugin links (sharer.php, /dialog/,
// /tr?, a bare instagram.com/instagram or facebook.com/facebook.com root) which are
// platform chrome, not the business's own profile.
function extractSocialLinks($, base) {
  function firstProfileLink(hostPattern, skipPattern) {
    const href = $(`a[href*="${hostPattern}"]`)
      .toArray()
      .map(el => $(el).attr('href') || '')
      .find(h => h && !skipPattern.test(h));
    if (!href) return '';
    try {
      return new URL(href, base).toString().split('?')[0];
    } catch {
      return '';
    }
  }

  return {
    instagramUrl: firstProfileLink('instagram.com', /\/(p|reel|explore|accounts)\//i),
    facebookUrl: firstProfileLink('facebook.com', /(sharer\.php|\/dialog\/|\/tr\?|\/plugins\/)/i),
  };
}

async function fetchPage(url) {
  // Same fix as websiteAnalyzer.js: a self-identifying bot UA gets flat-out 403'd by basic
  // WAFs on plenty of working sites, silently starving this of an email it could've found.
  const res = await axios.get(url, {
    timeout: 8000,
    maxRedirects: 3,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
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

export async function extractContactInfoFromWebsite(website) {
  if (!website) return { email: '', instagramUrl: '', facebookUrl: '' };

  const base = website.startsWith('http') ? website : `https://${website}`;

  // A transient network blip here (not a genuinely email-less site) shouldn't cost a real
  // lead, so retry once before giving up entirely.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await findContactInfoOnSite(base);
    } catch {
      // try again once, then give up
    }
  }

  return { email: '', instagramUrl: '', facebookUrl: '' };
}
