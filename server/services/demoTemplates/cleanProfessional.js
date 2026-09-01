import { escapeHtml, renderReviewCallout, renderServicesList, renderContactFooter, htmlDocument } from './shared.js';

export function renderTemplate(lead, demoSite) {
  const { accentColor, tagline, aboutText, services, ctaText } = demoSite;
  const photo = demoSite.heroImage || lead.photos?.[0] || '';

  const content = `
    <section style="max-width:1120px;margin:0 auto;padding:72px 40px;display:grid;grid-template-columns:1.1fr 0.9fr;gap:56px;align-items:center;">
      <div>
        <div style="display:inline-block;background:${accentColor}1a;color:${accentColor};font:600 13px system-ui,sans-serif;letter-spacing:0.04em;text-transform:uppercase;padding:6px 14px;border-radius:999px;margin-bottom:20px;">${escapeHtml(lead.category || 'Professional Services')}</div>
        <h1 style="font-size:44px;font-weight:700;line-height:1.15;color:#0f172a;margin-bottom:18px;">${escapeHtml(lead.businessName)}</h1>
        <p style="font-size:18px;line-height:1.6;color:#475569;margin-bottom:28px;">${escapeHtml(tagline)}</p>
        <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
          <a href="tel:${escapeHtml(lead.phone || '')}" style="display:inline-block;background:${accentColor};color:#fff;font:600 15px system-ui,sans-serif;padding:14px 28px;border-radius:8px;text-decoration:none;">${escapeHtml(ctaText)}</a>
          ${renderReviewCallout(lead, accentColor)}
        </div>
      </div>
      <div style="border-radius:16px;overflow:hidden;box-shadow:0 20px 50px rgba(15,23,42,0.15);${photo ? '' : `background:linear-gradient(135deg, ${accentColor}, #0f172a);min-height:320px;`}">
        ${photo ? `<img src="${photo}" alt="${escapeHtml(lead.businessName)}" style="width:100%;height:340px;object-fit:cover;" />` : ''}
      </div>
    </section>

    <section style="background:#f8fafc;padding:64px 40px;">
      <div style="max-width:760px;margin:0 auto;text-align:center;">
        <h2 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:16px;">About Us</h2>
        <p style="font-size:16px;line-height:1.7;color:#475569;">${escapeHtml(aboutText)}</p>
      </div>
    </section>

    <section style="max-width:640px;margin:0 auto;padding:64px 40px;">
      <h2 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:8px;text-align:center;">Our Services</h2>
      <ul style="list-style:none;margin-top:24px;">${renderServicesList(services, accentColor)}</ul>
    </section>

    <footer style="padding:48px 40px;background:#0f172a;color:#e2e8f0;">
      <div style="max-width:900px;margin:0 auto;">
        <h3 style="font-size:18px;font-weight:700;margin-bottom:20px;">${escapeHtml(lead.businessName)}</h3>
        ${renderContactFooter(lead)}
      </div>
    </footer>
  `;

  return htmlDocument({
    title: `${lead.businessName} — Demo Preview`,
    googleFont: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    bodyStyle: "font-family:'Inter',system-ui,sans-serif;background:#fff;color:#0f172a;",
    accentColor,
    content,
  });
}
