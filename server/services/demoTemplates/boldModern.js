import { escapeHtml, renderReviewCallout, renderContactFooter, htmlDocument } from './shared.js';

// For salons, fitness, beauty, creative studios, boutique hospitality, retail (see
// demoContentGenerator.js's category mapping) - this category's real competitors are
// editorial fashion/beauty sites: full-bleed photography, confident display type, an
// asymmetric split rather than a centered stack of flat color blocks. A business that
// already invests in its look (see: any boutique salon's actual site) will read a flat
// black hero with a small padded photo box as a downgrade, not a pitch.
export function renderTemplate(lead, demoSite) {
  const { accentColor, tagline, aboutText, services, ctaText } = demoSite;
  const photo = demoSite.heroImage || lead.photos?.[0] || '';
  const initial = (lead.businessName || '?').trim().charAt(0).toUpperCase();

  const heroVisual = photo
    ? `<img src="${photo}" alt="${escapeHtml(lead.businessName)}" style="width:100%;height:100%;object-fit:cover;" />`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:radial-gradient(120% 120% at 20% 15%, ${accentColor}33, transparent 60%), #17161a;">
         <span style="font-family:'Fraunces',serif;font-size:min(28vw,320px);font-weight:500;color:${accentColor};line-height:1;">${escapeHtml(initial)}</span>
       </div>`;

  const servicesGrid = !services?.length
    ? ''
    : `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));column-gap:48px;border-top:1px solid #26242b;">
        ${services
          .map(
            (s) => `
          <div style="padding:20px 0;border-bottom:1px solid #26242b;">
            <span style="font:500 17px/1.4 'Inter',system-ui,sans-serif;color:#f2f0ec;">${escapeHtml(s)}</span>
          </div>`
          )
          .join('')}
      </div>`;

  const content = `
    <style>
      @media (max-width: 760px) {
        .bm-hero { grid-template-columns: 1fr !important; min-height: 0 !important; }
        .bm-hero-visual { height: 320px; }
        .bm-hero-copy { padding: 48px 24px !important; }
      }
    </style>
    <section class="bm-hero" style="display:grid;grid-template-columns:52% 48%;min-height:640px;background:#17161a;">
      <div class="bm-hero-visual" style="position:relative;overflow:hidden;">${heroVisual}</div>
      <div class="bm-hero-copy" style="display:flex;flex-direction:column;justify-content:center;padding:64px 56px;color:#f2f0ec;">
        <div style="font:500 14px/1.4 'Inter',system-ui,sans-serif;color:${accentColor};margin-bottom:18px;">${escapeHtml(lead.category || 'Studio')}</div>
        <h1 style="font-family:'Fraunces',serif;font-size:clamp(34px,4.4vw,56px);font-weight:500;line-height:1.05;letter-spacing:-0.01em;margin-bottom:22px;text-wrap:balance;">${escapeHtml(lead.businessName)}</h1>
        <p style="font:400 18px/1.55 'Inter',system-ui,sans-serif;color:#c8c5c2;max-width:38ch;margin-bottom:34px;">${escapeHtml(tagline)}</p>
        <div>
          <a href="tel:${escapeHtml(lead.phone || '')}" style="display:inline-block;background:${accentColor};color:#17161a;font:600 15px 'Inter',system-ui,sans-serif;padding:15px 30px;border-radius:2px;text-decoration:none;">${escapeHtml(ctaText)}</a>
        </div>
      </div>
    </section>

    <section style="background:#f7f5f2;padding:88px 56px;">
      <div style="max-width:760px;margin:0 auto;text-align:center;">
        <p style="font-family:'Fraunces',serif;font-size:clamp(22px,2.6vw,30px);font-weight:400;font-style:italic;line-height:1.5;color:#242226;text-wrap:balance;">${escapeHtml(aboutText)}</p>
        ${lead.rating ? `<div style="margin-top:36px;display:flex;justify-content:center;">${renderReviewCallout(lead, accentColor)}</div>` : ''}
      </div>
    </section>

    <section style="background:#17161a;padding:88px 56px;">
      <div style="max-width:900px;margin:0 auto;">
        <h2 style="font-family:'Fraunces',serif;font-size:28px;font-weight:500;color:#f2f0ec;margin-bottom:36px;">What they offer</h2>
        ${servicesGrid}
      </div>
    </section>

    <footer style="padding:48px 56px;background:#0f0e11;color:#c8c5c2;border-top:1px solid #26242b;">
      <div style="max-width:900px;margin:0 auto;">
        <h3 style="font-family:'Fraunces',serif;font-size:19px;color:#f2f0ec;margin-bottom:20px;">${escapeHtml(lead.businessName)}</h3>
        ${renderContactFooter(lead)}
      </div>
    </footer>
  `;

  return htmlDocument({
    title: `${lead.businessName} — Demo Preview`,
    googleFont: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;1,400&family=Inter:wght@400;500;600&display=swap',
    bodyStyle: "font-family:'Inter',system-ui,sans-serif;background:#f7f5f2;color:#242226;",
    accentColor,
    content,
  });
}
