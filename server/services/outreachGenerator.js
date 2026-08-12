const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const RESPONSE_SCHEMA = {
  name: 'outreach_email',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      subject: { type: 'string' },
      body: { type: 'string' },
    },
    required: ['subject', 'body'],
    additionalProperties: false,
  },
};

const SYSTEM_PROMPT =
  'You are an outreach copywriter for a website agency, drafting a first-contact cold email to a ' +
  'local business owner on behalf of the agency. Ground every claim ONLY in the facts given — never ' +
  'invent specific customer counts, revenue figures, or competitor names. Keep it short (120-180 words), ' +
  'friendly, and non-salesy: open with one specific, genuine observation about their business, mention ' +
  'the free demo website already built for them with the link provided, note briefly what it would help ' +
  'with (grounded in the analysis given, not invented), and end with a low-pressure call to reply or book ' +
  'a quick call. No subject line clickbait, no ALL CAPS, no more than one exclamation point total. Body ' +
  'must be plain text (no markdown, no HTML) with paragraphs separated by a blank line, and must end with ' +
  'a sign-off line "— The Colonbyte Team" with nothing after it.';

function buildUserPrompt(lead) {
  const facts = {
    businessName: lead.businessName,
    category: lead.category || 'unknown',
    address: lead.address || 'unknown',
    websiteStatus: lead.websiteStatus,
    aiSummary: lead.aiAnalysis?.summary || 'none available',
    topSuggestion: lead.aiAnalysis?.suggestions?.[0] || 'none available',
    demoUrl: lead.demoSite?.status === 'completed' ? `${process.env.PUBLIC_BASE_URL || ''}/demo/${lead._id}` : null,
    demoTagline: lead.demoSite?.tagline || '',
  };
  return `Draft an outreach email for this lead:\n${JSON.stringify(facts, null, 2)}`;
}

/**
 * Same OpenAI Structured Outputs pattern as services/aiAnalysis.js — never throws, callers
 * get { status: 'failed' } on any error. Requires aiAnalysis + demoSite to already be
 * completed (routes/leads.js enforces this) so the email has real grounded content to draw on.
 */
export async function generateOutreach(lead) {
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
        temperature: 0.5,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error('[outreachGenerator] OpenAI API error:', res.status, errBody.slice(0, 300));
      return { status: 'failed' };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return { status: 'failed' };

    const parsed = JSON.parse(content);

    return {
      subject: parsed.subject || '',
      body: parsed.body || '',
      status: 'drafted',
      generatedAt: new Date(),
    };
  } catch (err) {
    console.error('[outreachGenerator] Failed to generate outreach email:', err.message);
    return { status: 'failed' };
  }
}
