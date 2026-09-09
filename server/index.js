import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import scrapeRoutes from './routes/scrape.js';
import leadsRoutes from './routes/leads.js';
import demoRoutes from './routes/demo.js';
import webhookRoutes from './routes/webhooks.js';
import authRoutes from './routes/auth.js';
import { requireAuth } from './middleware/requireAuth.js';
import Lead from './models/Lead.js';

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/leadforge';
// Comma-separated so the deployed Vercel dashboard and local dev can both be allowed at once,
// e.g. CLIENT_ORIGIN="https://leadforge.vercel.app,http://localhost:3002".
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGIN || 'http://localhost:3002')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const app = express();
app.disable('x-powered-by');
// Render (like Fly/Railway) puts one reverse proxy in front of the app — express-rate-limit
// refuses to trust the X-Forwarded-For header it relies on for real client IPs unless this is
// set, and throws on every rate-limited request instead of silently doing the wrong thing.
// `1` means "trust exactly one hop," matching a single reverse proxy; it stays correct for
// local dev too since there's no proxy there and the header is simply absent.
app.set('trust proxy', 1);
app.use(
  helmet({
    // Demo site pages (routes/demo.js) load Google Fonts, hotlink Google-hosted business
    // photos, and fall back to a Pexels stock photo when no usable real photo was found —
    // the default 'self'-only CSP would silently block all three (a blocked <img> just
    // renders its alt text, no console-visible network error, which is why this went unnoticed).
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'img-src': ["'self'", 'data:', 'https://lh3.googleusercontent.com', 'https://images.pexels.com'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
      },
    },
  })
);
app.use(
  cors({
    origin(origin, callback) {
      // No Origin header (curl, server-to-server, same-origin) - allow.
      if (!origin || CLIENT_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

// The lead database, scrape triggers, and outreach-sending were reachable by anyone on the
// internet with zero credentials (confirmed live against the deployed Render URL) - this is
// what actually gates them. MongoStore persists sessions in the same Atlas cluster rather than
// in-memory, so logins survive server restarts (this app restarts a lot in dev via
// `node --watch`, and Render's free tier sleeps/wakes the process too - an in-memory store
// would silently log the admin out every time either happens).
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGODB_URI, collectionName: 'sessions' }),
    cookie: {
      httpOnly: true,
      // The Vercel-hosted dashboard and the Render backend are different origins, so the
      // cookie needs SameSite=None (which itself requires Secure) to be sent at all - 'lax'
      // silently drops it on cross-origin requests. Local dev stays on 'lax' since it's
      // same-origin through Vite's proxy, and 'none' without HTTPS wouldn't work there anyway.
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);

// Mounted before express.json() below: SendGrid's webhook signature is computed over the
// raw request bytes, so this route needs the unparsed Buffer, not a parsed JSON object.
app.use(
  '/webhooks',
  rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: true, legacyHeaders: false }),
  express.raw({ type: 'application/json', limit: '100kb' }),
  webhookRoutes
);

app.use(express.json({ limit: '100kb' }));
app.use(mongoSanitize());

app.use(
  '/api',
  rateLimit({
    windowMs: 60_000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use('/api/auth', authRoutes);
// /demo/:id deliberately stays unauthenticated below - those are public preview links sent to
// prospects in outreach emails, who never log in.
app.use('/api/scrape', requireAuth, scrapeRoutes);
app.use('/api/leads', requireAuth, leadsRoutes);
app.use('/demo', demoRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.name === 'CastError' || err.name === 'ValidationError') {
    console.error(`[server] ${err.name} on ${req.method} ${req.originalUrl}:`, err.message);
    return res.status(400).json({ error: 'Invalid request.' });
  }
  console.error('[server] Unhandled error:', err);
  res.status(err.status || 500).json({ error: 'Internal server error.' });
});

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('[server] Connected to MongoDB');
    await Lead.syncIndexes();
    app.listen(PORT, () => console.log(`[server] Listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('[server] MongoDB connection failed:', err.message);
    process.exit(1);
  });
