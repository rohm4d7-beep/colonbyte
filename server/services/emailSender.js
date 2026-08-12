const RESEND_API_URL = 'https://api.resend.com/emails';

/**
 * Raw fetch against Resend's REST API — no SDK dependency, same pattern as the OpenAI
 * services in this codebase. Open/click tracking is a per-domain toggle in the Resend
 * dashboard, not a per-request option here; once enabled it fires the webhook events
 * that routes/webhooks.js listens for. Never throws — callers get { success: false, error }.
 */
export async function sendOutreachEmail({ to, subject, body }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  if (!apiKey) {
    return { success: false, error: 'RESEND_API_KEY is not configured.' };
  }
  if (!to) {
    return { success: false, error: 'Lead has no email address to send to.' };
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to, subject, text: body }),
      signal: AbortSignal.timeout(15000),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('[emailSender] Resend API error:', res.status, JSON.stringify(data).slice(0, 300));
      return { success: false, error: data.message || 'Failed to send email.' };
    }

    return { success: true, messageId: data.id };
  } catch (err) {
    console.error('[emailSender] Failed to send outreach email:', err.message);
    return { success: false, error: err.message };
  }
}
