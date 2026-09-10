import mongoose from 'mongoose';
import { TEMPLATE_KEYS } from '../constants/demoOptions.js';
import { OPPORTUNITY_CATEGORIES, OPPORTUNITY_CONFIDENCE_LEVELS, DEMO_STRATEGIES } from '../constants/opportunityOptions.js';

export const WEBSITE_STATUSES = [
  'none',
  'facebook_only',
  'instagram_only',
  'google_business_only',
  'broken',
  'unverified',
  'outdated',
  // A real, functioning site that scored too weak to count as a genuine competitor to a new
  // build (websiteAnalyzer.js: quality score 40-59) - distinct from `has_website` (>=60,
  // confirmed solid, excluded outright) so the dashboard can actually show "existing but weak"
  // as its own thing instead of it hiding inside a score number next to a generic label.
  'weak_website',
  'has_website',
];

const aiAnalysisSchema = new mongoose.Schema(
  {
    summary: { type: String, default: '' },
    // Whether the AI found a defensible, non-fabricated reason to contact this business at all -
    // null means "not yet analyzed" (see Lead.js's websiteStatus default-omission comment for
    // why that distinction matters). false means the analysis deliberately found no strong
    // angle rather than forcing one - routes/leads.js still lets a human override and generate
    // outreach anyway (see [[project-leadforge-pipeline-issues]] / COLONBYTE brief section 27:
    // Leadforge prepares, a human decides).
    worthContacting: { type: Boolean, default: null },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    // The single strongest, most specific, data-grounded outreach angle for this lead - deliberately
    // singular (not another bullet list) so outreach generation has one concrete thing to build
    // around instead of picking arbitrarily from a pile of suggestions. Empty when worthContacting
    // is false.
    opportunity: { type: String, default: '' },
    suggestions: { type: [String], default: [] },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    analyzedAt: { type: Date, default: null },
  },
  { _id: false }
);

// Heuristic evidence extracted from the same website HTML analyzeWebsite() already fetches for
// scoring (services/websiteAnalyzer.js's detectWebsiteSignals) - persisted at scrape/recheck
// time alongside websiteStatus so opportunityAnalysis.js can read it without re-fetching the
// site on every /analyze call. These are detection signals, not proof of internal business
// process - see opportunityAnalysis.js's system prompt for how that distinction is enforced.
const websiteSignalsSchema = new mongoose.Schema(
  {
    hasBookingLanguage: { type: Boolean, default: false },
    hasQuoteOrEnquiryForm: { type: Boolean, default: false },
    hasFaqSection: { type: Boolean, default: false },
    hasChatWidget: { type: Boolean, default: false },
    hasMultipleLocationsLanguage: { type: Boolean, default: false },
    hasMultiplePractitionersLanguage: { type: Boolean, default: false },
    navLinkCount: { type: Number, default: 0 },
  },
  { _id: false }
);

// The opportunity engine's output - see server/constants/opportunityOptions.js for the
// controlled category enum and the category -> solution/demo-strategy mapping. Deliberately a
// separate analysis pass from aiAnalysis (business quality/worthContacting) rather than folded
// into it - see services/opportunityAnalysis.js for why. status/analyzedAt mirror
// aiAnalysisSchema's pending/completed/failed pattern for the same reason (distinguishing "not
// yet analyzed" from "analyzed, found nothing").
const opportunityAnalysisSchema = new mongoose.Schema(
  {
    // No default (unlike most other fields here) - Mongoose applies a subdocument's field
    // defaults on every save, even when the caller only meant to set `status`, and an empty
    // string is not a valid enum member for either field. A default of '' here would make
    // lead.save() throw a ValidationError on every write where opportunityAnalysis is only
    // { status: 'failed' } (e.g. the Groq call hit a rate limit) - exactly the case that most
    // needs to save cleanly. Leaving these undefined lets Mongoose's enum validator skip them
    // entirely, matching the same "no default on an enum field" pattern websiteStatus uses above.
    primaryOpportunity: { type: String, enum: OPPORTUNITY_CATEGORIES },
    opportunityConfidence: { type: String, enum: OPPORTUNITY_CONFIDENCE_LEVELS },
    // The specific, grounded facts the model pointed to - shown verbatim in the lead detail UI
    // so a human can sanity-check the reasoning against real evidence rather than trusting a
    // label alone.
    evidence: { type: [String], default: [] },
    reasoning: { type: String, default: '' },
    // The natural, discovery-style question/observation outreach should open with (see brief
    // section 14) - deliberately NOT a claim of fact. This is what the outreach generators
    // consume as the primary angle, in place of aiAnalysis.opportunity.
    outreachAngle: { type: String, default: '' },
    // Human-readable label from OPPORTUNITY_SOLUTION_MAP, stored (not just derived) so the
    // export CSV and any historical read of a lead reflects what the category meant at the time
    // it was analyzed, even if the map's wording changes later.
    solutionCategory: { type: String, default: '' },
    secondaryOpportunities: { type: [String], enum: OPPORTUNITY_CATEGORIES, default: [] },
    demoStrategy: { type: String, enum: DEMO_STRATEGIES, default: 'NO_DEMO' },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    analyzedAt: { type: Date, default: null },
  },
  { _id: false }
);

