import { Router } from 'express';
import { getSnapshot } from '../services/groqUsageTracker.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ keys: getSnapshot() });
});

export default router;
