import { groqFetch } from './groqClient.js';

const RESPONSE_SCHEMA = {
  name: 'reply_classification',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      label: {
        type: 'string',
        enum: ['interested', 'not_interested', 'pricing_inquiry', 'referral', 'opt_out', 'unclear', 'automated'],
      },
      confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
      reasoning: { type: 'string' },
    },
    required: ['label', 'confidence', 'reasoning'],
    additionalProperties: false,
  },
};

// A human pastes exactly what a lead replied with (no inbound API capture for any channel - see
// [[project-leadforge-pipeline-issues]] audit, this was a deliberate scope decision over building
// real WhatsApp/Instagram/Facebook Business API integrations); this is the only thing standing
// between that raw text and a status change / suppression decision, so it has to fail toward
// caution the same way aiAnalysis.js does toward not inventing facts.
const SYSTEM_PROMPT =
  "You are COLONBYTE's reply classifier. A human pasted in exactly what a business replied with " +
  'to an outreach message - your only job is to label what that reply actually communicates, ' +
  'using nothing but the text given.\n\n' +
  'CRITICAL - politeness is not interest. "Thanks for reaching out" or "Sounds interesting, ' +
  "I'll take a look\" with no concrete next step, question, or commitment is NOT 'interested' - " +
  "that is 'unclear' unless something in the text goes further (asks a real question, requests a " +
  'call/meeting, asks about price, or clearly declines). Never round a vague or noncommittal reply ' +
  'up to a positive label just because it is friendly in tone.\n\n' +
  'Label definitions:\n' +
  '- interested: asks a real follow-up question, requests a call/meeting/more info, or otherwise ' +
  'takes a concrete step toward continuing the conversation.\n' +
  '- not_interested: a clear decline, with or without a reason given.\n' +
  '- pricing_inquiry: asks specifically about cost/pricing/packages, nothing else needed.\n' +
  '- referral: redirects to a different person/department/email to continue with instead.\n' +
  "- opt_out: asks to stop being contacted, unsubscribe, or says something equivalent to \"don't " +
  "contact us again\" - this triggers an automatic do-not-contact suppression, so only use it when " +
  'the text is actually asking to stop, never for a plain "not interested."\n' +
  '- automated: an out-of-office/auto-reply/bounce-style message, not a real human response.\n' +
  '- unclear: anything that does not cleanly fit the above, including short acknowledgments, ' +
  'vague positivity, or ambiguous text - when genuinely unsure, choose this rather than guessing ' +
  'toward interested or not_interested. A human reviews every unclear reply themselves.\n\n' +
  'Set "confidence" honestly: high only when the text is unambiguous, low when you are guessing ' +
  'between two labels. "reasoning" must point to specific words/phrases in the reply, never invent ' +
  'context that was not given (no assumptions about tone of voice, prior conversation, or intent ' +
  'beyond the literal text).';

function buildUserPrompt({ channel, businessName, replyText }) {
  const facts = { channel, businessName: businessName || 'unknown', replyText };
  return `Classify this reply:\n${JSON.stringify(facts, null, 2)}`;
}

/**
 * Never throws - callers get { status: 'failed' } on any error (bad/missing key, rate limit,
 * malformed model output), same pattern as aiAnalysis.js/opportunityAnalysis.js.
 */
export async function classifyReply({ channel, businessName, replyText }) {
  try {
    const res = await groqFetch({
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt({ channel, businessName, replyText }) },
      ],
      response_format: { type: 'json_schema', json_schema: RESPONSE_SCHEMA },
      temperature: 0.2,
      reasoning_effort: 'low',
    });
    if (!res) return { status: 'failed' };

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error('[replyClassifier] Groq API error:', res.status, errBody.slice(0, 300));
      return { status: 'failed' };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return { status: 'failed' };

    const parsed = JSON.parse(content);

    return {
      label: parsed.label,
      confidence: parsed.confidence,
      reasoning: parsed.reasoning || '',
      status: 'completed',
    };
  } catch (err) {
    console.error('[replyClassifier] Failed to classify reply:', err.message);
    return { status: 'failed' };
  }
}
