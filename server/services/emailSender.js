const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Raw fetch against Brevo's transactional email API — no SDK dependency, same pattern as the
 * other services in this codebase. `leadId` rides along in `tags` so the webhook
 * (routes/webhooks.js) can match tracking events back to a lead — Brevo echoes `tags` back on
 * every event it sends, unlike SendGrid's arbitrary custom_args this used to carry.
 * Never throws — callers get { success: false, error }.
 */
export async function sendOutreachEmail({ to, subject, body, leadId }) {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.BREVO_FROM_EMAIL;

  if (!apiKey) {
    return { success: false, error: 'BREVO_API_KEY is not configured.' };
  }
  if (!from) {
    return { success: false, error: 'BREVO_FROM_EMAIL is not configured.' };
  }
  if (!to) {
    return { success: false, error: 'Lead has no email address to send to.' };
  }

  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { email: from },
        to: [{ email: to }],
        subject,
        textContent: body,
        tags: [String(leadId || '')],
      }),
      signal: AbortSignal.timeout(15000),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('[emailSender] Brevo API error:', res.status, JSON.stringify(data).slice(0, 300));
      return { success: false, error: data.message || 'Failed to send email.' };
    }

    return { success: true, messageId: data.messageId || '' };
  } catch (err) {
    console.error('[emailSender] Failed to send outreach email:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Plain-purpose send (login OTP codes, etc.) - deliberately separate from sendOutreachEmail
 * rather than reusing it with an empty leadId, since that function's tags exist specifically
 * for matching Brevo's webhook back to a lead (routes/webhooks.js) and this traffic has
 * nothing to do with lead outreach tracking.
 */
export async function sendEmail({ to, subject, body }) {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.BREVO_FROM_EMAIL;

  if (!apiKey || !from || !to) {
    return { success: false, error: 'Email sending is not configured.' };
  }

  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { email: from },
        to: [{ email: to }],
        subject,
        textContent: body,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error('[emailSender] Brevo API error:', res.status, JSON.stringify(data).slice(0, 300));
      return { success: false, error: data.message || 'Failed to send email.' };
    }
    return { success: true };
  } catch (err) {
    console.error('[emailSender] Failed to send email:', err.message);
    return { success: false, error: err.message };
  }
}
