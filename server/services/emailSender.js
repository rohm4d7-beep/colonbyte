const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';

/**
 * Raw fetch against SendGrid's REST API — no SDK dependency, same pattern as the other
 * services in this codebase. `leadId` rides along as a custom arg so the Event Webhook
 * (routes/webhooks.js) can match tracking events back to a lead without needing SendGrid's
 * message ID, which isn't returned in a stable form across a batch send. Never throws —
 * callers get { success: false, error }.
 */
export async function sendOutreachEmail({ to, subject, body, leadId }) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM_EMAIL;

  if (!apiKey) {
    return { success: false, error: 'SENDGRID_API_KEY is not configured.' };
  }
  if (!from) {
    return { success: false, error: 'SENDGRID_FROM_EMAIL is not configured.' };
  }
  if (!to) {
    return { success: false, error: 'Lead has no email address to send to.' };
  }

  try {
    const res = await fetch(SENDGRID_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            custom_args: { leadId: String(leadId || '') },
          },
        ],
        from: { email: from },
        subject,
        content: [{ type: 'text/plain', value: body }],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error('[emailSender] SendGrid API error:', res.status, JSON.stringify(data).slice(0, 300));
      return { success: false, error: data.errors?.[0]?.message || 'Failed to send email.' };
    }

    return { success: true, messageId: res.headers.get('x-message-id') || '' };
  } catch (err) {
    console.error('[emailSender] Failed to send outreach email:', err.message);
    return { success: false, error: err.message };
  }
}
