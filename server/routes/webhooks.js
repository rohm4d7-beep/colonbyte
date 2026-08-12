import { Router } from 'express';
import crypto from 'crypto';
import Lead from '../models/Lead.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

/**
 * Resend signs webhooks using the Svix scheme: HMAC-SHA256 over `${id}.${timestamp}.${rawBody}`
 * with the base64-decoded secret (after stripping the "whsec_" prefix), base64-encoded, compared
 * against one or more "v1,<sig>" entries in the svix-signature header. Verified against the raw
 * body — this is why routes/webhooks.js is mounted with express.raw() ahead of the global
 * express.json() in index.js; parsing it as JSON first would make the bytes unrecoverable.
 */
function isValidSignature(secret, id, timestamp, rawBody, signatureHeader) {
  let secretBytes;
  try {
    secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  } catch {
    return false;
  }

  const signedContent = `${id}.${timestamp}.${rawBody.toString('utf8')}`;
  const expected = crypto.createHmac('sha256', secretBytes).update(signedContent).digest('base64');
  const expectedBuf = Buffer.from(expected, 'base64');

  return signatureHeader
    .split(' ')
    .map((entry) => entry.split(',')[1])
    .filter(Boolean)
    .some((sig) => {
      try {
        const sigBuf = Buffer.from(sig, 'base64');
        return sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf);
      } catch {
        return false;
      }
    });
}

router.post('/resend', asyncHandler(async (req, res) => {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[webhooks] RESEND_WEBHOOK_SECRET not configured — rejecting webhook.');
    return res.status(503).json({ error: 'Webhook not configured.' });
  }

  const svixId = req.get('svix-id');
  const svixTimestamp = req.get('svix-timestamp');
  const svixSignature = req.get('svix-signature');
  const rawBody = req.body;

  if (!svixId || !svixTimestamp || !svixSignature || !Buffer.isBuffer(rawBody)) {
    return res.status(400).json({ error: 'Missing or invalid signature headers.' });
  }

  const timestampSeconds = parseInt(svixTimestamp, 10);
  if (!Number.isFinite(timestampSeconds) || Math.abs(Date.now() / 1000 - timestampSeconds) > 300) {
    return res.status(401).json({ error: 'Timestamp out of tolerance.' });
  }

  if (!isValidSignature(secret, svixId, svixTimestamp, rawBody, svixSignature)) {
    return res.status(401).json({ error: 'Invalid signature.' });
  }

  const event = JSON.parse(rawBody.toString('utf8'));
  const emailId = event?.data?.email_id;
  if (!emailId) return res.status(200).json({ ok: true });

  const lead = await Lead.findOne({ 'outreach.resendMessageId': emailId });
  if (!lead) return res.status(200).json({ ok: true });

  switch (event.type) {
    case 'email.opened':
      lead.outreach.openCount += 1;
      lead.outreach.lastOpenedAt = new Date();
      break;
    case 'email.clicked':
      lead.outreach.clickCount += 1;
      lead.outreach.lastClickedAt = new Date();
      break;
    case 'email.bounced':
    case 'email.complained':
      lead.outreach.bounced = true;
      break;
    default:
      return res.status(200).json({ ok: true });
  }

  await lead.save();
  res.status(200).json({ ok: true });
}));

export default router;
