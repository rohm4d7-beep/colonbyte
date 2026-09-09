import { OPPORTUNITY_CATEGORIES, OPPORTUNITY_SOLUTION_MAP, opportunityLabel, opportunityDemoStrategy } from '../constants/opportunityOptions.js';
import { groqFetch } from './groqClient.js';

const RESPONSE_SCHEMA = {
  name: 'opportunity_analysis',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      primaryOpportunity: { type: 'string', enum: OPPORTUNITY_CATEGORIES },
      opportunityConfidence: { type: 'string', enum: ['low', 'medium', 'high'] },
      evidence: { type: 'array', items: { type: 'string' } },
      reasoning: { type: 'string' },
      outreachAngle: { type: 'string' },
      secondaryOpportunities: { type: 'array', items: { type: 'string', enum: OPPORTUNITY_CATEGORIES } },
    },
    required: ['primaryOpportunity', 'opportunityConfidence', 'evidence', 'reasoning', 'outreachAngle', 'secondaryOpportunities'],
    additionalProperties: false,
  },
};

const CATEGORY_LIST = OPPORTUNITY_CATEGORIES.filter((c) => c !== 'NO_STRONG_OPPORTUNITY')
  .map((c) => `${c} (${OPPORTUNITY_SOLUTION_MAP[c].label})`)
  .join(', ');

