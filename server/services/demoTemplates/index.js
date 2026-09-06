import { renderTemplate as warmLocal } from './warmLocal.js';
import { renderTemplate as refinedEditorial } from './refinedEditorial.js';
import { renderTemplate as boldModern } from './boldModern.js';
import { renderTemplate as classicService } from './classicService.js';
import { renderTemplate as boutiqueHeritage } from './boutiqueHeritage.js';

const TEMPLATES = { warmLocal, refinedEditorial, boldModern, classicService, boutiqueHeritage };

export function renderDemoSite(lead, demoSite) {
  const render = TEMPLATES[demoSite.templateKey] || TEMPLATES.refinedEditorial;
  return render(lead, demoSite);
}
