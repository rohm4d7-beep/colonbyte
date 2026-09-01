const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

/**
 * A scraped Google Maps hero photo is whatever Google happens to have as the first photo for
 * a listing — could be a menu card, a blurry phone snapshot, a logo, anything. For a demo site
 * meant to show a business what a *good* site could look like, a curated, professionally shot,
 * category-appropriate stock photo reads far better than an unpredictable real one. `query`
 * should be a specific, visually descriptive search string (see demoContentGenerator.js's
 * imageQuery). Never throws — callers get '' on any failure and fall back to the scraped photo.
 */
export async function findStockPhoto(query) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey || !query) return '';

  try {
    const url = `${PEXELS_API_URL}?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&size=large`;
    const res = await fetch(url, {
      headers: { Authorization: apiKey },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return '';

    const data = await res.json();
    return data.photos?.[0]?.src?.large2x || data.photos?.[0]?.src?.large || '';
  } catch {
    return '';
  }
}
