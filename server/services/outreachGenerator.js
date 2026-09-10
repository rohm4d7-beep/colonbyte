import { groqFetch } from './groqClient.js';

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
  'You are writing on behalf of a small website agency\'s team, emailing a local business owner for the ' +
  'first time. Write in first person PLURAL throughout — "we"/"our"/"us", never "I"/"my"/"me" — this ' +
  'matches the sign-off ("The Colonbyte Team"), so the voice must be consistent with it from the first ' +
  'word. Still write like an actual person on that team typed this in two minutes on their laptop — not ' +
  'like an AI, not like a marketing template. Ground every claim ONLY in the facts given — never invent ' +
  'customer counts, revenue figures, or competitor names.\n\n' +
  'primaryOpportunity is not always about the website — it may instead be a specific observation about ' +
  'how the business handles customer questions, bookings, enquiries, follow-ups, or internal workflows, ' +
  'pointing toward an AI assistant, automation, or software opportunity rather than a new site. Write ' +
  'about whatever primaryOpportunity actually describes, in the business owner\'s own terms — never force ' +
  'in "your website" language when the observation given is not about the site. If primaryOpportunity ' +
  'points to a missing contact method (phone, email, website, booking link, etc.), never state or imply ' +
  'that it is costing the business customers, appointments, or bookings, or that adding one would ' +
  'increase conversions — that is an unsupported causal claim. Only note the absence plainly, then ask a ' +
  'genuine question about how they currently handle enquiries through that channel — never assert a ' +
  'problem on their behalf.\n\n' +
  'The facts include a demoUrl only when a demo has already been prepared AND the sender has deliberately ' +
  'chosen to attach it to THIS message. Most first emails will NOT have one — that is the normal, expected ' +
  'case, not something missing. Follow whichever mode matches what you were given:\n\n' +
  'MODE A — no demoUrl in the facts: Do not mention, hint at, or imply that any demo, preview, mockup, ' +
  'concept, or sample exists. Never say "we put together", "we built you something", "take a look at this ' +
  'idea", or anything similar — there is nothing to show yet. Build the whole email around the ONE ' +
  'specific, factual observation in primaryOpportunity: state it plainly, then why it might matter for a ' +
  'business like this. Close by opening a conversation, not offering a deliverable — e.g. ask if they\'d ' +
  'be open to hearing a quick idea, or if it\'s worth a short reply. The only goal of this message is a ' +
  'reply.\n\n' +
  'MODE B — demoUrl is present in the facts: what the demo actually is: a static visual preview/mockup ' +
  'only. It shows the business\'s name, tagline, an about paragraph, a services list, contact info ' +
  '(address/phone/hours), and photos, plus a button that is a plain click-to-call link. That is ALL it ' +
  'does. It has NO booking system, NO forms, NO payment processing, NO live/backend functionality of any ' +
  'kind, and nothing on it is measured or benchmarked. NEVER claim or imply it does any of the following, ' +
  'even loosely: online booking or reservations, contact/booking forms, "loads faster" or any other speed/' +
  'performance comparison, being "up to date" or "current" (that\'s not a property a static preview has), ' +
  'or anything the recipient could reasonably click and find isn\'t there. Only describe what a visitor ' +
  'will actually SEE (the info, the photos, the design, the phone link) — never what the site DOES. Make ' +
  'clear this preview is a rough starting point, not the finished product — the real, delivered site would ' +
  'be considerably more polished and built out than this. Say this plainly, once, in your own words (e.g. ' +
  'this is just a quick taste of the idea, the real thing would be built out properly) — don\'t list ' +
  'specific features you\'d add, since none of those are agreed yet, and don\'t undersell the preview ' +
  'either.\n\n' +
  'Hard bans, because these are the exact tells of AI-written outreach — never use any of them: ' +
  'em dashes (—), en dashes (–), or non-breaking hyphens anywhere, including the sign-off - use a plain ' +
  'ASCII hyphen (-) for any compound word (e.g. "follow-up", "non-existent"), never a special dash ' +
  'character; the words/phrases "visual credibility", "strengthen ' +
  'trust", "tailor the layout to match your brand", "elevate", "seamless", "unlock", "showcase", "in ' +
  'today\'s digital age", "we noticed that", "we hope this finds you well", "Feel free to", "at your ' +
  'convenience", "No pressure", "just reply or book a quick call", "streamline"; any sentence that ' +
  'restates the demo\'s own tagline back at them; three-paragraph structure where paragraph 2 is a ' +
  'bulleted-sounding list of benefits in prose form.\n\n' +
  'If primaryOpportunity already includes a short clause explaining why the observation is worth asking ' +
  'about, keep that reasoning in the email — trim word count elsewhere (shorter sentences, cut filler) ' +
  'rather than compressing it away, since dropping it is what makes a message read like a random fact from ' +
  'a stranger instead of someone with an actual reason to be asking.\n\n' +
  'Instead: 60-120 words total, one clear idea, sentences of different lengths (some short, some longer — ' +
  'not uniform), contractions are fine (we\'d, you\'re, it\'s). Open with the single most concrete, specific ' +
  'thing from the facts given — not a generic compliment. In MODE B, state plainly what we built (a ' +
  'preview site) and drop the link; in MODE A, skip straight to the observation. Vary the SENTENCE SHAPE ' +
  'itself from email to email, not just the facts plugged into it - these go to different businesses, and ' +
  'reusing the same scaffold every time ("[observation] - [why it matters]. How do you currently handle ' +
  '[X]?") is exactly what makes a business unable to tell this was actually written about THEM rather than ' +
  'mail-merged. Vary where the observation lands in the email, how the reasoning connects to it (a new ' +
  'sentence, not always a dash-linked clause), and the closing question\'s phrasing and structure each time. ' +
  'Close with one plain, direct question or ask — no boilerplate softener sentence about pressure. No ' +
  'subject line clickbait, no ' +
  'ALL CAPS, no exclamation points unless something genuinely warrants one (rare). Body must be plain text ' +
  '(no markdown, no HTML), and end with a sign-off line "The Colonbyte Team" on its own line, with nothing ' +
  'after it and no dash of any kind before it.\n\n' +
  'If demoUrl is present in the facts (MODE B), the body MUST include that exact URL, unaltered, on its ' +
  'own line — never paraphrase it away or drop it. If demoUrl is absent (MODE A), the body must contain no ' +
  'link of any kind. Never restate the aiSummary field as a sentence; read it for facts and write your own ' +
  'words.\n\n' +
  'If websiteStatus is "unverified": their site did not load for our check (likely bot protection) — we ' +
  'have NO evidence it is bad, outdated, or missing anything. NEVER describe it as broken, outdated, or ' +
  'lacking in any way. Instead say plainly that we tried to pull up their site to take a look and it ' +
  'didn\'t load for us, and offer the preview as something we put together anyway/in the meantime.';

