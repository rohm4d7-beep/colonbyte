const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const VISION_MODEL = 'qwen/qwen3.6-27b';

// Groq's docs claim qwen3.6-27b takes up to 5 images at a flat 2048 tokens each, but neither
// claim held up live: the API rejects anything past 3 ("Too many images provided"), and actual
// per-image cost varies with the image (measured 1090-1600+ tokens/image, not a flat 2048) — 3
// images reliably blew the 8000 TPM ceiling outright for some real business photos (413
// "Request too large", rejected before the call even ran), silently forcing every demo
// regenerate for that lead onto the Pexels/scraped-photo fallback instead of ever reaching a
// real per-business pick. 2 images leaves comfortable headroom (tested ~2630 tokens worst case)
// even though fetchListingPhotos can return up to 6 candidates.
const MAX_IMAGES = 2;

const SYSTEM_PROMPT =
  'You are picking the single best photo of a real business to use as the hero image on a ' +
  'demo website built to show that business what a good site could look like. The photos are ' +
  'real, scraped from the business\'s own Google Maps listing — not stock photos — so judge ' +
  'them on how they\'d actually look on a real homepage.\n' +
  'Reject: blurry or low-quality shots, awkward or confusing angles, menus/receipts/price ' +
  'lists, interior clutter with no clear subject, photos dominated by a stranger\'s face, ' +
  'screenshots, and anything a business owner would be embarrassed to see on their own site. ' +
  'Prefer a clean, well-composed exterior or interior shot that clearly represents the business.\n' +
  'Reply with ONLY a JSON object: {"bestIndex": N} where N is the 1-based index (in the order ' +
  'the images were given) of the best photo, or {"bestIndex": 0} if none of the photos clear ' +
  'the bar above.';

/**
 * Never throws — callers get null on any failure (missing key, API error, no acceptable
 * photo) and fall back to a stock photo or the single scraped hero photo.
 */
export async function selectBestPhoto(photoUrls, { businessName, category }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || !photoUrls?.length) return null;

  const candidates = photoUrls.slice(0, MAX_IMAGES);

  try {
    const content = [
      {
        type: 'text',
        text: `Business: ${businessName || 'unknown'} (category: ${category || 'unknown'}). ` +
          `${candidates.length} candidate photos follow, in order (image 1 first).`,
      },
      ...candidates.map((url) => ({ type: 'image_url', image_url: { url } })),
    ];

    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content },
        ],
        response_format: { type: 'json_object' },
        // qwen3.6-27b defaults to "thinking" mode, which for this prompt reliably burns its
        // whole output budget on reasoning tokens and returns an empty completion — Groq then
        // rejects the empty string against response_format's json_object requirement with a
        // useless "Failed to validate JSON" error. Disabling thinking fixes it (verified live).
        reasoning_effort: 'none',
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error('[photoSelector] Groq vision API error:', res.status, errBody.slice(0, 300));
      return null;
    }

    const data = await res.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
    const bestIndex = Number(parsed.bestIndex);

    if (!Number.isInteger(bestIndex) || bestIndex < 1 || bestIndex > candidates.length) return null;
    return candidates[bestIndex - 1];
  } catch (err) {
    console.error('[photoSelector] Failed to select best photo:', err.message);
    return null;
  }
}
