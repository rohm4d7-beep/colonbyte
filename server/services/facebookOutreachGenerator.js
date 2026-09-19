import { groqFetch } from './groqClient.js';

// See outreachGenerator.js's identical constant - bumped whenever SYSTEM_PROMPT/
// FOLLOWUP_SYSTEM_PROMPT changes meaningfully, stored on every generated message.
const PROMPT_VERSION = 'v1';

const RESPONSE_SCHEMA = {
  name: 'facebook_outreach',
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
  'You are writing on behalf of a small website agency\'s team, messaging a local business page on ' +
  'Facebook Messenger for the first time. Write in first person PLURAL throughout - "we"/"our"/"us", never ' +
  '"I"/"my"/"me" - this matches the sign-off ("The Colonbyte Team"). Facebook Messenger reads more like a ' +
  'normal conversation than Instagram DMs or a text - plain, direct, a little more room to explain than ' +
  'Instagram, still nowhere near an email. Ground every claim ONLY in the facts given - never invent ' +
  'customer counts, revenue figures, or competitor names.\n\n' +
  'primaryOpportunity is not always about the website - it may be a specific observation about how the ' +
  'business handles customer questions, bookings, or enquiries, pointing toward an AI assistant, ' +
  'automation, or software opportunity instead. Write about whatever primaryOpportunity actually ' +
  'describes - never force in "your site" language when it is not about the site. If primaryOpportunity ' +
  'points to a missing contact method (phone, email, website, booking link, etc.), never state or imply ' +
  'it is costing the business customers or bookings, or that adding one would increase conversions. Note ' +
  'the absence plainly, then ask how they currently handle enquiries through that channel - never assert ' +
  'a problem on their behalf.\n\n' +
  'The facts include a demoUrl only when a demo has already been prepared AND the sender has deliberately ' +
  'chosen to attach it to THIS message. Most first messages will NOT have one - that is normal, not ' +
  'missing. Follow whichever mode matches what you were given:\n\n' +
  'MODE A - no demoUrl: Do not mention, hint at, or imply any demo/preview/mockup/concept exists. Never ' +
  'say "we put together", "we made you something", "take a look", or similar. Base the whole message on the ' +
  'ONE specific, factual thing in primaryOpportunity - if it doesn\'t already come with a brief reason it\'s ' +
  'worth asking about, add one short clause yourself before the question so the message doesn\'t read as a ' +
  'random fact from a stranger - then a plain, direct, low-pressure question aimed at starting a ' +
  'conversation - nothing to offer yet, just a reason to reply.\n\n' +
  'MODE B - demoUrl present: what the demo actually is - a static visual preview/mockup only, showing the ' +
  'business\'s name, tagline, an about paragraph, services, contact info, and photos, plus a click-to-call ' +
  'button. That is ALL it does. NO booking, NO forms, NO payment, nothing measured or benchmarked. Only ' +
  'describe what a visitor will SEE, never what the site DOES. Mention in passing that it\'s a rough first ' +
  'pass, not the finished product - a short phrase is enough.\n\n' +
  'If websiteStatus is "unverified": their site did not load for our check (likely bot protection) - we ' +
  'have NO evidence it is bad. NEVER call it broken, outdated, or lacking anything. If you mention it at ' +
  'all, say only that it did not load for us when we looked - and only pair that with the preview if ' +
  'you\'re in MODE B.\n\n' +
  'Hard bans - never use any of them: em dashes, en dashes, or non-breaking hyphens anywhere - use a ' +
  'plain ASCII hyphen (-) for any compound word (e.g. "follow-up"), never a special dash character; ' +
  '"visual credibility", "strengthen trust", ' +
  '"elevate", "seamless", "unlock", "showcase", "in today\'s digital age", "we noticed that", "we hope this ' +
  'finds you well", "Feel free to", "at your convenience", "No pressure", "streamline"; restating the ' +
  'demo\'s own tagline; "Dear", a subject line, or any formal closer ("Best regards", "Sincerely").\n\n' +
  'If primaryOpportunity already includes a short clause on why the observation is worth asking about, ' +
  'keep it - trim elsewhere for length rather than compressing it away, since dropping it is what makes a ' +
  'message read like a random fact from a stranger instead of someone with an actual reason to be asking.\n\n' +
  'Instead: 30-60 words total, one clear idea, conversational and simple - like typing a message to someone ' +
  'you just want a quick answer from, not composing anything. Contractions are fine. Vary the opener from ' +
  'message to message (a fact, a quick question, an observation) rather than always the same pattern - ' +
  'these go to different businesses and an identical opener every time is exactly what reads as automated. ' +
  'In MODE B, state what we built and drop the link; in MODE A, go straight to the observation and ' +
  'question. No ALL CAPS, at most one exclamation point, at most one emoji and only if it reads natural ' +
  '(never required). Plain text only.\n\n' +
  'After the question, on its own new line with nothing after it, sign off with exactly "The Colonbyte ' +
  'Team" - no "regards"/"best"/dash before it, no period after it.\n\n' +
  'If demoUrl is present in the facts (MODE B), the message MUST include that exact URL, unaltered. If ' +
  'demoUrl is absent (MODE A), the message must contain no link of any kind. Never restate the aiSummary ' +
  'field as a sentence; read it for facts and write your own words.';

const FOLLOWUP_SYSTEM_PROMPT =
  'You are writing on behalf of the same small website agency team, sending a short Facebook Messenger ' +
  'follow-up, since the business hasn\'t replied to the first message yet. Write in first person PLURAL ' +
  'throughout - "we"/"our"/"us", never "I"/"my"/"me" - matching the "The Colonbyte Team" sign-off. You ' +
  'will be given the ORIGINAL message already sent as context - do not repeat its content or re-explain ' +
  'the demo from scratch, they already read it.\n\n' +
  'The facts include a demoUrl only when a demo has been prepared AND the sender has chosen to attach it ' +
  'to THIS message - most follow-ups will NOT have one.\n\n' +
  'If demoUrl is absent: a brief, casual, low-pressure nudge with no demo to mention - "still around if ' +
  'you want to chat" or a small new angle if the facts genuinely support one. Do not invent or imply a ' +
  'demo exists. 10-25 words.\n\n' +
  'If demoUrl is present: same casual, low-pressure nudge, but now with something to point to - "put ' +
  'together a quick preview, still around if you want to take a look" plus the link (they may not have ' +
  'clicked it). 15-30 words.\n\n' +
  'Hard bans: "just checking in", "following up", "circling back", "bumping this", "any update?", em ' +
  'dashes, en dashes, or non-breaking hyphens anywhere (use a plain ASCII hyphen for compound words), ' +
  'guilt-tripping or pressure language, restating the demo\'s tagline, any formal email opener/closer. No ' +
  'ALL CAPS, at most one emoji only if natural.\n\n' +
  'If websiteStatus is "unverified": their site did not load for our check (likely bot protection) - we ' +
  'have NO evidence it is bad or needs "verifying" in any SEO/Google-listing sense. NEVER frame it as ' +
  'something wrong with their site. If you mention it at all, say only that it still would not load for ' +
  'you, nothing more.\n\n' +
  'If demoUrl is present in the facts, the message MUST include that exact URL, unaltered. If demoUrl is ' +
  'absent, the message must contain no link of any kind. After the message, on its own new line with ' +
  'nothing after it, sign off with exactly "The Colonbyte Team" - no "regards"/"best"/dash before it, no ' +
  'period after it.';

// Same fix as outreachGenerator.js's STRUCTURE_VARIANTS - see whatsappOutreachGenerator.js's
// identical comment for why a prompt-only "vary the opener" instruction doesn't work in practice.
const STRUCTURE_VARIANTS = [
  'Open with the observation as its own short, plain sentence. Add the reasoning as a separate short sentence after it, not a dash-linked clause. End with a plain, direct question.',
  'Open by leading with the question itself, weaving the observation into the same sentence as part of the reasoning behind asking it.',
  'Open with a very short, blunt statement of the observation (5-10 words), no lead-in. Follow with one sentence of reasoning. Close with a curious, informal question.',
  'Open with a quick, casual aside about their business before naming the specific observation, then the question.',
];

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
      console.error('[facebookOutreachGenerator] Groq API error:', res.status, errBody.slice(0, 300));
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return { message: ensureSignOff(normalizeDashes(parsed.message || '')) };
  } catch (err) {
    console.error('[facebookOutreachGenerator] Groq call failed:', err.message);
    return null;
  }
}

