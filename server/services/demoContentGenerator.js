import { TEMPLATE_KEYS, ACCENT_COLORS } from '../constants/demoOptions.js';
import { findStockPhoto } from './imageSearch.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const RESPONSE_SCHEMA = {
  name: 'demo_site_content',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      templateKey: { type: 'string', enum: TEMPLATE_KEYS },
      accentColor: { type: 'string', enum: ACCENT_COLORS },
      tagline: { type: 'string' },
      aboutText: { type: 'string' },
      services: { type: 'array', items: { type: 'string' } },
      ctaText: { type: 'string' },
      imageQuery: { type: 'string' },
    },
    required: ['templateKey', 'accentColor', 'tagline', 'aboutText', 'services', 'ctaText', 'imageQuery'],
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
  '- cleanProfessional: clinics, medical, legal, finance, professional & B2B services, larger ' +
  'or chain hospitality (hotel chains, business hotels) — trust-forward, clean, understated\n' +
  '- boldModern: salons, fitness, beauty, creative studios, boutique/design-led hospitality, ' +
  'retail & shops — bold, modern, energetic\n' +
  '- classicService: trades, home services, contractors, auto services — sturdy, reliable, ' +
  'no-nonsense\n' +
  'When a business could reasonably fit more than one template (this is common — e.g. a hotel ' +
  'could be warmLocal or cleanProfessional depending on whether it reads boutique/cozy or ' +
  'corporate/chain), decide using the specific facts given (rating, review count, name, hours) ' +
  'rather than defaulting to the same template every time you see that category — two different ' +
  'businesses in the same category should usually NOT get identical template+color pairs unless ' +
  'their facts genuinely point the same way. Pick the accent color independently based on the ' +
  'same vibe, not by rigidly pairing one color to one template.\n' +
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
    const heroImage = await findStockPhoto(parsed.imageQuery);

    return {
      templateKey: TEMPLATE_KEYS.includes(parsed.templateKey) ? parsed.templateKey : TEMPLATE_KEYS[0],
      accentColor: ACCENT_COLORS.includes(parsed.accentColor) ? parsed.accentColor : ACCENT_COLORS[0],
      tagline: parsed.tagline || '',
      aboutText: parsed.aboutText || '',
      services: Array.isArray(parsed.services) ? parsed.services : [],
      ctaText: parsed.ctaText || 'Get In Touch',
      // Falls back to the scraped Google Maps photo (see the demo templates) if no
      // PEXELS_API_KEY is configured or no good match is found.
      heroImage,
      status: 'completed',
      generatedAt: new Date(),
    };
  } catch (err) {
    console.error('[demoContentGenerator] Failed to generate demo content:', err.message);
    return { status: 'failed' };
  }
}
