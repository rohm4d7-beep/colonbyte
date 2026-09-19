import { groqFetch } from './groqClient.js';

const RESPONSE_SCHEMA = {
  name: 'business_analysis',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      summary: { type: 'string' },
      worthContacting: { type: 'boolean' },
      qualificationConfidence: { type: 'string', enum: ['low', 'medium', 'high'] },
      strengths: { type: 'array', items: { type: 'string' } },
      weaknesses: { type: 'array', items: { type: 'string' } },
      disqualifyingFactors: { type: 'array', items: { type: 'string' } },
      opportunity: { type: 'string' },
      suggestions: { type: 'array', items: { type: 'string' } },
    },
    required: [
      'summary',
      'worthContacting',
      'qualificationConfidence',
      'strengths',
      'weaknesses',
      'disqualifyingFactors',
      'opportunity',
      'suggestions',
    ],
    additionalProperties: false,
  },
};

const SYSTEM_PROMPT =
  'You are COLONBYTE\'s business-quality analyst, deciding whether a local business (scraped from Google ' +
  'Maps) is an ESTABLISHED, commercially-viable business worth a human salesperson\'s time to contact at ' +
  'all. COLONBYTE is an AI + web development agency that can help with websites, AI assistants/chatbots, ' +
  'lead qualification, follow-up automation, appointment/enquiry workflows, internal tools, and more - ' +
  'but deciding WHICH of those (if any) fits happens in a separate, later analysis pass. Your only job ' +
  'here is the business-quality gate: is this a real, viable business worth that later analysis being run ' +
  'on at all? Use ONLY the data given — never invent facts: no revenue figures, customer counts, ' +
  'competitor names, traffic/conversion numbers, or any other statistic not present in the input. Do not ' +
  'produce numeric scores of any kind — this analysis is qualitative and explainable, not a scored ' +
  'ranking.\n\n' +
  'CRITICAL: do NOT judge business quality by website condition. Website condition (no site, broken, ' +
  'outdated, weak, or even an excellent site) is NOT a business-quality signal in either direction - a ' +
  'business with an excellent website can be just as worth contacting as one with none, and a bad website ' +
  'never substitutes for real demand evidence. Judge business quality purely from: rating and reviewCount ' +
  '(demand and reputation - a handful of reviews is a much weaker signal than dozens), whether it has real ' +
  'contact info (phone/address), and whether its category and hours suggest an ongoing, operating concern ' +
  'rather than something barely running.\n\n' +
  'Work through these questions using only the given facts:\n' +
  '1. What is genuinely good about this business (reputation, demand, longevity signals)? Is there enough ' +
  'here to call it an established, viable business at all?\n' +
  '2. What, if anything, is weak about it as a business (thin reviews, no reachable contact info, signs of ' +
  'barely operating)? Never claim a defect you cannot point to in the facts.\n' +
  '3. Setting website condition aside entirely, does this look like a business with real, ongoing demand ' +
  'that a sales conversation is worth having with?\n\n' +
  'CRITICAL — websiteStatus "facebook_only", "instagram_only", or "google_business_only" means the ' +
  '"website" field on this business is actually a social/listing profile, not an independently-owned ' +
  'site — and Leadforge has NEVER inspected the content of that profile (no bio text, no links in the ' +
  'bio, no posts, no photo count on that platform, no DM/booking setup). NEVER claim or imply anything ' +
  'about what is or isn\'t on that profile (e.g. "no booking link", "only one photo", "no bio link") - ' +
  'the only confirmed fact in this situation is that no independently-owned website exists. ' +
  'googleMapsListingPhotoCount is ONLY the photo count on the Google Maps listing itself — never describe ' +
  'it as a photo count on Instagram, Facebook, or any other platform.\n\n' +
  'CRITICAL — a missing contact method (no phone number, email, website, booking link, WhatsApp link, ' +
  'etc. on the listing) is an OBSERVATION, not a business-quality defect and not proof of a conversion ' +
  'problem. Never state or imply it is "limiting," "hindering," "costing," or reducing bookings/trust/' +
  'engagement — that is an unsupported causal claim. If you mention one in "weaknesses," phrase it as a ' +
  'plain, neutral fact of what is absent (e.g. "No phone number listed") with no implied consequence.\n\n' +
  'Set "worthContacting" to true only when the business-quality case above is credible on its own - real ' +
  'demand and reputation signals, reachable, an operating concern. A business with few or no reviews and ' +
  'thin signal overall is NOT worth contacting regardless of its website - say so plainly in "summary" ' +
  'rather than manufacturing a reason. Never force it.\n\n' +
  '"qualificationConfidence" is honest, categorical (never numeric) certainty in the worthContacting ' +
  'verdict itself: "high" when the facts are rich enough (real rating/reviewCount, reachable contact info) ' +
  'that little doubt remains either way; "medium" when the verdict is reasonable but some signal is thin ' +
  'or missing; "low" when you are genuinely guessing between the two verdicts because too little is given ' +
  '(e.g. no rating and no reviewCount at all). A "low" confidence result is routed to a human for review, ' +
  'so never inflate it just to sound decisive.\n\n' +
  '"disqualifyingFactors" is ONLY populated when worthContacting is false — the specific facts (drawn ' +
  'verbatim from what disqualified this business, e.g. "Only 2 reviews", "No phone or address listed") ' +
  'that justify not contacting it, so a human skimming a rejected lead can see exactly why without ' +
  'reading the full summary. Leave it an empty array whenever worthContacting is true — a qualified ' +
  'business has weaknesses (see "weaknesses" below), not disqualifying factors.\n\n' +
  '"opportunity" is optional context, not the deciding factor: if the given facts happen to make a ' +
  'specific business-side observation obvious (e.g. real demand signals but a listing-only or hard-to-' +
  'find presence), note it in one or two sentences; otherwise leave it an empty string - do not strain to ' +
  'produce one, and never assume it must be about the website. Leave it empty whenever worthContacting is ' +
  'false. "suggestions" is a short qualitative list (0-4 items) of concrete, plausible business-side ' +
  'observations consistent with the weaknesses noted - optional, not scored, not guaranteed, and never ' +
  'invented specifics (no page names, no metrics) beyond what the facts support.\n\n' +
  'reviewCount and rating are your signal of real customer demand and reputation; category tells you ' +
  'the likely customer journey (a hotel booking vs. a dental appointment vs. a plumber\'s call-out ' +
  'behave differently) - use both to judge plausibility and worth, never to back into a specific number.';

