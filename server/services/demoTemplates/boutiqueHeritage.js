import { escapeHtml, renderReviewCallout, renderGallery, renderMapEmbed, renderContactFooter, readableTextColor, htmlDocument } from './shared.js';

// Sibling of refinedEditorial - same warm-editorial visual family (cream ground, serif display
// type) but for real estate, home builders, property developers, and boutique/luxury retail:
// a split hero (image + copy side by side) instead of full-bleed, and services shown as a
// bordered box grid rather than pills, closer to a property portfolio/brochure than a clinic
// site.
export function renderTemplate(lead, demoSite) {
  const { accentColor, tagline, aboutText, services, ctaText } = demoSite;
  const ctaTextColor = readableTextColor(accentColor);
  const photo = demoSite.heroImage || lead.photos?.[0] || '';
  const gallery = renderGallery(lead, photo, accentColor);
  const mapEmbed = renderMapEmbed(lead);

  const servicesGrid = !services?.length
    ? ''
    : `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;">
        ${services
          .map(
            (s) => `
          <div style="border:1px solid #ddd2c0;border-radius:4px;padding:20px 16px;text-align:center;background:#fdfbf6;">
            <span style="font:500 14px system-ui,sans-serif;color:#2e2a20;">${escapeHtml(s)}</span>
          </div>`
          )
          .join('')}
      </div>`;

  const content = `
    <section class="demo-2col" style="max-width:1160px;margin:0 auto;padding:72px 56px;display:grid;grid-template-columns:0.95fr 1.05fr;gap:56px;align-items:center;background:#faf6ee;">
      <div>
        <div style="font:500 13px system-ui,sans-serif;letter-spacing:0.12em;text-transform:uppercase;color:${accentColor};margin-bottom:18px;">${escapeHtml(lead.category || 'Property & Home')}</div>
        <h1 style="font-family:'Fraunces',serif;font-size:clamp(30px,4.8vw,48px);font-weight:500;line-height:1.1;color:#2e2a20;margin-bottom:16px;text-wrap:balance;">${escapeHtml(lead.businessName)}</h1>
        <p style="font-family:'Fraunces',serif;font-style:italic;font-size:clamp(17px,2vw,21px);color:#5c5442;max-width:40ch;margin-bottom:30px;">${escapeHtml(tagline)}</p>
        <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
          <a href="tel:${escapeHtml(lead.phone || '')}" style="display:inline-block;background:${accentColor};color:${ctaTextColor};font:600 14px system-ui,sans-serif;padding:15px 30px;border-radius:3px;text-decoration:none;">${escapeHtml(ctaText)}</a>
          ${renderReviewCallout(lead, accentColor)}
        </div>
      </div>
      <div style="border-radius:4px;overflow:hidden;${photo ? '' : `background:linear-gradient(135deg, ${accentColor}, #2e2a20);min-height:340px;`}">
        ${photo ? `<img src="${photo}" alt="${escapeHtml(lead.businessName)}" style="width:100%;height:360px;object-fit:cover;" />` : ''}
      </div>
    </section>

    <section style="background:#fdfbf6;padding:76px 56px;">
      <div style="max-width:820px;margin:0 auto;text-align:center;">
        <h2 style="font-family:'Fraunces',serif;font-size:26px;font-weight:500;color:#2e2a20;margin-bottom:18px;">Our Story</h2>
        <p style="font-size:16px;line-height:1.75;color:#5c5442;">${escapeHtml(aboutText)}</p>
      </div>
    </section>

    <section style="background:#faf6ee;padding:76px 56px;">
      <div style="max-width:1000px;margin:0 auto;">
        <h2 style="font-family:'Fraunces',serif;font-size:26px;font-weight:500;color:#2e2a20;margin-bottom:28px;text-align:center;">What We Offer</h2>
        ${servicesGrid}
      </div>
    </section>

    ${gallery ? `
    <section style="background:#fdfbf6;padding:76px 56px;">
      <div style="max-width:1040px;margin:0 auto;">
        <h2 style="font-family:'Fraunces',serif;font-size:26px;font-weight:500;color:#2e2a20;margin-bottom:32px;text-align:center;">Recent Work</h2>
        ${gallery}
      </div>
    </section>` : ''}

    <section style="background:#faf6ee;padding:76px 56px;">
      <div class="demo-2col" style="max-width:1040px;margin:0 auto;display:grid;grid-template-columns:${mapEmbed ? '1fr 1fr' : '1fr'};gap:48px;align-items:center;">
        <div>
          <h2 style="font-family:'Fraunces',serif;font-size:26px;font-weight:500;color:#2e2a20;margin-bottom:22px;">Visit Us</h2>
          <div style="color:#5c5442;">${renderContactFooter(lead)}</div>
          <a href="tel:${escapeHtml(lead.phone || '')}" style="display:inline-block;margin-top:28px;background:${accentColor};color:${ctaTextColor};font:600 14px system-ui,sans-serif;padding:15px 30px;border-radius:3px;text-decoration:none;">${escapeHtml(ctaText)}</a>
        </div>
        ${mapEmbed ? `<div style="border-radius:4px;overflow:hidden;border:1px solid #ddd2c0;">${mapEmbed}</div>` : ''}
      </div>
    </section>

    <footer style="padding:32px 56px;background:#2e2a20;color:#e6ddc8;text-align:center;">
      <span style="font-family:'Fraunces',serif;font-size:15px;">${escapeHtml(lead.businessName)}</span>
    </footer>
  `;

  return htmlDocument({
    title: `${lead.businessName} — Demo Preview`,
    googleFont: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap',
    bodyStyle: "font-family:'Inter',system-ui,sans-serif;background:#fdfbf6;color:#2e2a20;",
    accentColor,
    businessName: lead.businessName,
    content,
  });
}
