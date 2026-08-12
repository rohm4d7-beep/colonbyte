import { Router } from 'express';
import Lead from '../models/Lead.js';
import { renderDemoSite } from '../services/demoTemplates/index.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

function simplePage(title, message) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<style>
  body { font-family: system-ui, sans-serif; background: #09090b; color: #f4f4f5; min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 24px; }
  p { color: #9a9aa5; margin-top: 8px; }
</style>
</head>
<body>
  <div>
    <h1 style="font-size: 20px; font-weight: 600;">${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}

router.get('/:id', asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id).lean();

  if (!lead) {
    return res.status(404).type('html').send(simplePage('Demo not found', 'This preview link is invalid or has been removed.'));
  }

  if (lead.demoSite?.status !== 'completed') {
    return res.status(404).type('html').send(simplePage('Demo not ready yet', 'This business’s demo site hasn’t been generated yet.'));
  }

  res.type('html').send(renderDemoSite(lead, lead.demoSite));
}));

export default router;
