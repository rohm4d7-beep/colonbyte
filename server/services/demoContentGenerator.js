import { TEMPLATE_KEYS, ACCENT_COLORS } from '../constants/demoOptions.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

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
    },
    required: ['templateKey', 'accentColor', 'tagline', 'aboutText', 'services', 'ctaText'],
    additionalProperties: false,
  },
};

const SYSTEM_PROMPT =
  'You are a website copywriter and designer for a website agency generating an instant demo ' +
  'site for a local business, to show them what a real website could look like. Pick the ' +
  'template and accent color that best fit the business\'s category and vibe:\n' +
  '- warmLocal: restaurants, cafes, food & drink — warm, appetite-forward\n' +
  '- cleanProfessional: clinics, medical, legal, professional services — trust-forward, clean\n' +
  '- boldModern: salons, fitness, beauty, creative studios — bold, modern, energetic\n' +
  '- classicService: trades, home services, contractors — sturdy, reliable, no-nonsense\n' +
  'Write a punchy tagline (under 10 words), a grounded 2-3 sentence about paragraph using ONLY ' +
  'the facts given (never invent awards, years in business, or specifics not provided), 3-6 ' +
  'services typical for the business\'s category, and a short actionable CTA (e.g. "Book Now", ' +
  '"Get a Free Quote", "Reserve a Table") that fits the category.';

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
 * Same Structured Outputs pattern as services/aiAnalysis.js — never throws, callers get
 * { status: 'failed' } on any error so a bad key or rate limit never breaks the scrape
 * pipeline. templateKey/accentColor are constrained to curated enums (see
 * constants/demoOptions.js) so the AI can never pick an unreadable color combination.
 */
export async function generateDemoContent(lead) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { status: 'failed' };
  }

  try {
    const res = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(lead) },
        ],
        response_format: { type: 'json_schema', json_schema: RESPONSE_SCHEMA },
        temperature: 0.6,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error('[demoContentGenerator] OpenAI API error:', res.status, errBody.slice(0, 300));
      return { status: 'failed' };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return { status: 'failed' };

    const parsed = JSON.parse(content);

    return {
      templateKey: TEMPLATE_KEYS.includes(parsed.templateKey) ? parsed.templateKey : TEMPLATE_KEYS[0],
      accentColor: ACCENT_COLORS.includes(parsed.accentColor) ? parsed.accentColor : ACCENT_COLORS[0],
      tagline: parsed.tagline || '',
      aboutText: parsed.aboutText || '',
      services: Array.isArray(parsed.services) ? parsed.services : [],
      ctaText: parsed.ctaText || 'Get In Touch',
      status: 'completed',
      generatedAt: new Date(),
    };
  } catch (err) {
    console.error('[demoContentGenerator] Failed to generate demo content:', err.message);
    return { status: 'failed' };
  }
}