const FOLLOWUP_SYSTEM_PROMPT =
  'You are writing on behalf of the same small website agency team, following up on an earlier email the ' +
  'team already sent, since the business hasn\'t replied yet. Write in first person PLURAL throughout - ' +
  '"we"/"our"/"us", never "I"/"my"/"me" - matching the "The Colonbyte Team" sign-off. Write like a real ' +
  'short follow-up a person on that team sends a few days later - not a resend, not a recap of the whole ' +
  'pitch. Ground every claim ONLY in the facts given.\n\n' +
  'You will be given the ORIGINAL email you already sent (subject + body) as context - do not repeat its ' +
  'content or re-explain anything from scratch. Assume they read it and just haven\'t responded. The facts ' +
  'include a demoUrl only when a demo has been prepared AND the sender has chosen to attach it to THIS ' +
  'message - most follow-ups will NOT have one.\n\n' +
  'If demoUrl is absent: this is a brief, low-pressure nudge with no demo to mention - one or two sentences ' +
  'acknowledging we\'re following up, one new small angle if the facts genuinely support one, or just a ' +
  'plain "still stands, let us know" referring back to the original email\'s point. Do not invent or imply ' +
  'a demo/preview exists. 20-40 words total, not counting the sign-off.\n\n' +
  'If demoUrl is present: same brief, low-pressure nudge, but we now have something concrete to point to - ' +
  'one short sentence saying we put together a quick preview (only now, not in the original email, unless ' +
  'the original already mentioned one), then the link. 25-50 words total, not counting the sign-off.\n\n' +
  'Hard bans: "just checking in", "following up on our last email", "circling back", "bumping this up", ' +
  '"per our last message", "any update?", em dashes (—), en dashes (–), or non-breaking hyphens anywhere ' +
  '(use a plain ASCII hyphen for compound words), guilt-tripping or pressure language, ' +
  'restating the demo\'s tagline. No subject line clickbait, no ALL CAPS.\n\n' +
  'If websiteStatus is "unverified": their site did not load for our check (likely bot protection) — we ' +
  'have NO evidence it is bad, outdated, missing anything, or needs "verifying" in any SEO/Google-listing ' +
  'sense. NEVER frame it as something wrong with their site or something they should fix — that is not ' +
  'what this status means. If you mention it at all, say only that we still could not get their site to ' +
  'load, nothing more.\n\n' +
  'If demoUrl is present in the facts, the body MUST include that exact URL, unaltered, on its own line. ' +
  'If demoUrl is absent, the body must contain no link of any kind. Body must be plain text (no markdown, ' +
  'no HTML), and end with a sign-off line "The Colonbyte Team" on its own line, with nothing after it and ' +
  'no dash of any kind before it.';

