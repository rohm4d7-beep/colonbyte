import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { looksReal, findEmails, isRealSocialProfileUrl } from '../services/emailExtractor.js';

describe('looksReal', () => {
  test('accepts a genuine-looking business email', () => {
    assert.equal(looksReal('info@joesplumbing.com.au'), true);
  });

  test('rejects Square Online\'s stock placeholder domain', () => {
    // mystore.com ships in the raw HTML of every unconfigured Square site - see
    // emailExtractor.js's JUNK_DOMAINS comment for the live incident this prevents.
    assert.equal(looksReal('placeholder@mystore.com'), false);
  });

  test('rejects known junk/template domains', () => {
    assert.equal(looksReal('noreply@example.com'), false);
    // Caught via JUNK_DOMAINS' `domain\.com` alternative, not `yourdomain` itself - see the
    // "bare-word junk entries" note below for why that distinction actually matters.
    assert.equal(looksReal('info@yourdomain.com'), false);
  });

  // JUNK_DOMAINS' bare-word entries with no literal dot in their pattern (sentry, wixpress,
  // godaddy, placeholder) are anchored with a trailing $ that requires the STRING to end with
  // that exact word - since every real domain ends in a TLD, "sentry" can only ever match a
  // domain that is literally "...sentry" with nothing after it, never "sentry.io" or
  // "sentry.com". This means these four entries currently never match any real-world domain -
  // confirmed here, not fixed, since there's no confirmed live incident (unlike mystore.com,
  // which has one) to verify what the correct anchored pattern should actually be for each.
  test('known gap: bare-word junk entries with no dot in their pattern never match a real domain', () => {
    assert.equal(looksReal('test@sentry.io'), true);
    assert.equal(looksReal('info@godaddy.com'), true);
    assert.equal(looksReal('info@placeholder.com'), true);
  });

  test('rejects a match that is actually an image filename', () => {
    assert.equal(looksReal('logo@2x.png'), false);
  });
});

describe('findEmails', () => {
  test('prefers a mailto link over any plain-text email on the page', () => {
    const html = `
      <html><body>
        <p>Contact us at fallback@example.com</p>
        <a href="mailto:real@joesplumbing.com.au">Email us</a>
      </body></html>
    `;
    assert.deepEqual(findEmails(html), ['real@joesplumbing.com.au']);
  });

  test('extracts a mailto email from an <area> image-map hotspot', () => {
    const html = `<html><body><map><area href="mailto:info@caledoniaplumbing.co.uk"></map></body></html>`;
    assert.deepEqual(findEmails(html), ['info@caledoniaplumbing.co.uk']);
  });

  test('decodes a URL-encoded mailto href', () => {
    const html = `<a href="mailto:%20info@site.com">Email</a>`;
    assert.deepEqual(findEmails(html), ['info@site.com']);
  });

  test('falls back to plain text extraction when there is no mailto link', () => {
    const html = `<html><body><div>Reach us: info@joesplumbing.com.au</div></body></html>`;
    assert.deepEqual(findEmails(html), ['info@joesplumbing.com.au']);
  });

  test('inserts a word boundary at block-element edges so adjacent text does not fuse into the email', () => {
    // Cheerio's .text() concatenates raw text nodes with no separator - a "Email us" label
    // immediately followed by an "info@site.com" value block (only a rendered line break
    // between them) must not corrupt into "usinfo@site.com". See extractFromText's comment.
    const html = `<div>Email us</div><div>info@joesplumbing.com.au</div>`;
    assert.deepEqual(findEmails(html), ['info@joesplumbing.com.au']);
  });

  test('filters out junk-domain matches found in plain text', () => {
    const html = `<html><body><footer>built on mystore.com</footer></body></html>`;
    assert.deepEqual(findEmails(html), []);
  });

  test('no email anywhere on the page returns an empty array', () => {
    assert.deepEqual(findEmails('<html><body><p>No contact info here.</p></body></html>'), []);
  });
});

describe('isRealSocialProfileUrl', () => {
  test('accepts a real Facebook business page URL', () => {
    assert.equal(isRealSocialProfileUrl('https://www.facebook.com/joesplumbing', 'facebook'), true);
  });

  test('rejects a Facebook share-permalink (not an actual page)', () => {
    assert.equal(isRealSocialProfileUrl('https://www.facebook.com/share/abc123/', 'facebook'), false);
  });

  test('rejects a bare facebook.com with no profile path at all', () => {
    assert.equal(isRealSocialProfileUrl('https://www.facebook.com/', 'facebook'), false);
  });

  test('rejects a site-builder\'s own social handle (e.g. Wix\'s corporate page)', () => {
    assert.equal(isRealSocialProfileUrl('https://www.facebook.com/wix', 'facebook'), false);
  });

  test('rejects an Instagram post/reel/explore URL rather than a profile', () => {
    assert.equal(isRealSocialProfileUrl('https://www.instagram.com/p/Cabc123/', 'instagram'), false);
  });

  test('accepts a real Instagram profile URL', () => {
    assert.equal(isRealSocialProfileUrl('https://www.instagram.com/joesplumbing', 'instagram'), true);
  });

  test('empty/missing URL is never real', () => {
    assert.equal(isRealSocialProfileUrl('', 'facebook'), false);
    assert.equal(isRealSocialProfileUrl(undefined, 'facebook'), false);
  });

  test('an unparseable URL is never real', () => {
    assert.equal(isRealSocialProfileUrl('not a url ://', 'facebook'), false);
  });
});
