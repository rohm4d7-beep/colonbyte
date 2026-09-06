// Gates the internal admin API (leads CRUD, scrape triggers, outreach sending) behind a login
// session. Deliberately NOT applied to /demo/:id (public preview links sent to prospects - they
// must load with no login) or /webhooks (SendGrid signs its own requests, verified separately
// in routes/webhooks.js) or /api/health.
export function requireAuth(req, res, next) {
  if (req.session?.authenticated) return next();
  return res.status(401).json({ error: 'Not authenticated.' });
}