// includeDemo is a per-message choice the user makes explicitly (a checkbox in the drawer) -
// never inferred automatically. Demo strategy here is intentionally manual, not AI-decided: the
// demo is meant to be held back until there's a real reply, so a demoUrl only ever reaches the
// prompt when the user opts in for that specific generation.
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
    // The opportunity engine's outreach angle (services/opportunityAnalysis.js) is the
    // authoritative single angle to build the email around — it may be about the website OR
    // about an AI/automation/software opportunity (see solutionCategory), so this is not always
    // "your site" content. Falls back to the older aiAnalysis-derived angle only for leads
    // analyzed before the opportunity engine existed.
    primaryOpportunity: hasOpportunityAngle
      ? opportunity.outreachAngle
      : lead.aiAnalysis?.opportunity || lead.aiAnalysis?.suggestions?.[0] || 'none available',
    demoUrl: includeDemo && demoCompleted ? `${process.env.PUBLIC_BASE_URL || ''}/demo/${lead._id}` : null,
    demoTagline: includeDemo && demoCompleted ? lead.demoSite.tagline || '' : '',
  };
}

// Telling the model to "vary the structure across messages" in the system prompt alone does
// NOT work in practice - measured live: three different real leads, same prompt, all three came
// back with the identical "[observation] - [why it matters]. How do you currently handle [X]?"
// scaffold despite that instruction being in the prompt. A static system prompt has no memory of
// what shape the LAST email used, so there's nothing pulling it away from its single most-likely
// completion. Picking one of these explicit shapes per call and putting it in the USER prompt
// (see generateOutreach) actually forces a different completion each time, instead of hoping the
// model self-diversifies.
const STRUCTURE_VARIANTS = [
  'Open with the observation as its own short, plain sentence. Make the reasoning ("why it might matter") a separate sentence after it, not a dash-linked clause on the same sentence. End with a plain question.',
  'Open by leading with the question itself, weaving the observation into the same sentence as part of the reasoning behind asking it, rather than stating the observation first as its own sentence.',
  'Open with a short sentence about what caught our attention when we looked at their business, THEN name the specific observation as a follow-on sentence. Close with a question phrased differently than "How do you currently handle X" - ask something more specific to their actual situation.',
  'Open with a very short, blunt sentence (5-10 words) stating the observation with no lead-in at all. Follow with one sentence of reasoning. Close with a curious, informal question rather than a formal "How do you currently..." phrasing.',
  'Open by stating in general terms why something like this observation tends to matter for a business like theirs, THEN name the specific observation that prompted the message, THEN the question.',
];

