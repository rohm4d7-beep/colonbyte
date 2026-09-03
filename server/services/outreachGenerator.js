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
  'Make clear this preview is a rough starting point, not the finished product — the real, delivered site ' +
  'would be considerably more polished and built out than this. Say this plainly, once, in your own words ' +
  '(e.g. this is just a quick taste of the idea, the real thing would be built out properly) — don\'t list ' +
  'specific features you\'d add, since none of those are agreed yet, and don\'t undersell the preview either.\n\n' +
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
  'and write your own words.\n\n' +
  'If websiteStatus is "unverified": their site did not load for our check (likely bot protection) — we ' +
  'have NO evidence it is bad, outdated, or missing anything. NEVER describe it as broken, outdated, or ' +
  'lacking in any way. Instead say plainly that you tried to pull up their site to take a look and it ' +
  'didn\'t load for you, and offer the preview as something you put together anyway/in the meantime.';

const FOLLOWUP_SYSTEM_PROMPT =
  'You are the same small website agency founder following up on your own earlier email, since the ' +
  'business hasn\'t replied yet. Write like a real short follow-up a person sends a few days later - not ' +
  'a resend, not a recap of the whole pitch. Ground every claim ONLY in the facts given.\n\n' +
  'You will be given the ORIGINAL email you already sent (subject + body) as context - do not repeat its ' +
  'content or re-explain the demo from scratch. Assume they read it and just haven\'t responded. This is a ' +
  'brief, low-pressure nudge: one or two sentences acknowledging you\'re following up, one new small angle ' +
  'or reason to look now (if the facts support one) or just a plain "still stands, let me know" - then the ' +
  'demo link again since they may not have clicked it. 25-50 words total, not counting the sign-off.\n\n' +
  'Hard bans: "just checking in", "following up on my last email", "circling back", "bumping this up", ' +
  '"per my last message", "any update?", em dashes (—) anywhere, guilt-tripping or pressure language, ' +
  'restating the demo\'s tagline. No subject line clickbait, no ALL CAPS.\n\n' +
  'If websiteStatus is "unverified": their site did not load for our check (likely bot protection) — we ' +
  'have NO evidence it is bad, outdated, missing anything, or needs "verifying" in any SEO/Google-listing ' +
  'sense. NEVER frame it as something wrong with their site or something they should fix — that is not ' +
  'what this status means. If you mention it at all, say only that you still could not get their site to ' +
  'load, nothing more.\n\n' +
  'If demoUrl is present in the facts, the body MUST include that exact URL, unaltered, on its own line. ' +
  'Body must be plain text (no markdown, no HTML), and end with a sign-off line "The Colonbyte Team" on ' +
  'its own line, with nothing after it and no dash of any kind before it.';

function buildFacts(lead) {
  return {
    businessName: lead.businessName,
    category: lead.category || 'unknown',
    address: lead.address || 'unknown',
    websiteStatus: lead.websiteStatus,
    aiSummary: lead.aiAnalysis?.summary || 'none available',
    topSuggestion: lead.aiAnalysis?.suggestions?.[0] || 'none available',
    demoUrl: lead.demoSite?.status === 'completed' ? `${process.env.PUBLIC_BASE_URL || ''}/demo/${lead._id}` : null,
    demoTagline: lead.demoSite?.tagline || '',
  };
}

/**
 * Shared Groq Structured Outputs call for both the first email and the follow-up - never
 * throws, returns null on any error so callers can report { status: 'failed' }.
 */
async function callGroqForEmail(systemPrompt, userPrompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
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
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return { subject: parsed.subject || '', body: ensureSignOff(stripEmDashes(parsed.body || '')) };
  } catch (err) {
    console.error('[outreachGenerator] Groq call failed:', err.message);
    return null;
  }
}

// Banned in the prompt but observed live anyway (an AI-outreach tell) - a plain hyphen with
// spaces reads the same in casual text and the model reliably avoids re-adding it once it's
// not an em dash, unlike asking it not to use one at all.
function stripEmDashes(text) {
  return text.replace(/\s*—\s*/g, ' - ');
}

// The model was asked for this sign-off but doesn't reliably include it (observed live on the
// WhatsApp generator's follow-up path) - enforce it in code rather than trust the prompt
// alone for something that should never vary.
function ensureSignOff(body) {
  if (!body || /the colonbyte team\s*$/i.test(body.trim())) return body;
  return `${body.trim()}\nThe Colonbyte Team`;
}

/**
 * Requires aiAnalysis + demoSite to already be completed (routes/leads.js enforces this) so
 * the email has real grounded content to draw on.
 */
export async function generateOutreach(lead) {
  const userPrompt = `Draft an outreach email for this lead:\n${JSON.stringify(buildFacts(lead), null, 2)}`;
  const result = await callGroqForEmail(SYSTEM_PROMPT, userPrompt);
  if (!result) return { status: 'failed' };
  return { ...result, status: 'drafted', generatedAt: new Date() };
}

/**
 * Requires lead.outreach.status === 'sent' (routes/leads.js enforces this) - the follow-up
 * references the original subject/body as context so it doesn't repeat the pitch.
 */
export async function generateFollowUpEmail(lead) {
  const userPrompt =
    `The ORIGINAL email already sent:\n${JSON.stringify({ subject: lead.outreach.subject, body: lead.outreach.body }, null, 2)}\n\n` +
    `Draft a brief follow-up for this lead:\n${JSON.stringify(buildFacts(lead), null, 2)}`;
  const result = await callGroqForEmail(FOLLOWUP_SYSTEM_PROMPT, userPrompt);
  if (!result) return { status: 'failed' };
  return { ...result, status: 'drafted', generatedAt: new Date() };
}
