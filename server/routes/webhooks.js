import { Router } from 'express';
import crypto from 'crypto';
import Lead from '../models/Lead.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

/**
 * SendGrid's Signed Event Webhook signs `${timestamp}${rawBody}` with an ECDSA (P-256/SHA256)
 * private key; verification uses the base64 DER public key shown in SendGrid's webhook settings.
 * Verified against the raw body — this is why routes/webhooks.js is mounted with express.raw()
 * ahead of the global express.json() in index.js; parsing it as JSON first would make the bytes
 * unrecoverable.
 */
function isValidSignature(publicKeyBase64, timestamp, rawBody, signatureBase64) {
  try {
    const publicKey = crypto.createPublicKey({
      key: Buffer.from(publicKeyBase64, 'base64'),
      format: 'der',
      type: 'spki',
    });
    const verifier = crypto.createVerify('SHA256');
    verifier.update(timestamp + rawBody.toString('utf8'));
    verifier.end();
    return verifier.verify(publicKey, Buffer.from(signatureBase64, 'base64'));
  } catch {
    return false;
  }
}

router.post('/sendgrid', asyncHandler(async (req, res) => {
  const publicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY;
  if (!publicKey) {
    console.warn('[webhooks] SENDGRID_WEBHOOK_PUBLIC_KEY not configured — rejecting webhook.');
    return res.status(503).json({ error: 'Webhook not configured.' });
  }

  const signature = req.get('x-twilio-email-event-webhook-signature');
  const timestamp = req.get('x-twilio-email-event-webhook-timestamp');
  const rawBody = req.body;

  if (!signature || !timestamp || !Buffer.isBuffer(rawBody)) {
    return res.status(400).json({ error: 'Missing or invalid signature headers.' });
  }

  if (Math.abs(Date.now() / 1000 - parseInt(timestamp, 10)) > 300) {
    return res.status(401).json({ error: 'Timestamp out of tolerance.' });
  }

  if (!isValidSignature(publicKey, timestamp, rawBody, signature)) {
    return res.status(401).json({ error: 'Invalid signature.' });
  }

  const events = JSON.parse(rawBody.toString('utf8'));

  for (const event of events) {
    if (!event.leadId) continue;
    const lead = await Lead.findById(event.leadId).catch(() => null);
    if (!lead) continue;

    switch (event.event) {
      case 'open':
        lead.outreach.openCount += 1;
        lead.outreach.lastOpenedAt = new Date();
        break;
      case 'click':
        lead.outreach.clickCount += 1;
        lead.outreach.lastClickedAt = new Date();
        break;
      case 'bounce':
      case 'spamreport':
        lead.outreach.bounced = true;
        break;
      default:
        continue;
    }

    await lead.save();
  }

  res.status(200).json({ ok: true });
}));

export default router;