const SYSTEM_PROMPT =
  'You are COLONBYTE\'s opportunity analyst. COLONBYTE is an AI + web development agency that builds ' +
  'websites, AI chatbots/assistants/receptionists, lead qualification and follow-up automation, ' +
  'appointment/enquiry workflows, CRM/workflow automation, internal tools, dashboards, client portals, ' +
  'custom software, and integrations. Your job is NOT to find a website problem — it is to find the ' +
  'single strongest, most credible digital/operational opportunity for THIS business, of any of those ' +
  'kinds, and only when the evidence actually supports one.\n\n' +
  'A business can have a broken, weak, or excellent website and STILL have (or NOT have) an AI/' +
  'automation/software opportunity. Website condition is one input, never the automatic answer. A ' +
  'business with an excellent website can still be the best-value lead here if it shows a real ' +
  'automation/AI angle (e.g. an online booking flow with no visible follow-up automation, or heavy ' +
  'service/FAQ content with no assistant to help visitors navigate it) — do not default to a website ' +
  'pitch just because that is the easiest read of the facts.\n\n' +
  'The reverse mistake is just as wrong: do NOT under-weight a genuinely absent or broken real website ' +
  'either. When websiteStatus is "none", "broken", "facebook_only", "instagram_only", or ' +
  '"google_business_only" (no real, independently-owned website exists at all — only a social/listing ' +
  'page, if that), that absence is itself direct, concrete evidence — not a weak guess — and normally ' +
  'supports WEBSITE_CONVERSION or WEBSITE_UX at MEDIUM-HIGH confidence whenever the business-quality ' +
  'context is credible, exactly like it always did before AI/automation categories existed. Do NOT let ' +
  'the absence of website-derived signals (booking/FAQ/chat-widget detection, which are only possible ' +
  'when a real website exists to inspect) push you toward NO_STRONG_OPPORTUNITY here — "no website to ' +
  'read signals from" is not the same as "no evidence"; the missing website IS the evidence. Only prefer ' +
  'a non-website category over WEBSITE_CONVERSION/WEBSITE_UX in this situation when something else in the ' +
  'facts specifically and directly points there (e.g. review text or category strongly implies a booking/' +
  'enquiry workflow problem) — never merely because a website pitch felt like the "easy" answer to avoid. ' +
  'websiteStatus "weak_website" or "outdated" (a real site exists, just a poor one) remains equally valid ' +
  'WEBSITE_CONVERSION/WEBSITE_UX evidence too, same as before.\n\n' +
  `Choose primaryOpportunity from exactly this set: ${CATEGORY_LIST}, or NO_STRONG_OPPORTUNITY when ` +
  'nothing here is credible.\n\n' +
  'HARD RULE — no visibility into social-only profiles. websiteStatus "facebook_only", "instagram_only", ' +
  'or "google_business_only" means the "website" field is actually a social/listing profile, not an ' +
  'independently-owned site — Leadforge has NEVER inspected that profile\'s content (no bio text, no ' +
  'links in the bio, no posts, no photo count there, no DM/booking setup). NEVER claim or imply anything ' +
  'about what is or isn\'t on that profile (e.g. "no booking link", "only one photo", "no bio link", "no ' +
  'link in bio") - the only confirmed fact is that no independently-owned website exists; frame evidence ' +
  'and outreachAngle around THAT, never around guessed specifics of a profile never actually seen. ' +
  'Similarly, any photo-count field in the facts describes the Google Maps listing only, never Instagram/' +
  'Facebook.\n\n' +
  'HARD RULE — a missing contact method is not proof of a problem. A missing phone number, email, ' +
  'website, booking link, WhatsApp link, or other contact method on a listing is an OBSERVATION, never an ' +
  'established problem. NEVER state or imply that a missing contact method is costing the business ' +
  'customers, appointments, bookings, or revenue, and NEVER claim that adding one would increase ' +
  'conversions — these are unsupported causal claims, exactly like: "Your Google listing doesn\'t have a ' +
  'phone number, which could be costing you appointments" or "Adding a phone number would help convert ' +
  'more visitors" (both banned, even hedged with "may" or "could"). Keep four things distinct: OBSERVATION ' +
  '("no phone number is visible on the Google listing"), INFERENCE ("this may make direct contact less ' +
  'convenient" — never state as established fact), UNKNOWN ("whether this actually affects enquiries" — ' +
  'never assumed either way), and DISCOVERY (the question to ask instead, e.g. "How are you currently ' +
  'handling enquiries from people who find you through Google?"). A missing contact method, alone, ' +
  'supports at most MEDIUM confidence (never high) and must never by itself be presented as sufficient ' +
  'justification for a website, automation, chatbot, or software pitch — it is only strong enough to be ' +
  'the DISCOVERY HOOK itself (a plain question about how enquiries are currently handled), not a claimed ' +
  'reason. Only after a real friction is confirmed by the business itself (which happens in a later reply, ' +
  'outside this analysis) does it become a validated opportunity.\n\n' +
  'HARD RULE — do not invent operational problems. A business\'s industry does NOT prove it has a ' +
  'particular problem. Never assert as fact things like "this clinic gets repetitive patient questions", ' +
  '"this salon manually handles bookings", "this business manually follows up with leads", "the staff are ' +
  'wasting time", or "they need a CRM" — these are exactly the kind of fabricated claims that must never ' +
  'appear in reasoning, evidence, or outreachAngle. Industry knowledge may inform which category is ' +
  'PLAUSIBLE, but plausibility is not evidence. Only the facts actually given (website signals, Google ' +
  'Maps data, category, reviews) are evidence.\n\n' +
  'Work through this before answering: (1) what does the website evidence actually show (booking/' +
  'enquiry/quote forms, FAQ depth, an existing chat widget or the lack of one, multiple locations/staff ' +
  'language, nav depth)? (2) what does the business-quality context (rating, review count, category, an ' +
  'existing business-quality summary if given) tell you about whether this is an established, viable ' +
  'business worth this attention at all? (3) given only those facts, which opportunity category (if any) ' +
  'has a real, specific, defensible angle — not a generic "AI could help" statement? (4) is there enough ' +
  'evidence to avoid sounding fabricated if a real business owner read this?\n\n' +
  'Confidence: "high" only when the website/business evidence directly and specifically supports the ' +
  'category (e.g. an online quote form with no other automation signal supports LEAD_QUALIFICATION or ' +
  'AUTOMATED_FOLLOW_UP at high confidence). "medium" when the category is plausible from general facts ' +
  'but not directly evidenced (e.g. deep FAQ content plausibly supports AI_CUSTOMER_ASSISTANT even ' +
  'without direct behavioral evidence). "low" when it is a reasonable guess at best. Use ' +
  'NO_STRONG_OPPORTUNITY, with an empty evidence-based reasoning, when nothing rises above a low-confidence ' +
  'guess or the business itself looks too thin/unestablished to be worth outreach — do not force a ' +
  'category onto every lead; a business with no credible angle is a normal, valid result, not a failure.\n\n' +
  '"evidence" is a short list (2-5 items) of the SPECIFIC facts given that support your pick, each written ' +
  'as a plain, readable sentence a human would recognize (e.g. "No chat widget detected on the site" or ' +
  '"Has an online quote/enquiry form") — NEVER as a raw field name or key:value pair (e.g. never write ' +
  '"hasChatWidget:false" or "websiteSignals.hasFaqSection"). Every item must still be something literally ' +
  'present in the input facts, never an inference dressed up as a fact. "reasoning" (1-3 sentences) is why ' +
  'those facts point to this category for this specific business. Leave evidence/reasoning minimal (or ' +
  'empty) when primaryOpportunity is NO_STRONG_OPPORTUNITY.\n\n' +
  '"outreachAngle" is the opening of a real conversation, built from THREE parts in order: (1) the ' +
  'SPECIFIC OBSERVATION, (2) one short bridging clause that gives a plausible reason this is worth a ' +
  'moment\'s thought — enough that a reader understands why someone who works on local businesses\' online ' +
  'presence/customer experience would be asking, WITHOUT naming a technology, product, or solution and ' +
  'without any marketing language ("AI-powered", "streamline", "leverage", "unlock efficiency" are all ' +
  'banned), and (3) a genuine, low-pressure question, in the owner\'s own terms (bookings, enquiries, ' +
  'follow-ups, customer questions). NEVER skip step 2 and jump straight from the observation to the ' +
  'question — a bare fact-then-question with no throughline reads as a random stranger\'s message, not ' +
  'someone with a reason to be asking. For example: "I noticed your Google listing doesn\'t show a phone ' +
  'number — that\'s usually the first thing people look for when deciding how to get in touch. How do ' +
  'enquiries from there end up reaching you at the moment?" (observation -> why it plausibly matters for ' +
  'getting found/contacted online -> question) rather than just "I noticed your Google listing doesn\'t ' +
  'show a phone number. How do you handle enquiries?" (bare fact, no throughline). The bridge must connect ' +
  'to something a WEB/AI/SOFTWARE agency would plausibly notice (the online customer journey — how people ' +
  'find, contact, book, or get answers from the business), never to something unrelated to what COLONBYTE ' +
  'does. It must ASK, not ASSERT — never claim a problem exists; frame it as a possibility worth a two-line ' +
  'reply. Never invent numbers, revenue, time saved, or competitor comparisons. Leave outreachAngle empty ' +
  'when primaryOpportunity is NO_STRONG_OPPORTUNITY.\n\n' +
  '"secondaryOpportunities" is 0-2 other categories genuinely supported by the facts, for internal record ' +
  'only — outreach will only ever use the primary one, so do not pad this list with weak guesses.';

