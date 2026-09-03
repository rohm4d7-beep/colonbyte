import cities from 'all-the-cities';

// A country-level Maps search (e.g. "dentist Russia") is NOT actually nationwide - Google
// Maps' local pack is inherently location-centered, and a bare country name just gets
// Google's own single-city guess (confirmed live: "dentist Russia" returned only Moscow-area
// results, same handful regardless of scrolling). Real country coverage means running the
// search once per major city and merging results - this picks which cities, from GeoNames
// population data (via the all-the-cities package) rather than a hand-typed list, so it
// covers every supported country without guessing city names from memory.
const CITIES_PER_COUNTRY = 5;

let byCountry = null;

function index() {
  if (byCountry) return byCountry;
  byCountry = new Map();
  for (const city of cities) {
    const list = byCountry.get(city.country);
    if (list) list.push(city);
    else byCountry.set(city.country, [city]);
  }
  return byCountry;
}

// Returns up to CITIES_PER_COUNTRY city names for a given ISO 3166-1 alpha-2 country code,
// largest population first. Empty array for an unrecognized code - callers should fall back
// to a plain country-level search rather than fail the job.
export function topCitiesForCountry(countryCode) {
  if (!countryCode) return [];
  const list = index().get(countryCode.toUpperCase());
  if (!list) return [];
  return [...list]
    .sort((a, b) => b.population - a.population)
    .slice(0, CITIES_PER_COUNTRY)
    .map((c) => c.name);
}
