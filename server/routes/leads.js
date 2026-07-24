import { Router } from 'express';
import { Parser as CsvParser } from 'json2csv';
import Lead from '../models/Lead.js';

const router = Router();

router.get('/stats', async (req, res) => {
  const [total, emails, contacted, converted] = await Promise.all([
    Lead.countDocuments({}),
    Lead.countDocuments({ email: { $ne: '' } }),
    Lead.countDocuments({ status: 'contacted' }),
    Lead.countDocuments({ status: 'converted' }),
  ]);
  res.json({ total, emails, contacted, converted });
});

router.get('/export', async (req, res) => {
  const leads = await Lead.find({}).sort({ createdAt: -1 }).lean();
  const fields = ['businessName', 'email', 'phone', 'website', 'address', 'country', 'keyword', 'status', 'createdAt'];
  const parser = new CsvParser({ fields });
  const csv = parser.parse(leads);

  res.set({
    'Content-Type': 'text/csv',
    'Content-Disposition': 'attachment; filename="leads.csv"',
  });
  res.send(csv);
});

router.get('/', async (req, res) => {
  const { country, status, search, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (country) filter.country = country;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { businessName: { $regex: search, $options: 'i' } },
      { keyword: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 20);

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Lead.countDocuments(filter),
  ]);

  res.json({ leads, total, pages: Math.max(1, Math.ceil(total / limitNum)) });
});

router.patch('/:id/status', async (req, res) => {
  const { status } = req.body || {};
  if (!['new', 'contacted', 'converted'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }
  const lead = await Lead.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });
  res.json(lead);
});

router.delete('/:id', async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });
  res.json({ ok: true });
});

router.delete('/', async (req, res) => {
  const { deletedCount } = await Lead.deleteMany({});
  res.json({ ok: true, deletedCount });
});

export default router;
