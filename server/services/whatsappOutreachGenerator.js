const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const RESPONSE_SCHEMA = {
  name: 'whatsapp_outreach',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      message: { type: 'string' },
    },
    required: ['message'],
    additionalProperties: false,
  },
};

const SYSTEM_PROMPT =
  'You are a small website agency\'s founder, texting a local business owner on WhatsApp for the ' +
  'first time. Write like an actual person typed this on their phone in under a minute — not an email, ' +
  'not a marketing message. Ground every claim ONLY in the facts given — never invent customer counts, ' +
  'revenue figures, or competitor names.\n\n' +
  'CRITICAL — what the demo actually is: a static visual preview/mockup only. It shows the business\'s ' +
  'name, tagline, an about paragraph, a services list, contact info, and photos, plus a click-to-call ' +
  'button. That is ALL it does. NO booking, NO forms, NO payment, nothing measured or benchmarked. Only ' +
  'describe what a visitor will SEE, never what the site DOES.\n\n' +
  'If websiteStatus is "unverified": their site did not load for our check (likely bot protection) — we ' +
  'have NO evidence it is bad. NEVER call it broken, outdated, or lacking anything. Say plainly you tried ' +
  'to pull it up and it did not load, and offer the preview anyway.\n\n' +
  'Hard bans — never use any of them: em dashes (—) anywhere; "visual credibility", "strengthen trust", ' +
  '"elevate", "seamless", "unlock", "showcase", "in today\'s digital age", "I noticed that", "I hope this ' +
  'finds you well", "Feel free to", "at your convenience", "No pressure", "streamline"; restating the ' +
  'demo\'s own tagline back at them; any formal email opener ("Dear", a subject line) or formal closer ' +
  '("Best regards", "Sincerely", "Kind regards").\n\n' +
  'Instead: 30-60 words total (this is a text message, keep it short), one clear idea, casual and direct, ' +
  'contractions are fine (I\'d, you\'re, it\'s). Open with the single most concrete thing from the facts ' +
  'given — vary how you open from message to message (a fact, a question, an observation) rather than ' +
  'always reaching for the same "Hey, I built..." pattern; these get sent to many different businesses and ' +
  'reading identical from one to the next is exactly the tell of an automated message. State plainly what ' +
  'you built and drop the link. End with one short, direct question - no boilerplate. No ALL CAPS, no more ' +
  'than one exclamation point, at most one emoji and only if it reads natural (never required). Plain text ' +
  'only, no markdown.\n\n' +
  'After the question, on its own new line with nothing after it, sign off with exactly "The Colonbyte ' +
  'Team" — no "regards"/"best"/dash before it, no period after it. This is the one fixed element; ' +
  'everything before it should read like a different person could have plausibly typed it each time.\n\n' +
  'If demoUrl is present in the facts, the message MUST include that exact URL, unaltered. Never restate ' +
  'the aiSummary field as a sentence; read it for facts and write your own words.';

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
  return `Draft a WhatsApp outreach message for this lead:\n${JSON.stringify(facts, null, 2)}`;
}

/**
 * Same Groq Structured Outputs pattern as outreachGenerator.js - never throws, callers get
 * { status: 'failed' } on any error. Requires aiAnalysis + demoSite to already be completed
 * (routes/leads.js enforces this) so the message has real grounded content to draw on.
 */
export async function generateWhatsappOutreach(lead) {
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
        temperature: 0.5,
        reasoning_effort: 'low',
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error('[whatsappOutreachGenerator] Groq API error:', res.status, errBody.slice(0, 300));
      return { status: 'failed' };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return { status: 'failed' };

    const parsed = JSON.parse(content);

    return {
      message: parsed.message || '',
      status: 'drafted',
      generatedAt: new Date(),
    };
  } catch (err) {
    console.error('[whatsappOutreachGenerator] Failed to generate WhatsApp message:', err.message);
    return { status: 'failed' };
  }
}