function buildUserPrompt(lead) {
  const facts = {
    businessName: lead.businessName,
    category: lead.category || 'unknown',
    rating: lead.rating ?? 'unknown',
    reviewCount: lead.reviewCount ?? 'unknown',
    openingHoursSummary: lead.openingHoursSummary || 'unknown',
    // Named explicitly (not "photoCount") so it can never be misread as a photo count on
    // Instagram/Facebook when websiteStatus is instagram_only/facebook_only - this is ONLY ever
    // the number of photos on the Google Maps listing itself, which Leadforge has never scraped
    // any social profile to know anything about.
    googleMapsListingPhotoCount: lead.photoCount ?? 0,
    address: lead.address || 'unknown',
    phone: lead.phone || 'none listed',
    website: lead.website || 'none',
    websiteStatus: lead.websiteStatus,
    websiteQualityScore: lead.websiteQualityScore,
  };
  return `Analyze this business:\n${JSON.stringify(facts, null, 2)}`;
}

/**
 * Calls Groq's Structured Outputs (strict json_schema, OpenAI-compatible endpoint) so the
 * response always matches the aiAnalysis shape — never throws, callers just get
 * { status: 'failed' } on any error so a bad/missing key or a rate limit never breaks the
 * scrape pipeline. strict json_schema is only supported on the gpt-oss models — see
 * https://console.groq.com/docs/structured-outputs
 */
export async function analyzeLead(lead) {
  try {
    const res = await groqFetch({
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
    });
    if (!res) return { status: 'failed' };

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error('[aiAnalysis] Groq API error:', res.status, errBody.slice(0, 300));
      return { status: 'failed' };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return { status: 'failed' };

    const parsed = JSON.parse(content);
    const worthContacting = typeof parsed.worthContacting === 'boolean' ? parsed.worthContacting : null;

    return {
      summary: parsed.summary || '',
      worthContacting,
      // undefined (not '') on an unrecognized value — same reasoning as opportunityAnalysis.js's
      // opportunityConfidence: '' is not a valid enum member and would fail lead.save().
      qualificationConfidence: ['low', 'medium', 'high'].includes(parsed.qualificationConfidence)
        ? parsed.qualificationConfidence
        : undefined,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      // Only meaningful when the business was actually disqualified — enforced here too, not
      // just in the prompt, in case the model populates it anyway.
      disqualifyingFactors: worthContacting === false && Array.isArray(parsed.disqualifyingFactors)
        ? parsed.disqualifyingFactors
        : [],
      opportunity: parsed.opportunity || '',
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      // Deterministic, not AI-judged — see brief section 4/8: a low-confidence qualification
      // verdict always gets a human's eyes before anything downstream (outreach generation,
      // opportunity analysis) treats it as settled. Kept as a plain boolean function of
      // qualificationConfidence rather than asking the model to self-flag, since "should a
      // human check my own uncertain answer" is not a fact the model can reliably self-report.
      requiresHumanReview: parsed.qualificationConfidence === 'low',
      status: 'completed',
      analyzedAt: new Date(),
    };
  } catch (err) {
    console.error('[aiAnalysis] Failed to analyze lead:', err.message);
    return { status: 'failed' };
  }
}
