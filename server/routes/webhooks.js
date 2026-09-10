import { Router } from 'express';
import crypto from 'crypto';
import Lead from '../models/Lead.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

/**
 * Brevo doesn't sign its webhook requests (no HMAC/ECDSA scheme like SendGrid's Signed Event
 * Webhook) — their own docs point to IP allowlisting instead, which is brittle to keep in sync
 * with their published ranges. A shared secret in the URL (set when configuring the webhook in
 * Brevo's dashboard, matched against BREVO_WEBHOOK_SECRET here) is the simpler, equally-secure
 * alternative for a single-endpoint webhook like this one. timingSafeEqual guards against a
 * timing side-channel on the comparison.
 */
function isValidToken(secret, provided) {
  if (!secret || !provided) return false;
  const a = Buffer.from(secret);
  const b = Buffer.from(provided);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

router.post('/brevo', asyncHandler(async (req, res) => {
  const secret = process.env.BREVO_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[webhooks] BREVO_WEBHOOK_SECRET not configured — rejecting webhook.');
    return res.status(503).json({ error: 'Webhook not configured.' });
  }

  if (!isValidToken(secret, req.query.token)) {
    return res.status(401).json({ error: 'Invalid or missing token.' });
  }

  // Brevo posts one event object per call (not a batch array, unlike SendGrid).
  const event = req.body || {};
  const leadId = Array.isArray(event.tags) ? event.tags[0] : '';
  if (!leadId) return res.status(200).json({ ok: true });

  const lead = await Lead.findById(leadId).catch(() => null);
  if (!lead) return res.status(200).json({ ok: true });

  switch (event.event) {
    case 'opened':
    case 'unique_opened':
      lead.outreach.openCount += 1;
      lead.outreach.lastOpenedAt = new Date();
      break;
    case 'click':
      lead.outreach.clickCount += 1;
      lead.outreach.lastClickedAt = new Date();
      break;
    case 'hard_bounce':
    case 'soft_bounce':
    case 'spam':
    case 'blocked':
    case 'invalid_email':
      lead.outreach.bounced = true;
      break;
    default:
      return res.status(200).json({ ok: true });
  }

  await lead.save();
  res.status(200).json({ ok: true });
}));

export default router;
