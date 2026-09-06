import axios from 'axios';
import sharp from 'sharp';

// Demo colors used to be picked purely by AI vibe-matching against a fixed palette, blind to
// what the business actually looks like — confirmed live: a hair salon whose real interior
// reads soft pink got handed teal/violet/orange/blue, none of which the owner would recognize
// as "theirs". This pulls the actual color from their own real photos instead of guessing from
// a category, and returns it completely unmodified (black, gold, pastel, anything) rather than
// forcing it onto one of a handful of preset swatches or darkening it for contrast — legibility
// against it is handled separately per-template via shared.js's readableTextColor(), which
// picks white or dark text to sit on top of whatever this color actually is.
function toHex({ r, g, b }) {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Downsamples an image to a single pixel (sharp's resize reducer averages the source into
 * it) to get one representative RGB color — cheap and good enough for "what tone is this
 * photo" without a full palette-clustering library.
 */
export async function extractDominantColor(imageUrl) {
  if (!imageUrl) return null;
  try {
    const res = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 8000,
      maxRedirects: 3,
    });
    const { data } = await sharp(res.data)
      .resize(1, 1, { fit: 'cover' })
      .raw()
      .toBuffer({ resolveWithObject: true });
    return { r: data[0], g: data[1], b: data[2] };
  } catch {
    return null;
  }
}

function saturation({ r, g, b }) {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const lightness = (max + min) / 2;
  if (max === min) return 0;
  const d = max - min;
  return lightness > 0.5 ? d / (2 - max - min) : d / (max + min);
}

// A single photo's average color is often just whatever neutral surface (flooring, walls,
// furniture) fills most of the frame - confirmed live: Smith Hair Studio's first photo
// averaged to a generic warm brown from marble/wood, while their 4th photo averaged to a
// genuine light pink. Sampling several real photos and keeping the most saturated result
// favors an intentional color choice (a pink accent wall, signage, branded decor) over
// incidental neutral surfaces, which is a better proxy for "their actual brand color" than
// just taking whichever photo happened to be scraped first.
export async function extractBrandColor(photoUrls) {
  const candidates = (photoUrls || [])
    .filter((url) => url && !url.includes('streetviewpixels-pa.googleapis.com'))
    .slice(0, 4);

  let best = null;
  let bestSaturation = -1;
  for (const url of candidates) {
    const rgb = await extractDominantColor(url);
    if (rgb && saturation(rgb) > bestSaturation) {
      bestSaturation = saturation(rgb);
      best = rgb;
    }
  }
  return best;
}

// The entry point demoContentGenerator.js uses: real extracted RGB -> hex, verbatim, no
// palette snapping and no darkening.
export function brandColorToHex(rgb) {
  return toHex(rgb);
}