const demoSiteSchema = new mongoose.Schema(
  {
    templateKey: { type: String, enum: TEMPLATE_KEYS },
    // No enum here (unlike templateKey) - services/brandColorExtractor.js sets this to a color
    // pulled directly from the business's own real photos when one's available (contrast-
    // adjusted, but not snapped to a fixed palette), so it can legitimately be any hex, not
    // just one of ACCENT_COLORS. The AI fallback path (demoContentGenerator.js, used when a
    // lead has no usable photos) still only ever picks from ACCENT_COLORS itself.
    accentColor: { type: String },
    // A curated set of 3+ colors the AI judged as fitting this specific business's vibe (from
    // ACCENT_COLORS), or the business's own extracted color prepended in front of that set —
    // picked once on first generation. accentColor is shuffled from this set on every generate
    // (including the first) — gives real per-regenerate variety while never drifting into a
    // color that doesn't suit the business, unlike picking freely from all of ACCENT_COLORS
    // each time.
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

const whatsappOutreachSchema = new mongoose.Schema(
  {
    message: { type: String, default: '' },
    // No 'sent' here - a wa.me click-to-chat link only opens WhatsApp with the message
    // pre-filled, the operator still has to hit send themselves inside WhatsApp, so this app
    // can never actually confirm delivery. 'opened' just means the link was clicked.
    status: { type: String, enum: ['pending', 'drafted', 'opened', 'failed'], default: 'pending' },
    generatedAt: { type: Date, default: null },
    openedAt: { type: Date, default: null },
  },
  { _id: false }
);

// Same shape/semantics as whatsappOutreachSchema - Instagram and Facebook have no API-driven
// send path here (no official deep-link that pre-fills a DM the way wa.me does for WhatsApp),
// so this only ever tracks a manual copy-and-paste-into-the-app workflow. 'opened' means the
// operator clicked through to the profile after copying the message, not that it was sent.
const instagramOutreachSchema = new mongoose.Schema(
  {
    message: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'drafted', 'opened', 'failed'], default: 'pending' },
    generatedAt: { type: Date, default: null },
    openedAt: { type: Date, default: null },
  },
  { _id: false }
);

const facebookOutreachSchema = new mongoose.Schema(
  {
    message: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'drafted', 'opened', 'failed'], default: 'pending' },
    generatedAt: { type: Date, default: null },
    openedAt: { type: Date, default: null },
  },
  { _id: false }
);

// One follow-up slot per channel, gated on the parent message actually having gone out
// (outreach.status === 'sent' / whatsappOutreach.status === 'opened') - a single nudge
// covers the "manual follow-up" use case without building a full unbounded thread.
const followUpEmailSchema = new mongoose.Schema(
  {
    subject: { type: String, default: '' },
    body: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'drafted', 'sent', 'failed'], default: 'pending' },
    generatedAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
    providerMessageId: { type: String, default: '' },
  },
  { _id: false }
);

const followUpWhatsappSchema = new mongoose.Schema(
  {
    message: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'drafted', 'opened', 'failed'], default: 'pending' },
    generatedAt: { type: Date, default: null },
    openedAt: { type: Date, default: null },
  },
  { _id: false }
);

// Same shape/semantics as followUpWhatsappSchema - Instagram has no API-driven send path
// (instagramOutreachSchema above), so a follow-up is the same manual copy-and-paste-into-the-app
// workflow as the original message, gated on the original having actually been opened.
const followUpInstagramSchema = new mongoose.Schema(
  {
    message: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'drafted', 'opened', 'failed'], default: 'pending' },
    generatedAt: { type: Date, default: null },
    openedAt: { type: Date, default: null },
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },
    email: { type: String, default: '' },
    instagramUrl: { type: String, default: '' },
    facebookUrl: { type: String, default: '' },
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
    // No default object here either, mirroring websiteStatus above - absent means "this lead
    // predates websiteAnalyzer.js's signal detection," distinguishable from a real analysis
    // that found none of these signals present.
    websiteSignals: { type: websiteSignalsSchema },
    highPriority: { type: Boolean, default: false },
    aiAnalysis: { type: aiAnalysisSchema, default: () => ({}) },
    opportunityAnalysis: { type: opportunityAnalysisSchema, default: () => ({}) },
    demoSite: { type: demoSiteSchema, default: () => ({}) },
    outreach: { type: outreachSchema, default: () => ({}) },
    whatsappOutreach: { type: whatsappOutreachSchema, default: () => ({}) },
    instagramOutreach: { type: instagramOutreachSchema, default: () => ({}) },
    facebookOutreach: { type: facebookOutreachSchema, default: () => ({}) },
    outreachFollowUp: { type: followUpEmailSchema, default: () => ({}) },
    whatsappFollowUp: { type: followUpWhatsappSchema, default: () => ({}) },
    instagramFollowUp: { type: followUpInstagramSchema, default: () => ({}) },
    keyword: { type: String, required: true },
    status: { type: String, enum: ['new', 'contacted', 'converted'], default: 'new' },
  },
  { timestamps: true }
);

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
leadSchema.index({ 'opportunityAnalysis.primaryOpportunity': 1 });

export default mongoose.model('Lead', leadSchema);
