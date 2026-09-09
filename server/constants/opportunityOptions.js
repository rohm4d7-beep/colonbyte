// Shared between the Lead model (schema enum), the opportunity analysis service (which must
// pick from this controlled set rather than freeform categories), and the outreach generators/
// UI (which map a category to a human-readable solution label and a demo strategy hint).
// Centralizing this mapping here — rather than scattering per-category conditionals through
// routes/services — is what makes adding a new opportunity type later a one-line change.

export const OPPORTUNITY_CATEGORIES = [
  'WEBSITE_CONVERSION',
  'WEBSITE_UX',
  'AI_CHATBOT',
  'AI_CUSTOMER_ASSISTANT',
  'AI_RECEPTIONIST',
  'LEAD_QUALIFICATION',
  'AUTOMATED_FOLLOW_UP',
  'APPOINTMENT_AUTOMATION',
  'ENQUIRY_AUTOMATION',
  'CRM_WORKFLOW_AUTOMATION',
  'INTERNAL_BUSINESS_TOOL',
  'DASHBOARD',
  'CLIENT_PORTAL',
  'CUSTOM_SOFTWARE',
  'INTEGRATION',
  'NO_STRONG_OPPORTUNITY',
];

export const OPPORTUNITY_CONFIDENCE_LEVELS = ['low', 'medium', 'high'];

export const DEMO_STRATEGIES = ['NO_DEMO', 'OFFER_DEMO', 'INCLUDE_DEMO'];

// opportunity -> { label, demoStrategy }. `label` is what COLONBYTE actually sells (section 15
// of the brief: sell the business opportunity, not the technical implementation — this label is
// for internal/UI use, never dropped verbatim into outreach copy). `demoStrategy` is only a
// starting-point suggestion the demo section of the UI can show; it never forces or blocks
// anything — demo generation stays fully manual either way (see LeadDetailDrawer.jsx).
export const OPPORTUNITY_SOLUTION_MAP = {
  WEBSITE_CONVERSION: { label: 'Website redesign / conversion improvement', demoStrategy: 'OFFER_DEMO' },
  WEBSITE_UX: { label: 'Website redesign / UX improvement', demoStrategy: 'OFFER_DEMO' },
  AI_CHATBOT: { label: 'Website AI assistant', demoStrategy: 'NO_DEMO' },
  AI_CUSTOMER_ASSISTANT: { label: 'AI knowledge/customer assistant', demoStrategy: 'NO_DEMO' },
  AI_RECEPTIONIST: { label: 'AI voice/chat receptionist', demoStrategy: 'NO_DEMO' },
  LEAD_QUALIFICATION: { label: 'AI lead qualification system', demoStrategy: 'NO_DEMO' },
  AUTOMATED_FOLLOW_UP: { label: 'Automated follow-up workflow', demoStrategy: 'NO_DEMO' },
  APPOINTMENT_AUTOMATION: { label: 'Scheduling / appointment workflow', demoStrategy: 'NO_DEMO' },
  ENQUIRY_AUTOMATION: { label: 'Enquiry handling workflow', demoStrategy: 'NO_DEMO' },
  CRM_WORKFLOW_AUTOMATION: { label: 'CRM / workflow automation', demoStrategy: 'NO_DEMO' },
  INTERNAL_BUSINESS_TOOL: { label: 'Custom internal application', demoStrategy: 'NO_DEMO' },
  DASHBOARD: { label: 'Analytics / operations dashboard', demoStrategy: 'NO_DEMO' },
  CLIENT_PORTAL: { label: 'Customer portal', demoStrategy: 'NO_DEMO' },
  CUSTOM_SOFTWARE: { label: 'Custom software development', demoStrategy: 'NO_DEMO' },
  INTEGRATION: { label: 'API / system integration', demoStrategy: 'NO_DEMO' },
  NO_STRONG_OPPORTUNITY: { label: '', demoStrategy: 'NO_DEMO' },
};

// AI_CHATBOT/LEAD_QUALIFICATION/INTERNAL_BUSINESS_TOOL default to NO_DEMO rather than
// OFFER_DEMO because the existing demo engine (services/demoContentGenerator.js +
// demoTemplates/) only ever builds a static website preview — offering "a demo" for a chatbot
// or workflow opportunity today would silently hand over a website mockup that has nothing to
// do with what was actually pitched. Only WEBSITE_* opportunities get OFFER_DEMO until the demo
// engine grows non-website prototype types (see brief section 17/33 on extensibility).

export function opportunityLabel(category) {
  return OPPORTUNITY_SOLUTION_MAP[category]?.label || '';
}

export function opportunityDemoStrategy(category) {
  return OPPORTUNITY_SOLUTION_MAP[category]?.demoStrategy || 'NO_DEMO';
}
