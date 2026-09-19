import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePhone, normalizeWebsiteDomain, namesAreSimilar } from '../services/leadDedup.js';

describe('normalizePhone', () => {
  test('strips formatting but keeps the leading +', () => {
    assert.equal(normalizePhone('+1 (555) 123-4567'), '+15551234567');
  });

  test('empty/missing input returns empty string', () => {
    assert.equal(normalizePhone(''), '');
    assert.equal(normalizePhone(undefined), '');
  });
});

describe('normalizeWebsiteDomain', () => {
  test('strips www and lowercases the hostname', () => {
    assert.equal(normalizeWebsiteDomain('https://WWW.JoesPlumbing.com.au/contact'), 'joesplumbing.com.au');
  });

  test('adds https when no scheme is given', () => {
    assert.equal(normalizeWebsiteDomain('joesplumbing.com.au'), 'joesplumbing.com.au');
  });

  test('keys shared-host platforms (facebook/instagram) on host+path, not just host', () => {
    // Two different businesses' Facebook pages must never collapse to the same dedup key -
    // see leadDedup.js's SHARED_HOST_PLATFORMS comment for the incident this guards against.
    const a = normalizeWebsiteDomain('https://www.facebook.com/joes-plumbing');
    const b = normalizeWebsiteDomain('https://www.facebook.com/unrelated-cafe');
    assert.notEqual(a, b);
    assert.equal(a, 'facebook.com/joes-plumbing');
  });

  test('two listings of the same real business domain still collapse to one key', () => {
    const a = normalizeWebsiteDomain('https://joesplumbing.com.au/');
    const b = normalizeWebsiteDomain('http://www.joesplumbing.com.au/services');
    assert.equal(a, b);
  });

  test('malformed URL returns empty string rather than throwing', () => {
    assert.equal(normalizeWebsiteDomain('not a url at all ://'), '');
  });

  test('empty input returns empty string', () => {
    assert.equal(normalizeWebsiteDomain(''), '');
  });
});

describe('namesAreSimilar', () => {
  test('exact match (case-insensitive)', () => {
    assert.equal(namesAreSimilar('Joes Plumbing', 'JOES PLUMBING'), true);
  });

  // normalizeName replaces each run of non-alphanumeric characters with a single space, so an
  // apostrophe splits a word rather than disappearing - "Joe's" normalizes to "joe s" (two
  // tokens), not "joes". Documented here as real, current behavior, not asserted as correct or
  // incorrect - changing it is a product decision outside this test's scope.
  test('known gap: an apostrophe splits a word instead of being dropped, so "Joe\'s" and "Joes" do not match', () => {
    assert.equal(namesAreSimilar("Joe's Plumbing", 'Joes Plumbing'), false);
  });

  test('one name containing the other counts as similar', () => {
    assert.equal(namesAreSimilar('Joes Plumbing', 'Joes Plumbing & Heating'), true);
  });

  test('unrelated names are not similar', () => {
    assert.equal(namesAreSimilar('Joes Plumbing', 'Sunset Cafe'), false);
  });

  test('either name empty is never similar', () => {
    assert.equal(namesAreSimilar('', 'Joes Plumbing'), false);
    assert.equal(namesAreSimilar('Joes Plumbing', ''), false);
  });
});
