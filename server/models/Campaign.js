import mongoose from 'mongoose';

// Auto-created once per scrape job (routes/scrape.js's /start), never configured upfront - per
// explicit product decision, this exists to group leads by the run that found them (for the
// funnel/campaign analytics phase still to come) without adding any extra step to starting a
// scrape today. `name` is generated once at creation and never recomputed, so it stays a stable
// label even if the same keyword/country gets searched again later.
const campaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    keyword: { type: String, required: true },
    country: { type: String, required: true },
    jobId: { type: String, required: true },
    requireContact: { type: Boolean, default: false },
    prioritizeContact: { type: Boolean, default: false },
    status: { type: String, enum: ['running', 'done', 'error'], default: 'running' },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

campaignSchema.index({ jobId: 1 }, { unique: true });
campaignSchema.index({ createdAt: -1 });

export default mongoose.model('Campaign', campaignSchema);
