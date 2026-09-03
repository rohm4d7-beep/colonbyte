const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const RESPONSE_SCHEMA = {
  name: 'business_analysis',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      summary: { type: 'string' },
      strengths: { type: 'array', items: { type: 'string' } },
      weaknesses: { type: 'array', items: { type: 'string' } },
      suggestions: { type: 'array', items: { type: 'string' } },
      estimatedLostCustomers: { type: 'string' },
      leadQualityScore: { type: 'integer' },
      websiteOpportunityScore: { type: 'integer' },
      revenueOpportunityEstimate: { type: 'string' },
    },
    required: [
      'summary',
      'strengths',
      'weaknesses',
      'suggestions',
      'estimatedLostCustomers',
      'leadQualityScore',
      'websiteOpportunityScore',
      'revenueOpportunityEstimate',
    ],
    additionalProperties: false,
  },
};

const SYSTEM_PROMPT =
  'You are a website-agency analyst. You are given structured data about a local business ' +
  'scraped from Google Maps. Write a grounded, honest analysis using ONLY the data provided — ' +
  'never invent facts (specific revenue figures, competitor names, customer counts) that were not ' +
  'given to you.\n' +
  'Frame "estimatedLostCustomers" (format: "X-Y per month") and "revenueOpportunityEstimate" ' +
  '(format: "$X-Y/month") as rough, hedged ranges, not guarantees — but the actual numbers MUST be ' +
  'calibrated to this specific business\'s facts, not a stock phrase reused across businesses. ' +
  'reviewCount is your strongest signal of scale: a business with thousands of reviews has vastly ' +
  'more foot traffic (and more to lose from a weak web presence) than one with a handful — its ' +
  'estimates should be a full order of magnitude larger, not the same range. Category sets the ' +
  'price point (a hotel booking vs. a dental appointment vs. a plumber\'s call-out are worth very ' +
  'different amounts) — factor that into the dollar range. Two businesses with different ' +
  'rating/reviewCount/category should essentially never land on identical numbers.\n' +
  'leadQualityScore and websiteOpportunityScore are integers from 0 to 100.';

function buildUserPrompt(lead) {
  const facts = {
    businessName: lead.businessName,
    category: lead.category || 'unknown',
    rating: lead.rating ?? 'unknown',
    reviewCount: lead.reviewCount ?? 'unknown',
    openingHoursSummary: lead.openingHoursSummary || 'unknown',
    photoCount: lead.photoCount ?? 0,
    address: lead.address || 'unknown',
    phone: lead.phone || 'none listed',
    website: lead.website || 'none',
    websiteStatus: lead.websiteStatus,
    websiteQualityScore: lead.websiteQualityScore,
  };
  return `Analyze this business:\n${JSON.stringify(facts, null, 2)}`;
}

function clampScore(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Calls Groq's Structured Outputs (strict json_schema, OpenAI-compatible endpoint) so the
 * response always matches the aiAnalysis shape — never throws, callers just get
 * { status: 'failed' } on any error so a bad/missing key or a rate limit never breaks the
 * scrape pipeline. strict json_schema is only supported on the gpt-oss models — see
 * https://console.groq.com/docs/structured-outputs
 */
export async function analyzeLead(lead) {
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
        temperature: 0.4,
        // See outreachGenerator.js's identical setting — gpt-oss-20b's default reasoning can
        // burn most of its completion-token budget before emitting the JSON, causing
        // intermittent 'Failed to validate JSON' failures. 'low' fixes that and also cuts
        // token usage well under half, easing pressure on the shared 8000 TPM budget this
        // model shares with the other two Groq calls in the pipeline.
        reasoning_effort: 'low',
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error('[aiAnalysis] Groq API error:', res.status, errBody.slice(0, 300));
      return { status: 'failed' };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return { status: 'failed' };

    const parsed = JSON.parse(content);

    return {
      summary: parsed.summary || '',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      estimatedLostCustomers: parsed.estimatedLostCustomers || '',
      leadQualityScore: clampScore(parsed.leadQualityScore),
      websiteOpportunityScore: clampScore(parsed.websiteOpportunityScore),
      revenueOpportunityEstimate: parsed.revenueOpportunityEstimate || '',
      status: 'completed',
      analyzedAt: new Date(),
    };
  } catch (err) {
    console.error('[aiAnalysis] Failed to analyze lead:', err.message);
    return { status: 'failed' };
  }
}
