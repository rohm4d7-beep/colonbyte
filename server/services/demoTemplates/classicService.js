import { escapeHtml, renderReviewCallout, renderServicesList, renderGallery, renderMapEmbed, renderContactFooter, readableTextColor, htmlDocument } from './shared.js';

export function renderTemplate(lead, demoSite) {
  const { accentColor, tagline, aboutText, services, ctaText } = demoSite;
  const ctaTextColor = readableTextColor(accentColor);
  const photo = demoSite.heroImage || lead.photos?.[0] || '';
  const gallery = renderGallery(lead, photo, accentColor);
  const mapEmbed = renderMapEmbed(lead);

  const content = `
    <section style="background:#1e293b;color:#fff;">
      <div class="demo-2col" style="max-width:1120px;margin:0 auto;padding:64px 40px;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;">
        <div>
          <div style="font:700 13px system-ui,sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:${accentColor};margin-bottom:16px;">${escapeHtml(lead.category || 'Trusted Local Service')}</div>
          <h1 style="font-size:clamp(28px,8vw,42px);font-weight:800;line-height:1.15;margin-bottom:18px;">${escapeHtml(lead.businessName)}</h1>
          <p style="font-size:17px;line-height:1.6;color:#cbd5e1;margin-bottom:28px;">${escapeHtml(tagline)}</p>
          <a href="tel:${escapeHtml(lead.phone || '')}" style="display:inline-block;background:${accentColor};color:${ctaTextColor};font:700 15px system-ui,sans-serif;padding:16px 32px;border-radius:6px;text-decoration:none;">${escapeHtml(ctaText)}</a>
        </div>
        <div style="border-radius:10px;overflow:hidden;border:4px solid ${accentColor};${photo ? '' : `background:#334155;min-height:260px;`}">
          ${photo ? `<img src="${photo}" alt="${escapeHtml(lead.businessName)}" style="width:100%;height:280px;object-fit:cover;" />` : ''}
        </div>
      </div>
    </section>

    <section style="background:#f1f5f9;padding:20px 40px;text-align:center;">
      ${renderReviewCallout(lead, accentColor)}
    </section>

    <section style="max-width:760px;margin:0 auto;padding:64px 40px;text-align:center;">
      <h2 style="font-size:24px;font-weight:800;color:#1e293b;margin-bottom:16px;">Why Choose Us</h2>
      <p style="font-size:16px;line-height:1.7;color:#475569;">${escapeHtml(aboutText)}</p>
    </section>

    <section style="background:#fff;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;padding:64px 40px;">
      <div style="max-width:640px;margin:0 auto;">
        <h2 style="font-size:24px;font-weight:800;color:#1e293b;margin-bottom:8px;text-align:center;">Our Services</h2>
        <ul style="list-style:none;margin-top:24px;">${renderServicesList(services, accentColor)}</ul>
      </div>
    </section>

    ${gallery ? `
    <section style="background:#f1f5f9;padding:64px 40px;">
      <div style="max-width:1040px;margin:0 auto;">
        <h2 style="font-size:24px;font-weight:800;color:#1e293b;margin-bottom:32px;text-align:center;">Recent Work</h2>
        ${gallery}
      </div>
    </section>` : ''}

    <section class="demo-2col" style="max-width:1040px;margin:0 auto;padding:64px 40px;display:grid;grid-template-columns:${mapEmbed ? '1fr 1fr' : '1fr'};gap:48px;align-items:center;">
      <div>
        <h2 style="font-size:24px;font-weight:800;color:#1e293b;margin-bottom:20px;">Service Area</h2>
        <div style="color:#475569;">${renderContactFooter(lead)}</div>
        <a href="tel:${escapeHtml(lead.phone || '')}" style="display:inline-block;margin-top:28px;background:${accentColor};color:${ctaTextColor};font:700 15px system-ui,sans-serif;padding:16px 32px;border-radius:6px;text-decoration:none;">${escapeHtml(ctaText)}</a>
      </div>
      ${mapEmbed ? `<div style="border-radius:10px;overflow:hidden;border:4px solid ${accentColor};">${mapEmbed}</div>` : ''}
    </section>

    <footer style="padding:32px 40px;background:#1e293b;color:#e2e8f0;text-align:center;">
      <span style="font-size:16px;font-weight:800;">${escapeHtml(lead.businessName)}</span>
    </footer>
  `;

  return htmlDocument({
    title: `${lead.businessName} — Demo Preview`,
    googleFont: 'https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700;800&display=swap',
    bodyStyle: "font-family:'Work Sans',system-ui,sans-serif;background:#fff;color:#1e293b;",
    accentColor,
    content,
  });
}
