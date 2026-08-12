import Lead from '../models/Lead.js';

export function normalizePhone(phone) {
  return (phone || '').replace(/[^\d+]/g, '');
}

export function normalizeWebsiteDomain(website) {
  if (!website) return '';
  try {
    const url = new URL(website.startsWith('http') ? website : `https://${website}`);
    return url.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function normalizeName(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function namesAreSimilar(a, b) {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Finds an existing Lead matching the incoming item, checked in order of confidence:
 * Google's own place fingerprint > phone number > website domain > name+proximity.
 * Returns the existing doc (caller should update it) or null (caller should insert).
 */
export async function findDuplicateLead({ businessName, phone, website, lat, lng, placeId }) {
  if (placeId) {
    const byPlaceId = await Lead.findOne({ placeId });
    if (byPlaceId) return byPlaceId;
  }

  const normalizedPhone = normalizePhone(phone);
  if (normalizedPhone) {
    const byPhone = await Lead.findOne({ normalizedPhone });
    if (byPhone) return byPhone;
  }

  const websiteDomain = normalizeWebsiteDomain(website);
  if (websiteDomain) {
    const byWebsite = await Lead.findOne({ websiteDomain });
    if (byWebsite) return byWebsite;
  }

  if (typeof lat === 'number' && typeof lng === 'number') {
    const candidates = await Lead.find({
      lat: { $gte: lat - 0.001, $lte: lat + 0.001 },
      lng: { $gte: lng - 0.001, $lte: lng + 0.001 },
    }).limit(20);

    for (const candidate of candidates) {
      if (
        typeof candidate.lat === 'number' &&
        typeof candidate.lng === 'number' &&
        haversineMeters(lat, lng, candidate.lat, candidate.lng) < 50 &&
        namesAreSimilar(businessName, candidate.businessName)
      ) {
        return candidate;
      }
    }
  }

  return null;
}
