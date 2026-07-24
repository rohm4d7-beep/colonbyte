import axios from 'axios';
import * as cheerio from 'cheerio';

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const IGNORED_EXTENSIONS = /\.(png|jpg|jpeg|gif|svg|webp|css|js)$/i;
const JUNK_DOMAINS = /(sentry|wixpress|schema\.org|w3\.org|example\.(com|org|net)|domain\.com|yourdomain|godaddy|placeholder|test\.com|email\.com|localhost|\.(png|jpg|jpeg|gif|svg|webp|css|js))$/i;

function looksReal(email) {
  const domain = email.split('@')[1] || '';
  return !IGNORED_EXTENSIONS.test(email) && !JUNK_DOMAINS.test(domain) && !JUNK_DOMAINS.test(email);
}

function extractFromMailto($) {
  const hrefs = $('a[href^="mailto:"]')
    .toArray()
    .map(el => ($(el).attr('href') || '').replace('mailto:', '').split('?')[0].trim());
  return hrefs.filter(Boolean).filter(looksReal);
}

function extractFromText($) {
  $('script, style, noscript').remove();
  const text = $('body').text();
  const matches = text.match(EMAIL_RE) || [];
  return [...new Set(matches)].filter(looksReal);
}

async function fetchPage(url) {
  const res = await axios.get(url, {
    timeout: 8000,
    maxRedirects: 3,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DevsAuraBot/1.0)' },
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
