import Lead from '../models/Lead.js';

export function normalizePhone(phone) {
  return (phone || '').replace(/[^\d+]/g, '');
}

// Platforms where the hostname alone identifies nothing - thousands of unrelated businesses
// each have their own page under the same facebook.com/instagram.com host, so two different
// businesses' profile URLs must not collapse to the same dedup key the way two listings of a
// real business's own domain (e.g. joesplumbing.com.au) correctly do.
const SHARED_HOST_PLATFORMS = new Set([
  'facebook.com',
  'fb.com',
  'm.facebook.com',
  'business.facebook.com',
  'instagram.com',
  'twitter.com',
  'x.com',
  'linkedin.com',
  'linktr.ee',
]);

export function normalizeWebsiteDomain(website) {
  if (!website) return '';
  try {
    const url = new URL(website.startsWith('http') ? website : `https://${website}`);
    const hostname = url.hostname.replace(/^www\./, '').toLowerCase();
    if (SHARED_HOST_PLATFORMS.has(hostname)) {
      // Confirmed live: routes/scrape.js was matching every business whose Maps "website" is a
      // Facebook/Instagram profile as a "duplicate" of whichever unrelated business happened to
      // get saved first with that same bare host (e.g. every Instagram-only barbershop in a scrape
      // silently getting matched against one unrelated plumbing company's Facebook page) - the
      // namesAreSimilar guard caught the mismatch and refused to overwrite, but that also meant
      // the new, genuine lead was dropped entirely instead of being saved. Keying on host+path
      // instead makes each business's own profile URL distinct again.
      const path = url.pathname.replace(/\/+$/, '').toLowerCase();
      return `${hostname}${path}`;
    }
    return hostname;
  } catch {
    return '';
  }
}

function normalizeName(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function namesAreSimilar(a, b) {
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

  // Unlike placeId (Google's own canonical fingerprint) or a website domain (a business rarely
  // shares one), a phone number alone isn't a safe identity match on its own - a shared
  // reception line, a reused/reassigned number, or a franchise hotline can be attached to two
  // genuinely different businesses. The geo+name tier below already requires a name match on
  // top of proximity; apply the same guard here so this tier isn't the only one that would
  // match two unrelated businesses on a single coincidental signal.
  const normalizedPhone = normalizePhone(phone);
  if (normalizedPhone) {
    const byPhone = await Lead.findOne({ normalizedPhone });
    if (byPhone && namesAreSimilar(businessName, byPhone.businessName)) return byPhone;
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
