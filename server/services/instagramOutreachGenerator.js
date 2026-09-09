import { groqFetch } from './groqClient.js';

const RESPONSE_SCHEMA = {
  name: 'instagram_outreach',
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
  'You are writing on behalf of a small website agency\'s team, sending a local business a DM on Instagram ' +
  'for the first time. Write in first person PLURAL throughout - "we"/"our"/"us", never "I"/"my"/"me" - ' +
  'this matches the sign-off ("The Colonbyte Team"). Instagram DMs get skimmed in seconds between other ' +
  'messages - shorter and more casual than a WhatsApp text, still professional, never corporate. Ground ' +
  'every claim ONLY in the facts given - never invent customer counts, revenue figures, or competitor ' +
  'names.\n\n' +
  'primaryOpportunity is not always about the website - it may be a specific observation about how the ' +
  'business handles customer questions, bookings, or enquiries, pointing toward an AI assistant, ' +
  'automation, or software opportunity instead. Write about whatever primaryOpportunity actually ' +
  'describes - never force in "your site" language when it is not about the site. If primaryOpportunity ' +
  'points to a missing contact method (phone, email, website, booking link, etc.), never state or imply ' +
  'it is costing the business customers or bookings, or that adding one would increase conversions. Note ' +
  'the absence plainly, then ask how they currently handle enquiries through that channel - never assert ' +
  'a problem on their behalf.\n\n' +
  'The facts include a demoUrl only when a demo has already been prepared AND the sender has deliberately ' +
  'chosen to attach it to THIS message. Most first DMs will NOT have one - that is normal, not missing. ' +
  'Follow whichever mode matches what you were given:\n\n' +
  'MODE A - no demoUrl: Do not mention, hint at, or imply any demo/preview/mockup/concept exists. Never ' +
  'say "we put together", "we made you something", "check this out", or similar. Base the whole DM on the ' +
  'ONE specific, factual thing in primaryOpportunity - if it doesn\'t already come with a brief reason it\'s ' +
  'worth asking about, add one short clause yourself before the question so the message doesn\'t read as a ' +
  'random fact from a stranger - then a short, casual, low-pressure question aimed at starting a ' +
  'conversation - nothing to offer yet, just a reason to reply.\n\n' +
  'MODE B - demoUrl present: what the demo actually is - a static visual preview/mockup only, showing the ' +
  'business\'s name, tagline, an about paragraph, services, contact info, and photos, plus a click-to-call ' +
  'button. That is ALL it does. NO booking, NO forms, NO payment, nothing measured or benchmarked. Only ' +
  'describe what a visitor will SEE, never what the site DOES. In passing, make clear it\'s a rough first ' +
  'pass, not the finished product - a few words is enough, this is a DM, not an essay.\n\n' +
  'If websiteStatus is "unverified": their site did not load for our check (likely bot protection) - we ' +
  'have NO evidence it is bad. NEVER call it broken, outdated, or lacking anything. If you mention it at ' +
  'all, say only that it did not load for us when we looked - and only pair that with the preview if ' +
  'you\'re in MODE B.\n\n' +
  'Hard bans - never use any of them: em dashes anywhere; "visual credibility", "strengthen trust", ' +
  '"elevate", "seamless", "unlock", "showcase", "in today\'s digital age", "we noticed that", "we hope this ' +
  'finds you well", "Feel free to", "at your convenience", "No pressure", "streamline"; restating the ' +
  'demo\'s own tagline; "Dear", a subject line, or any formal closer ("Best regards", "Sincerely").\n\n' +
  'If primaryOpportunity already includes a short clause on why the observation is worth asking about, ' +
  'keep it - trim elsewhere for length rather than compressing it away, since dropping it is what makes a ' +
  'DM read like a random fact from a stranger instead of someone with an actual reason to be asking.\n\n' +
  'Instead: 20-40 words total (Instagram DMs are read on a phone screen, keep it tight), one clear idea, ' +
  'casual and direct, contractions are fine. Vary the opener from message to message (a fact, a quick ' +
  'question, an observation) rather than always the same pattern - these go to different businesses and an ' +
  'identical opener every time is exactly what reads as automated. In MODE B, state what we built and ' +
  'drop the link; in MODE A, go straight to the observation and question. No ALL CAPS, at most one ' +
  'exclamation point, at most one emoji and only if it reads natural (never required). Plain text only.\n\n' +
  'After the question, on its own new line with nothing after it, sign off with exactly "The Colonbyte ' +
  'Team" - no "regards"/"best"/dash before it, no period after it.\n\n' +
  'If demoUrl is present in the facts (MODE B), the message MUST include that exact URL, unaltered. If ' +
  'demoUrl is absent (MODE A), the message must contain no link of any kind. Never restate the aiSummary ' +
  'field as a sentence; read it for facts and write your own words.';

function buildFacts(lead, { includeDemo = false } = {}) {
  const demoCompleted = lead.demoSite?.status === 'completed';
  const opportunity = lead.opportunityAnalysis;
  const hasOpportunityAngle = opportunity?.status === 'completed' && !!opportunity.outreachAngle;
  return {
    businessName: lead.businessName,
    category: lead.category || 'unknown',
    address: lead.address || 'unknown',
    websiteStatus: lead.websiteStatus,
    aiSummary: lead.aiAnalysis?.summary || 'none available',
    primaryOpportunity: hasOpportunityAngle
      ? opportunity.outreachAngle
      : lead.aiAnalysis?.opportunity || lead.aiAnalysis?.suggestions?.[0] || 'none available',
    demoUrl: includeDemo && demoCompleted ? `${process.env.PUBLIC_BASE_URL || ''}/demo/${lead._id}` : null,
    demoTagline: includeDemo && demoCompleted ? lead.demoSite.tagline || '' : '',
  };
}

/**
 * Same Structured Outputs pattern as whatsappOutreachGenerator.js - never throws, returns null
 * on any error so callers can report { status: 'failed' }.
 */
async function callGroqForMessage(systemPrompt, userPrompt) {
  try {
    const res = await groqFetch({
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_schema', json_schema: RESPONSE_SCHEMA },
      temperature: 0.5,
      reasoning_effort: 'low',
    });
    if (!res) return null;

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error('[instagramOutreachGenerator] Groq API error:', res.status, errBody.slice(0, 300));
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return { message: ensureSignOff(stripEmDashes(parsed.message || '')) };
  } catch (err) {
    console.error('[instagramOutreachGenerator] Groq call failed:', err.message);
    return null;
  }
}

function stripEmDashes(text) {
  return text.replace(/\s*—\s*/g, ' - ');
}

function ensureSignOff(message) {
  if (!message || /the colonbyte team\s*$/i.test(message.trim())) return message;
  return `${message.trim()}\nThe Colonbyte Team`;
}

/**
 * Requires aiAnalysis to already be completed (routes/leads.js enforces this) so the message
 * has real grounded content to draw on. The demo is NOT required - includeDemo is a manual,
 * per-call choice (see buildFacts), same policy as outreachGenerator.js/whatsappOutreachGenerator.js.
 */
export async function generateInstagramOutreach(lead, { includeDemo = false } = {}) {
  const userPrompt = `Draft an Instagram DM for this lead:\n${JSON.stringify(buildFacts(lead, { includeDemo }), null, 2)}`;
  const result = await callGroqForMessage(SYSTEM_PROMPT, userPrompt);
  if (!result) return { status: 'failed' };
  return { ...result, status: 'drafted', generatedAt: new Date() };
}
