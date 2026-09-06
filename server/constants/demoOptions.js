// Shared between the Lead model (schema enums), the AI content generator (which must
// pick from these rather than freeform values), and the template renderers.

export const TEMPLATE_KEYS = ['warmLocal', 'refinedEditorial', 'boldModern', 'classicService', 'boutiqueHeritage'];

// Curated so every choice reads cleanly with white CTA/button text — never left to
// freeform AI-picked hex, which risks unreadable or clashing combinations.
export const ACCENT_COLORS = [
  '#e8542e', // warm terracotta
  '#ea580c', // deep orange
  '#2563eb', // trust blue
  '#0d9488', // teal
  '#7c3aed', // violet
  '#be123c', // rose
  '#15803d', // forest green
  '#334155', // slate
  '#92400e', // muted brass — for refinedEditorial/boutiqueHeritage's warm editorial palette
  '#db2777', // pink — rose above reads as dark red, not pink; needed for real-photo color
  // matching (services/brandColorExtractor.js) to have an actual pink to snap to
];
