import { escapeHtml, renderReviewCallout, renderServicesList, renderContactFooter, htmlDocument } from './shared.js';

export function renderTemplate(lead, demoSite) {
  const { accentColor, tagline, aboutText, services, ctaText } = demoSite;
  const photo = lead.photos?.[0] || '';

  const content = `
    <section style="background:#0a0a0a;color:#fff;padding:80px 40px 0;">
      <div style="max-width:1000px;margin:0 auto;">
        <div style="font:700 13px system-ui,sans-serif;letter-spacing:0.12em;text-transform:uppercase;color:${accentColor};margin-bottom:18px;">${escapeHtml(lead.category || 'Studio')}</div>
        <h1 style="font-family:'Space Grotesk',sans-serif;font-size:64px;font-weight:700;line-height:1;letter-spacing:-0.02em;margin-bottom:20px;">${escapeHtml(lead.businessName)}</h1>
        <p style="font-size:20px;line-height:1.5;color:#c7c7c7;max-width:520px;margin-bottom:32px;">${escapeHtml(tagline)}</p>
        <a href="tel:${escapeHtml(lead.phone || '')}" style="display:inline-block;background:${accentColor};color:#fff;font:700 15px system-ui,sans-serif;padding:16px 32px;border-radius:4px;text-decoration:none;">${escapeHtml(ctaText)}</a>
      </div>
      <div style="max-width:1000px;margin:56px auto 0;${photo ? '' : `background:${accentColor};min-height:280px;border-radius:12px 12px 0 0;`}">
        ${photo ? `<img src="${photo}" alt="${escapeHtml(lead.businessName)}" style="width:100%;max-height:420px;object-fit:cover;border-radius:12px 12px 0 0;" />` : ''}
      </div>
    </section>

    <section style="background:${accentColor};color:#fff;padding:56px 40px;">
      <div style="max-width:900px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:24px;">
        <p style="font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:600;max-width:560px;line-height:1.4;">${escapeHtml(aboutText)}</p>
        ${renderReviewCallout(lead, accentColor)}
      </div>
    </section>

    <section style="max-width:700px;margin:0 auto;padding:64px 40px;">
      <h2 style="font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:700;margin-bottom:8px;">Services</h2>
      <ul style="list-style:none;margin-top:24px;">${renderServicesList(services, accentColor)}</ul>
    </section>

    <footer style="padding:48px 40px;background:#0a0a0a;color:#e5e5e5;">
      <div style="max-width:900px;margin:0 auto;">
        <h3 style="font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:700;margin-bottom:20px;">${escapeHtml(lead.businessName)}</h3>
        ${renderContactFooter(lead)}
      </div>
    </footer>
  `;

  return htmlDocument({
    title: `${lead.businessName} — Demo Preview`,
    googleFont: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500&display=swap',
    bodyStyle: "font-family:'Inter',system-ui,sans-serif;background:#fff;color:#0a0a0a;",
    accentColor,
    content,
  });
}
