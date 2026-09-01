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

export async function extractEmailFromWebsite(website) {
  if (!website) return '';

  const base = website.startsWith('http') ? website : `https://${website}`;

  try {
    const html = await fetchPage(base);
    const emails = findEmails(html);
    if (emails.length > 0) return emails[0];

    const $ = cheerio.load(html);
    const contactHref = $('a')
      .toArray()
      .map(el => $(el).attr('href') || '')
      .find(href => /contact/i.test(href));

    if (contactHref) {
      const contactUrl = new URL(contactHref, base).toString();
      const contactHtml = await fetchPage(contactUrl);
      const contactEmails = findEmails(contactHtml);
      if (contactEmails.length > 0) return contactEmails[0];
    }
  } catch {
    return '';
  }

  return '';
}
