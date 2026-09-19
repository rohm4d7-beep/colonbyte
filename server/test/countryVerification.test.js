import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { resolveCountryCode, verifyCountry } from '../services/countryVerification.js';

describe('resolveCountryCode', () => {
  test('resolves a full country name to its ISO alpha-2 code', () => {
    assert.equal(resolveCountryCode('Australia'), 'AU');
  });

  test('passes through an already-valid 2-letter code, uppercased', () => {
    assert.equal(resolveCountryCode('au'), 'AU');
  });

  test('unrecognized input returns empty string', () => {
    assert.equal(resolveCountryCode('Nowhereland'), '');
  });

  test('empty input returns empty string', () => {
    assert.equal(resolveCountryCode(''), '');
  });
});

describe('verifyCountry', () => {
  test('coordinates inside the target country verify true', () => {
    // Sydney, Australia
    const result = verifyCountry({ lat: -33.8688, lng: 151.2093, targetCountry: 'Australia' });
    assert.equal(result.countryCode, 'AU');
    assert.equal(result.verified, true);
  });

  test('coordinates outside the target country verify false, but still report the real country found', () => {
    // Sydney, Australia, but the operator searched for the US.
    const result = verifyCountry({ lat: -33.8688, lng: 151.2093, targetCountry: 'United States' });
    assert.equal(result.countryCode, 'AU');
    assert.equal(result.verified, false);
  });

  test('coordinates take priority over a conflicting phone number', () => {
    // A real Australian +61 number, but Sydney coordinates - geo should win over phone.
    const result = verifyCountry({
      lat: -33.8688,
      lng: 151.2093,
      phone: '+1 555 123 4567',
      targetCountry: 'Australia',
    });
    assert.equal(result.signals.geo, 'AU');
    assert.equal(result.countryCode, 'AU');
    assert.equal(result.verified, true);
  });

  test('falls back to phone when no coordinates are given', () => {
    const result = verifyCountry({ phone: '+61 2 9876 5432', targetCountry: 'Australia' });
    assert.equal(result.signals.phone, 'AU');
    assert.equal(result.countryCode, 'AU');
    assert.equal(result.verified, true);
  });

  test('falls back to address only when neither coordinates nor phone are available', () => {
    const result = verifyCountry({ address: '123 Main St, Sydney, Australia', targetCountry: 'Australia' });
    assert.equal(result.signals.address, 'AU');
    assert.equal(result.verified, true);
  });

  test('no usable signal at all never verifies, even with no conflicting evidence', () => {
    const result = verifyCountry({ targetCountry: 'Australia' });
    assert.equal(result.countryCode, '');
    assert.equal(result.verified, false);
  });
});
