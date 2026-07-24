import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import scrapeRoutes from './routes/scrape.js';
import leadsRoutes from './routes/leads.js';

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devsaura-leads';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/scrape', scrapeRoutes);
app.use('/api/leads', leadsRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('[server] Connected to MongoDB');
    app.listen(PORT, () => console.log(`[server] Listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('[server] MongoDB connection failed:', err.message);
    process.exit(1);
  });