function buildUserPrompt(lead) {
  const signals = lead.websiteSignals || {};
  const facts = {
    businessName: lead.businessName,
    category: lead.category || 'unknown',
    rating: lead.rating ?? 'unknown',
    reviewCount: lead.reviewCount ?? 'unknown',
    address: lead.address || 'unknown',
    websiteStatus: lead.websiteStatus || 'unknown',
    websiteQualityScore: lead.websiteQualityScore,
    websiteSignals: {
      hasBookingLanguage: !!signals.hasBookingLanguage,
      hasQuoteOrEnquiryForm: !!signals.hasQuoteOrEnquiryForm,
      hasFaqSection: !!signals.hasFaqSection,
      hasChatWidget: !!signals.hasChatWidget,
      hasMultipleLocationsLanguage: !!signals.hasMultipleLocationsLanguage,
      hasMultiplePractitionersLanguage: !!signals.hasMultiplePractitionersLanguage,
      navLinkCount: signals.navLinkCount ?? 0,
    },
    hasInstagramProfile: !!lead.instagramUrl,
    hasFacebookProfile: !!lead.facebookUrl,
    // Business-quality analysis (services/aiAnalysis.js) already ran and gated this call (see
    // routes/leads.js) — pass its verdict through as context, not as something to re-derive.
    businessQualitySummary: lead.aiAnalysis?.summary || 'none available',
    businessStrengths: lead.aiAnalysis?.strengths || [],
  };
  return `Find the strongest credible digital/AI/automation opportunity for this business:\n${JSON.stringify(facts, null, 2)}`;
}

