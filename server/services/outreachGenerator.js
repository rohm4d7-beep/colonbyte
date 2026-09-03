const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

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
  'You are a small website agency\'s founder, personally emailing a local business owner for the first ' +
  'time. Write like an actual person typed this in two minutes on their laptop — not like an AI, not like ' +
  'a marketing template. Ground every claim ONLY in the facts given — never invent customer counts, ' +
  'revenue figures, or competitor names.\n\n' +
  'CRITICAL — what the demo actually is: a static visual preview/mockup only. It shows the business\'s ' +
  'name, tagline, an about paragraph, a services list, contact info (address/phone/hours), and photos, ' +
  'plus a button that is a plain click-to-call link. That is ALL it does. It has NO booking system, NO ' +
  'forms, NO payment processing, NO live/backend functionality of any kind, and nothing on it is measured ' +
  'or benchmarked. NEVER claim or imply it does any of the following, even loosely: online booking or ' +
  'reservations, contact/booking forms, "loads faster" or any other speed/performance comparison, being ' +
  '"up to date" or "current" (that\'s not a property a static preview has), or anything the recipient could ' +
  'reasonably click and find isn\'t there. Only describe what a visitor will actually SEE (the info, the ' +
  'photos, the design, the phone link) — never what the site DOES.\n\n' +
  'Hard bans, because these are the exact tells of AI-written outreach — never use any of them: ' +
  'em dashes (—) anywhere, including the sign-off; the words/phrases "visual credibility", "strengthen ' +
  'trust", "tailor the layout to match your brand", "elevate", "seamless", "unlock", "showcase", "in ' +
  'today\'s digital age", "I noticed that", "I hope this finds you well", "Feel free to", "at your ' +
  'convenience", "No pressure", "just reply or book a quick call", "streamline"; any sentence that ' +
  'restates the demo\'s own tagline back at them; three-paragraph structure where paragraph 2 is a ' +
  'bulleted-sounding list of benefits in prose form.\n\n' +
  'Instead: 60-120 words total, one clear idea, sentences of different lengths (some short, some longer — ' +
  'not uniform), contractions are fine (I\'d, you\'re, it\'s). Open with the single most concrete, specific ' +
  'thing from the facts given — not a generic compliment. State plainly what you built (a preview site) and ' +
  'drop the link. Close with one plain, direct question or ask — no boilerplate softener sentence about ' +
  'pressure. No subject line clickbait, no ALL CAPS, no exclamation points unless something genuinely ' +
  'warrants one (rare). Body must be plain text (no markdown, no HTML), and end with a sign-off line ' +
  '"The Colonbyte Team" on its own line, with nothing after it and no dash of any kind before it.\n\n' +
  'If demoUrl is present in the facts, the body MUST include that exact URL, unaltered, on its own line — ' +
  'never paraphrase it away or drop it. Never restate the aiSummary field as a sentence; read it for facts ' +
  'and write your own words.';

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
 * Same Groq Structured Outputs pattern as services/aiAnalysis.js — never throws, callers
 * get { status: 'failed' } on any error. Requires aiAnalysis + demoSite to already be
 * completed (routes/leads.js enforces this) so the email has real grounded content to draw on.
 */
export async function generateOutreach(lead) {
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
        // gpt-oss-20b reasons by default, and this prompt's long list of hard constraints
        // (banned phrases, exact formatting rules) pushes it to reason hard about satisfying
        // all of them — measured live: it was burning ~1500-1600 of its ~1700-1700 completion
        // tokens on reasoning alone, a 50% failure rate from simply running out of budget
        // before finishing. 'low' cut that to ~30-100 reasoning tokens with no quality loss
        // and a 100% success rate across repeated live tests.
        reasoning_effort: 'low',
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error('[outreachGenerator] Groq API error:', res.status, errBody.slice(0, 300));
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
