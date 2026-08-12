import { iso1A2Code } from '@rapideditor/country-coder';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json' with { type: 'json' };
import { parsePhoneNumberFromString } from 'libphonenumber-js';

countries.registerLocale(en);

export function resolveCountryCode(name) {
  if (!name) return '';
  const trimmed = name.trim();
  if (trimmed.length === 2 && countries.isValid(trimmed.toUpperCase())) {
    return trimmed.toUpperCase();
  }
  return countries.getAlpha2Code(trimmed, 'en') || '';
}

function countryFromAddress(address) {
  if (!address) return '';
  const parts = address.split(/,|\s-\s/).map((p) => p.trim()).filter(Boolean);
  return resolveCountryCode(parts[parts.length - 1] || '');
}

function countryFromPhone(phone) {
  if (!phone || !phone.trim().startsWith('+')) return '';
  try {
    const parsed = parsePhoneNumberFromString(phone);
    return parsed?.isValid() ? parsed.country || '' : '';
  } catch {
    return '';
  }
}

function countryFromCoordinates(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
    return '';
  }
  try {
    return iso1A2Code([lng, lat]) || '';
  } catch {
    return '';
  }
}

/**
 * Multi-layer country verification: Google Maps -> coordinates -> reverse geocoding
 * (offline, point-in-country lookup) -> compare against the operator's selected target
 * country. Coordinates are authoritative when present; phone/address only arbitrate
 * when coordinates are unavailable. No signal at all means we can't verify, so we reject
 * rather than trust the freeform address text alone (that's the bug this replaces).
 */
export function verifyCountry({ address, phone, lat, lng, targetCountry }) {
  const targetCode = resolveCountryCode(targetCountry);
  const signals = {
    geo: countryFromCoordinates(lat, lng),
    phone: countryFromPhone(phone),
    address: countryFromAddress(address),
  };

  const countryCode = signals.geo || signals.phone || signals.address || '';
  const countryName = countryCode ? countries.getName(countryCode, 'en') || countryCode : '';

  let verified = false;
  if (targetCode) {
    if (signals.geo) verified = signals.geo === targetCode;
    else if (signals.phone) verified = signals.phone === targetCode;
    else if (signals.address) verified = signals.address === targetCode;
  }

  return { countryCode, countryName, verified, signals, targetCode };
}