/**
 * Separate Groq call from aiAnalysis.js on purpose (see brief section 28: keep business-quality
 * judgement and opportunity selection as distinct reasoning passes, not one uncontrolled
 * prompt) — never throws, callers get { status: 'failed' } on any error. Only ever called after
 * aiAnalysis has already found the business worth contacting (routes/leads.js), so this never
 * spends Groq budget re-litigating whether the business itself is viable.
 */
export async function analyzeOpportunity(lead) {
  try {
    const res = await groqFetch({
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(lead) },
      ],
      response_format: { type: 'json_schema', json_schema: RESPONSE_SCHEMA },
      temperature: 0.4,
      // Same rationale as aiAnalysis.js/outreachGenerator.js — this prompt has a long list of
      // hard constraints (controlled enum, evidence-only reasoning, banned phrasing) that push
      // gpt-oss-20b to over-reason and burn its completion budget before emitting JSON.
      reasoning_effort: 'low',
    });
    if (!res) return { status: 'failed' };

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error('[opportunityAnalysis] Groq API error:', res.status, errBody.slice(0, 300));
      return { status: 'failed' };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return { status: 'failed' };

    const parsed = JSON.parse(content);
    const primaryOpportunity = OPPORTUNITY_CATEGORIES.includes(parsed.primaryOpportunity)
      ? parsed.primaryOpportunity
      : 'NO_STRONG_OPPORTUNITY';
    const isNoOpportunity = primaryOpportunity === 'NO_STRONG_OPPORTUNITY';

    return {
      primaryOpportunity,
      // undefined, not '' — the schema has no default on this enum field specifically so an
      // unrecognized/missing confidence value is left unset rather than failing lead.save()'s
      // validation (see models/Lead.js's comment on opportunityAnalysisSchema).
      opportunityConfidence: ['low', 'medium', 'high'].includes(parsed.opportunityConfidence)
        ? parsed.opportunityConfidence
        : undefined,
      evidence: isNoOpportunity ? [] : Array.isArray(parsed.evidence) ? parsed.evidence : [],
      reasoning: isNoOpportunity ? '' : parsed.reasoning || '',
      outreachAngle: isNoOpportunity ? '' : parsed.outreachAngle || '',
      solutionCategory: opportunityLabel(primaryOpportunity),
      secondaryOpportunities: Array.isArray(parsed.secondaryOpportunities)
        ? parsed.secondaryOpportunities.filter((c) => OPPORTUNITY_CATEGORIES.includes(c) && c !== primaryOpportunity)
        : [],
      demoStrategy: opportunityDemoStrategy(primaryOpportunity),
      status: 'completed',
      analyzedAt: new Date(),
    };
  } catch (err) {
    console.error('[opportunityAnalysis] Failed to analyze opportunity:', err.message);
    return { status: 'failed' };
  }
}

/**
 * Used when aiAnalysis already determined the business isn't worth contacting at all — no
 * point spending a Groq call finding a specific opportunity for a business that failed the
 * business-quality gate. Mirrors the shape of a completed analyzeOpportunity() result so
 * callers/UI never need to branch on how a NO_STRONG_OPPORTUNITY verdict was reached.
 */
export function noOpportunity() {
  return {
    primaryOpportunity: 'NO_STRONG_OPPORTUNITY',
    // undefined, not '' — same reason as analyzeOpportunity() above: '' is not a valid enum
    // member and would fail lead.save() every time a lead fails the business-quality gate.
    opportunityConfidence: undefined,
    evidence: [],
    reasoning: 'Business-quality analysis did not find enough evidence of an established, viable business to justify contacting.',
    outreachAngle: '',
    solutionCategory: '',
    secondaryOpportunities: [],
    demoStrategy: 'NO_DEMO',
    status: 'completed',
    analyzedAt: new Date(),
  };
}
