import { TEMPLATE_KEYS, ACCENT_COLORS } from '../constants/demoOptions.js';
import { findStockPhoto } from './imageSearch.js';
import { fetchListingPhotos } from './listingPhotoScraper.js';
import { selectBestPhoto } from './photoSelector.js';
import { extractBrandColor, brandColorToHex } from './brandColorExtractor.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const RESPONSE_SCHEMA = {
  name: 'demo_site_content',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      templateKey: { type: 'string', enum: TEMPLATE_KEYS },
      accentColor: { type: 'string', enum: ACCENT_COLORS },
      accentColorOptions: { type: 'array', items: { type: 'string', enum: ACCENT_COLORS }, minItems: 3, maxItems: 4 },
      tagline: { type: 'string' },
      aboutText: { type: 'string' },
      services: { type: 'array', items: { type: 'string' } },
      ctaText: { type: 'string' },
      imageQuery: { type: 'string' },
    },
    required: [
      'templateKey',
      'accentColor',
      'accentColorOptions',
      'tagline',
      'aboutText',
      'services',
      'ctaText',
      'imageQuery',
    ],
    additionalProperties: false,
  },
};

const SYSTEM_PROMPT =
  'You are a website copywriter and designer for a website agency generating an instant demo ' +
  'site for a local business, to show them what a real website could look like. Pick the ' +
  'template and accent color that best fit the business\'s category and vibe. Each template ' +
  'covers a broad range of business types, not just one narrow example — match by vibe, not ' +
  'by keyword-matching the category name:\n' +
  '- warmLocal: food & drink, hospitality, travel & leisure (restaurants, cafes, bars, hotels, ' +
  'B&Bs, guesthouses, tour operators) — warm, welcoming, appetite/comfort-forward\n' +
  '- refinedEditorial: clinics, medical, legal, finance, professional & B2B services, larger ' +
  'or chain hospitality (hotel chains, business hotels) — editorial, warm-neutral, considered; ' +
  'trust-forward without reading corporate\n' +
  '- boldModern: salons, fitness, beauty, creative studios, boutique/design-led hospitality, ' +
  'retail & shops (including supermarkets, grocery stores, and other food RETAILERS — as ' +
  'opposed to places people eat, which are warmLocal) — bold, modern, energetic\n' +
  '- classicService: trades, home services, contractors, auto services — sturdy, reliable, ' +
  'no-nonsense\n' +
  '- boutiqueHeritage: real estate agencies, home builders, property developers, architecture ' +
  '& interior design, boutique/luxury retail (furniture, homewares, high-end fashion) — same ' +
  'warm-editorial family as refinedEditorial, more brochure/portfolio-led\n' +
  'When a business could reasonably fit more than one template (this is common — e.g. a hotel ' +
  'could be warmLocal or refinedEditorial depending on whether it reads boutique/cozy or ' +
  'corporate/chain), decide using the specific facts given (rating, review count, name, hours) ' +
  'rather than defaulting to the same template every time you see that category — two different ' +
  'businesses in the same category should usually NOT get identical template+color pairs unless ' +
  'their facts genuinely point the same way.\n' +
  'Also write `accentColorOptions`: 3-4 colors from the enum that would ALL look genuinely good ' +
  'on this specific business\'s site — not one "correct" color plus filler, every option in the ' +
  'list must actually fit the vibe you picked. `accentColor` must be one of them. This list gets ' +
  'reused across future regenerates for this same lead to vary the color without ever landing on ' +
  'one that clashes with the business, so it needs to hold up on its own without your reasoning ' +
  'attached — pick colors independently based on the vibe, not by rigidly pairing one color to ' +
  'one template.\n' +
  'Write a punchy tagline (under 10 words), a grounded 2-3 sentence about paragraph using ONLY ' +
  'the facts given (never invent awards, years in business, or specifics not provided), 3-6 ' +
  'services typical for the business\'s category, and a short actionable CTA (e.g. "Book Now", ' +
  '"Get a Free Quote", "Reserve a Table") that fits the category.\n' +
  'Also write `imageQuery`: a specific, visually descriptive stock-photography search query ' +
  '(4-8 words) for the hero photo — this is a demo showing the business what a GOOD site could ' +
  'look like, so describe a professionally shot, well-lit, appealing scene that fits their exact ' +
  'category and the chosen template\'s vibe (e.g. "cozy boutique hotel lobby warm lighting", ' +
  '"modern dental clinic bright interior", "rustic italian restaurant dining room candlelight", ' +
  '"upscale hair salon chic interior"). Be specific enough that two different businesses in the ' +
  'same category (e.g. two hotels) can land on different queries if their facts suggest a ' +
  'different vibe (budget vs boutique, casual vs upscale). Never include people\'s faces, brand ' +
  'names, or text/signage in the description.';