/**
 * Shared Groq Structured Outputs call for both the first email and the follow-up - never
 * throws, returns null on any error so callers can report { status: 'failed' }.
 */
async function callGroqForEmail(systemPrompt, userPrompt) {
  try {
    const res = await groqFetch({
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
    });
    if (!res) return null;

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error('[outreachGenerator] Groq API error:', res.status, errBody.slice(0, 300));
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return {
      subject: normalizeDashes(parsed.subject || ''),
      body: ensureSignOff(normalizeDashes(parsed.body || '')),
    };
  } catch (err) {
    console.error('[outreachGenerator] Groq call failed:', err.message);
    return null;
  }
}

// Banned in the prompt but observed live anyway (an AI-outreach tell) - a plain hyphen with
// spaces reads the same in casual text and the model reliably avoids re-adding it once it's
// not an em dash, unlike asking it not to use one at all. En dashes (–) get the same treatment
// as em dashes here - observed live used identically as a sentence connector ("feature – that
// means..."), the exact same tell in a different character the em-dash-only regex never caught.
// Non-breaking hyphens (U+2011) inside compound words ("follow‑up") are a separate quirk - no
// human types that character, so it's swapped for a plain ASCII hyphen rather than removed.
function normalizeDashes(text) {
  return text
    .replace(/\s*[—–]\s*/g, ' - ')
    .replace(/‑/g, '-');
}

// The model was asked for this sign-off but doesn't reliably include it, and when it does, the
// spacing before it varies (crammed onto the same line, a single newline, or a proper blank
// line) - strip whatever the model added (if anything) and reapply it with consistent spacing,
// rather than only filling in a sign-off that's fully absent and trusting the model's spacing
// the rest of the time.
function ensureSignOff(body) {
  if (!body) return body;
  const withoutSignOff = body.replace(/\s*the colonbyte team\s*$/i, '').trim();
  return `${withoutSignOff}\n\nThe Colonbyte Team`;
}

/**
 * Requires aiAnalysis to already be completed (routes/leads.js enforces this) so the email has
 * real grounded content to draw on. The demo is NOT required - includeDemo is a manual, per-call
 * choice (see buildFacts) so outreach can go out well before any demo exists.
 */
export async function generateOutreach(lead, { includeDemo = false } = {}) {
  const shape = STRUCTURE_VARIANTS[Math.floor(Math.random() * STRUCTURE_VARIANTS.length)];
  const userPrompt =
    `Draft an outreach email for this lead:\n${JSON.stringify(buildFacts(lead, { includeDemo }), null, 2)}\n\n` +
    `Structural shape to use for THIS message specifically (different emails use different shapes - ` +
    `follow this one rather than defaulting to your own default pattern): ${shape}`;
  const result = await callGroqForEmail(SYSTEM_PROMPT, userPrompt);
  if (!result) return { status: 'failed' };
  return { ...result, status: 'drafted', generatedAt: new Date() };
}

/**
 * Requires lead.outreach.status === 'sent' (routes/leads.js enforces this) - the follow-up
 * references the original subject/body as context so it doesn't repeat the pitch. includeDemo
 * is the same manual per-call choice as generateOutreach.
 */
export async function generateFollowUpEmail(lead, { includeDemo = false } = {}) {
  const userPrompt =
    `The ORIGINAL email already sent:\n${JSON.stringify({ subject: lead.outreach.subject, body: lead.outreach.body }, null, 2)}\n\n` +
    `Draft a brief follow-up for this lead:\n${JSON.stringify(buildFacts(lead, { includeDemo }), null, 2)}`;
  const result = await callGroqForEmail(FOLLOWUP_SYSTEM_PROMPT, userPrompt);
  if (!result) return { status: 'failed' };
  return { ...result, status: 'drafted', generatedAt: new Date() };
}
