import { renderTemplate as warmLocal } from './warmLocal.js';
import { renderTemplate as cleanProfessional } from './cleanProfessional.js';
import { renderTemplate as boldModern } from './boldModern.js';
import { renderTemplate as classicService } from './classicService.js';

const TEMPLATES = { warmLocal, cleanProfessional, boldModern, classicService };

export function renderDemoSite(lead, demoSite) {
  const render = TEMPLATES[demoSite.templateKey] || TEMPLATES.cleanProfessional;
  return render(lead, demoSite);
}
