import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import scrapeRoutes from './routes/scrape.js';
import leadsRoutes from './routes/leads.js';
import demoRoutes from './routes/demo.js';
import webhookRoutes from './routes/webhooks.js';
import Lead from './models/Lead.js';

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/leadforge';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

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
    // Demo site pages (routes/demo.js) load Google Fonts and hotlink Google-hosted
    // business photos — the default 'self'-only CSP would silently block both.
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'img-src': ["'self'", 'data:', 'https://lh3.googleusercontent.com'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
      },
    },
  })
);
app.use(cors({ origin: CLIENT_ORIGIN }));

// Mounted before express.json() below: Resend's webhook signature is computed over the
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

app.use('/api/scrape', scrapeRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/demo', demoRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.name === 'CastError' || err.name === 'ValidationError') {
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
