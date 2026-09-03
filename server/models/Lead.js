import mongoose from 'mongoose';
import { TEMPLATE_KEYS, ACCENT_COLORS } from '../constants/demoOptions.js';

export const WEBSITE_STATUSES = [
  'none',
  'facebook_only',
  'instagram_only',
  'google_business_only',
  'broken',
  'unverified',
  'outdated',
  'has_website',
];

const aiAnalysisSchema = new mongoose.Schema(
  {
    summary: { type: String, default: '' },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
    estimatedLostCustomers: { type: String, default: '' },
    leadQualityScore: { type: Number, default: null },
    websiteOpportunityScore: { type: Number, default: null },
    revenueOpportunityEstimate: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    analyzedAt: { type: Date, default: null },
  },
  { _id: false }
);

const demoSiteSchema = new mongoose.Schema(
  {
    templateKey: { type: String, enum: TEMPLATE_KEYS },
    accentColor: { type: String, enum: ACCENT_COLORS },
    // A curated set of 3+ colors (from ACCENT_COLORS) the AI judged as fitting this specific
    // business's vibe, picked once on first generation. accentColor is shuffled from this set
    // on every generate (including the first) — gives real per-regenerate variety while never
    // drifting into a color that doesn't suit the business, unlike picking freely from all of
    // ACCENT_COLORS each time.
    accentColorOptions: { type: [String], default: [] },
    tagline: { type: String, default: '' },
    aboutText: { type: String, default: '' },
    services: { type: [String], default: [] },
    ctaText: { type: String, default: '' },
    // A good real photo of the business itself, AI-picked from several scraped from its Google
    // Maps listing (services/listingPhotoScraper.js + photoSelector.js) — falls back to a
    // curated stock photo (services/imageSearch.js), then to the single scraped hero photo
    // (lead.photos[0]) if neither AI step finds anything usable.
    heroImage: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    generatedAt: { type: Date, default: null },
  },
  { _id: false }
);

const outreachSchema = new mongoose.Schema(
  {
    subject: { type: String, default: '' },
    body: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'drafted', 'sending', 'sent', 'failed'], default: 'pending' },
    generatedAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
    providerMessageId: { type: String, default: '' },
    openCount: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
    lastOpenedAt: { type: Date, default: null },
    lastClickedAt: { type: Date, default: null },
    bounced: { type: Boolean, default: false },
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    normalizedPhone: { type: String, default: '' },
    website: { type: String, default: '' },
    websiteDomain: { type: String, default: '' },
    address: { type: String, default: '' },
    country: { type: String, default: '' },
    countryCode: { type: String, default: '' },
    countryVerified: { type: Boolean, default: false },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    placeId: { type: String },
    rating: { type: Number, default: null },
    reviewCount: { type: Number, default: null },
    category: { type: String, default: '' },
    openingHoursSummary: { type: String, default: '' },
    photoCount: { type: Number, default: 0 },
    photos: { type: [String], default: [] },
    // No default: an absent value means "never actually analyzed" and must stay
    // distinguishable from 'none' (analyzeWebsite() confirmed no website exists). A default
    // here would get silently materialized by Mongoose on any load+save of an old/unanalyzed
    // lead, permanently baking a fabricated "no website" verdict into real data.
    websiteStatus: { type: String, enum: WEBSITE_STATUSES },
    websiteQualityScore: { type: Number, default: 0 },
    highPriority: { type: Boolean, default: false },
    aiAnalysis: { type: aiAnalysisSchema, default: () => ({}) },
    demoSite: { type: demoSiteSchema, default: () => ({}) },
    outreach: { type: outreachSchema, default: () => ({}) },
    keyword: { type: String, required: true },
    status: { type: String, enum: ['new', 'contacted', 'converted'], default: 'new' },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// Same absolute URL outreachGenerator.js embeds in outreach emails — exposed here so the
// dashboard's own "Preview Demo" link always opens the real public demo instead of a
// relative /demo/:id that breaks depending on which local port the dashboard happens to
// be loaded from. Exported separately because routes/leads.js's list endpoint uses .lean()
// (plain objects, no virtuals) for performance and must attach this by hand.
export function demoPreviewUrlFor(lead) {
  if (lead.demoSite?.status !== 'completed') return null;
  return `${process.env.PUBLIC_BASE_URL || ''}/demo/${lead._id}`;
}

leadSchema.virtual('demoPreviewUrl').get(function () {
  return demoPreviewUrlFor(this);
});

leadSchema.index({ businessName: 1, keyword: 1 });
leadSchema.index({ placeId: 1 }, { unique: true, sparse: true });
leadSchema.index({ normalizedPhone: 1 }, { sparse: true });
leadSchema.index({ websiteDomain: 1 }, { sparse: true });
leadSchema.index({ lat: 1, lng: 1 }, { sparse: true });
leadSchema.index({ countryCode: 1 });
leadSchema.index({ websiteStatus: 1 });
leadSchema.index({ highPriority: 1 });
leadSchema.index({ rating: 1 });
leadSchema.index({ 'aiAnalysis.status': 1 });
leadSchema.index({ 'outreach.status': 1 });

export default mongoose.model('Lead', leadSchema);