function buildUserPrompt(lead) {
  const facts = {
    businessName: lead.businessName,
    category: lead.category || 'unknown',
    rating: lead.rating ?? 'unknown',
    reviewCount: lead.reviewCount ?? 'unknown',
    address: lead.address || 'unknown',
    phone: lead.phone || 'none listed',
    openingHoursSummary: lead.openingHoursSummary || 'unknown',
  };
  return `Generate demo site content for this business:\n${JSON.stringify(facts, null, 2)}`;
}

/**
 * Same Structured Outputs pattern as services/aiAnalysis.js (Groq, OpenAI-compatible
 * endpoint) — never throws, callers get { status: 'failed' } on any error so a bad key or
 * rate limit never breaks the scrape pipeline. templateKey/accentColor are constrained to
 * curated enums (see constants/demoOptions.js) so the AI can never pick an unreadable color
 * combination.
 */
export async function generateDemoContent(lead) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { status: 'failed' };
  }

  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(lead) },
        ],
        response_format: { type: 'json_schema', json_schema: RESPONSE_SCHEMA },
        // Deliberately left at default reasoning (unlike outreachGenerator.js/aiAnalysis.js) —
        // no json_validate_failed was ever observed for this call, and this prompt's whole job
        // is per-business creative variety (see the "should NOT get identical template+color
        // pairs" instruction above); 'low' reasoning measurably narrowed that variety in testing
        // without a proven reliability need to justify the tradeoff.
        temperature: 0.9,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error('[demoContentGenerator] Groq API error:', res.status, errBody.slice(0, 300));
      return { status: 'failed' };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return { status: 'failed' };

    const parsed = JSON.parse(content);

    // Once a template has been picked for a lead, "Regenerate" must not re-roll it — the whole
    // point of regenerating (per explicit user feedback) is a fresh photo plus a light copy and
    // color touch-up, NOT a different layout each click. Re-running the same prompt at
    // temperature 0.9 legitimately produces different (each individually reasonable) template
    // picks call to call, which reads as "stuck on random themes" from the outside. Only the
    // very first generation for a lead gets to choose the template; every regenerate after that
    // keeps it locked, even though the model still returns its own (ignored) guess.
    const alreadyThemed = lead.demoSite?.status === 'completed';
    const templateKey = alreadyThemed
      ? lead.demoSite.templateKey
      : (TEMPLATE_KEYS.includes(parsed.templateKey) ? parsed.templateKey : TEMPLATE_KEYS[0]);

    // accentColor DOES shuffle every regenerate (including the first) — but only within a
    // curated 3-4 color set the AI judged as fitting this specific business, picked once and
    // reused, never from the full 8-color enum. That set is what stays business-appropriate;
    // the individual color is what's meant to visibly change on each click.
    const validParsedOptions = Array.isArray(parsed.accentColorOptions)
      ? parsed.accentColorOptions.filter((c) => ACCENT_COLORS.includes(c))
      : [];
    let accentColorOptions =
      alreadyThemed && lead.demoSite.accentColorOptions?.length > 0
        ? lead.demoSite.accentColorOptions
        : validParsedOptions.length >= 2
        ? validParsedOptions
        : [ACCENT_COLORS[0], ACCENT_COLORS[1], ACCENT_COLORS[2]];

    // First generation only (the curated set is locked after that, same as templateKey) - snap
    // a color pulled from the business's own real listing photos into the option set, so the
    // demo can actually land on something that looks like theirs instead of only ever choosing
    // from whatever the AI guessed fit the category in general. Uses lead.photos directly (not
    // the AI-selected/stock heroImage below), so this reflects the business itself even when
    // the eventual hero ends up being a stock fallback.
    let brandAccentColor = null;
    if (!alreadyThemed && lead.photos?.length > 0) {
      const dominant = await extractBrandColor(lead.photos);
      if (dominant) {
        // Used verbatim - whatever the business's actual color is (black, gold, pastel,
        // anything), not snapped to the curated ACCENT_COLORS list. Legibility against it is
        // handled at render time by each template's readableTextColor(accentColor) call, not
        // by altering the color itself here.
        brandAccentColor = brandColorToHex(dominant);
        if (!accentColorOptions.includes(brandAccentColor)) {
          accentColorOptions = [brandAccentColor, ...accentColorOptions];
        }
      }
    }

    const accentColor = brandAccentColor || accentColorOptions[Math.floor(Math.random() * accentColorOptions.length)];

    // Prefer a real, good photo of the actual business over a generic stock one — a business
    // owner wants to see their own place done justice, not a stranger's stock hotel lobby.
    // Falls through to a curated Pexels match, then to the single scraped hero photo (see the
    // demo templates), if the business has no usable real photos or the AI calls fail.
    //
    // routes/scrape.js now captures a real multi-photo gallery (up to 6) at scrape time for
    // every lead that gets saved, stored in lead.photos — use that directly rather than paying
    // for a live re-scrape on every single regenerate. Older leads scraped before that change
    // may still only have the single old hero photo, so fetchListingPhotos is kept as a
    // one-time live fallback for those, not the primary path anymore.
    const allCandidatePhotos =
      lead.photos?.length > 1 ? lead.photos : await fetchListingPhotos(lead.businessName, lead.country);

    // The vision picker is consistent — given the same candidates it reliably re-picks the
    // same "best" one, which is correct for quality but defeats "Regenerate" being the button
    // a user clicks specifically to get a new header photo. So when there's more than one real
    // candidate, drop whichever one is already showing before asking it to choose again.
    //
    // selectBestPhoto only ever evaluates the first MAX_IMAGES candidates it's given (a Groq
    // token-budget limit, see photoSelector.js) — a listing can have several more real photos
    // than that, so without shuffling, "drop the current one and take the front of the list"
    // just oscillates between whichever 2 keep landing at the front after each exclusion, never
    // reaching the rest. Shuffle first so repeated regenerates actually sample the whole pool
    // over time instead of getting stuck cycling 2 of N (confirmed live on a real lead).
    const currentHeroImage = lead.demoSite?.heroImage;
    const remainingPhotos =
      allCandidatePhotos.length > 1 ? allCandidatePhotos.filter((url) => url !== currentHeroImage) : allCandidatePhotos;
    const candidatePhotos = [...remainingPhotos].sort(() => Math.random() - 0.5);

    const heroImage =
      (await selectBestPhoto(candidatePhotos, { businessName: lead.businessName, category: lead.category })) ||
      (await findStockPhoto(parsed.imageQuery));

    return {
      templateKey,
      accentColor,
      accentColorOptions,
      tagline: parsed.tagline || '',
      aboutText: parsed.aboutText || '',
      services: Array.isArray(parsed.services) ? parsed.services : [],
      ctaText: parsed.ctaText || 'Get In Touch',
      heroImage,
      status: 'completed',
      generatedAt: new Date(),
    };
  } catch (err) {
    console.error('[demoContentGenerator] Failed to generate demo content:', err.message);
    return { status: 'failed' };
  }
}