function normalizeDashes(text) {
  return text
    .replace(/\s*[—–]\s*/g, ' - ')
    .replace(/‑/g, '-');
}

// The model's spacing before the sign-off varies (crammed onto the same line, a single
// newline, or a proper blank line) whenever it includes one itself - strip whatever it added
// and reapply with consistent spacing, rather than only filling in a sign-off that's fully
// absent and trusting the model's spacing otherwise.
function ensureSignOff(message) {
  if (!message) return message;
  const withoutSignOff = message.replace(/\s*the colonbyte team\s*$/i, '').trim();
  return `${withoutSignOff}\n\nThe Colonbyte Team`;
}

/**
 * Requires aiAnalysis to already be completed (routes/leads.js enforces this) so the message
 * has real grounded content to draw on. The demo is NOT required - includeDemo is a manual,
 * per-call choice (see buildFacts), same policy as outreachGenerator.js/whatsappOutreachGenerator.js.
 */
export async function generateFacebookOutreach(lead, { includeDemo = false } = {}) {
  const shape = STRUCTURE_VARIANTS[Math.floor(Math.random() * STRUCTURE_VARIANTS.length)];
  const userPrompt =
    `Draft a Facebook Messenger message for this lead:\n${JSON.stringify(buildFacts(lead, { includeDemo }), null, 2)}\n\n` +
    `Structural shape to use for THIS message specifically (different messages use different shapes - ` +
    `follow this one rather than defaulting to your own default pattern): ${shape}`;
  const result = await callGroqForMessage(SYSTEM_PROMPT, userPrompt);
  if (!result) return { status: 'failed' };
  return { ...result, promptVersion: PROMPT_VERSION, status: 'drafted', generatedAt: new Date() };
}

/**
 * Requires lead.facebookOutreach.status === 'opened' (routes/leads.js enforces this) - the
 * follow-up references the original message as context so it doesn't repeat the pitch. Mirrors
 * generateFollowUpInstagram/generateFollowUpWhatsapp - Facebook was previously missing this
 * follow-up entirely despite having the same manual copy-and-paste workflow as those two channels.
 */
export async function generateFollowUpFacebook(lead, { includeDemo = false } = {}) {
  const userPrompt =
    `The ORIGINAL Facebook Messenger message already sent:\n${JSON.stringify({ message: lead.facebookOutreach.message }, null, 2)}\n\n` +
    `Draft a brief Facebook Messenger follow-up for this lead:\n${JSON.stringify(buildFacts(lead, { includeDemo }), null, 2)}`;
  const result = await callGroqForMessage(FOLLOWUP_SYSTEM_PROMPT, userPrompt);
  if (!result) return { status: 'failed' };
  return { ...result, promptVersion: PROMPT_VERSION, status: 'drafted', generatedAt: new Date() };
}
