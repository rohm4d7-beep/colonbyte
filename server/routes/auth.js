import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { rateLimit } from 'express-rate-limit';
import Admin from '../models/Admin.js';
import { sendEmail } from '../services/emailSender.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

const OTP_TTL_MS = 10 * 60_000;

// Single-admin app (no signup, no user collection) - the credential lives in the Admin
// document (models/Admin.js), password only ever stored as a bcrypt hash. Login is two steps:
// email+password, then a 6-digit code emailed to that address (a real push-notification
// prompt would need a mobile app; email is what actually gets a "check your phone" moment for
// a single-operator tool without building one). Both steps have their own tight rate limit -
// step one guards password brute-forcing, step two guards the 1-in-a-million OTP guess space,
// which matters far more with only 6 digits.
const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' },
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60_000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many code attempts. Request a new one.' },
});

// Brevo's shared sending domain intermittently soft-bounces against Gmail's DMARC check (see
// project notes) - a fresh code with no password re-entry is the practical mitigation until the
// sending domain is authenticated. Same abuse surface as the OTP guess itself, so same budget.
const resendLimiter = rateLimit({
  windowMs: 10 * 60_000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many resend requests. Wait a bit and try again.' },
});

async function issueOtp(req, res, email) {
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  req.session.pendingOtp = {
    code,
    email,
    expiresAt: Date.now() + OTP_TTL_MS,
  };

  const sent = await sendEmail({
    to: email,
    subject: 'Your Colon Byte login code',
    body: `Your login code is ${code}\n\nIt expires in 10 minutes. If this wasn't you, ignore this email.`,
  });
  if (!sent.success) {
    console.error('[auth] Failed to send OTP email:', sent.error);
    res.status(502).json({ error: 'Could not send the verification code. Try again.' });
    return false;
  }

  res.json({ otpRequired: true });
  return true;
}

router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const admin = await Admin.findOne({ email: String(email).trim().toLowerCase() });
  if (!admin) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  await issueOtp(req, res, admin.email);
}));

router.post('/resend-otp', resendLimiter, asyncHandler(async (req, res) => {
  const pending = req.session.pendingOtp;
  if (!pending) {
    return res.status(400).json({ error: 'Start over — no login in progress.' });
  }
  await issueOtp(req, res, pending.email);
}));

router.post('/verify-otp', otpLimiter, asyncHandler(async (req, res) => {
  const { code } = req.body || {};
  const pending = req.session.pendingOtp;

  if (!pending) {
    return res.status(400).json({ error: 'Start over — no login in progress.' });
  }
  if (Date.now() > pending.expiresAt) {
    delete req.session.pendingOtp;
    return res.status(400).json({ error: 'Code expired. Log in again.' });
  }
  if (String(code || '').trim() !== pending.code) {
    return res.status(401).json({ error: 'Incorrect code.' });
  }

  req.session.authenticated = true;
  req.session.email = pending.email;
  delete req.session.pendingOtp;
  res.json({ ok: true, email: pending.email });
}));

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

router.get('/me', (req, res) => {
  if (req.session?.authenticated) {
    return res.json({ authenticated: true, email: req.session.email });
  }
  res.json({ authenticated: false });
});

router.patch('/password', requireAuth, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  }

  const admin = await Admin.findOne({ email: req.session.email });
  if (!admin) return res.status(404).json({ error: 'Admin account not found.' });

  const valid = await bcrypt.compare(currentPassword || '', admin.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }

  admin.passwordHash = await bcrypt.hash(newPassword, 12);
  await admin.save();
  res.json({ ok: true });
}));

export default router;
