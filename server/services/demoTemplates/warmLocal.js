import { escapeHtml, renderReviewCallout, renderServicesList, renderGallery, renderMapEmbed, renderContactFooter, readableTextColor, htmlDocument } from './shared.js';

export function renderTemplate(lead, demoSite) {
  const { accentColor, tagline, aboutText, services, ctaText } = demoSite;
  const ctaTextColor = readableTextColor(accentColor);
  const photo = demoSite.heroImage || lead.photos?.[0] || '';
  const gallery = renderGallery(lead, photo, accentColor);
  const mapEmbed = renderMapEmbed(lead);

  const content = `
    <section style="position:relative;min-height:520px;display:flex;align-items:flex-end;background:${photo ? `url('${photo}') center/cover no-repeat` : `linear-gradient(135deg, ${accentColor}, #3a2317)`};">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(20,10,5,0.15) 0%, rgba(20,10,5,0.75) 100%);"></div>
      <div style="position:relative;padding:56px 40px;max-width:720px;color:#fff;">
        <div style="font:500 14px system-ui,sans-serif;letter-spacing:0.08em;text-transform:uppercase;opacity:0.85;margin-bottom:12px;">${escapeHtml(lead.category || 'Local Business')}</div>
        <h1 style="font-family:'Fraunces',serif;font-size:clamp(30px,9vw,52px);font-weight:600;line-height:1.05;margin-bottom:16px;">${escapeHtml(lead.businessName)}</h1>
        <p style="font:400 19px/1.5 system-ui,sans-serif;opacity:0.92;max-width:520px;margin-bottom:28px;">${escapeHtml(tagline)}</p>
        <a href="tel:${escapeHtml(lead.phone || '')}" style="display:inline-block;background:${accentColor};color:${ctaTextColor};font:600 15px system-ui,sans-serif;padding:14px 28px;border-radius:6px;text-decoration:none;">${escapeHtml(ctaText)}</a>
      </div>
    </section>

    <section style="max-width:900px;margin:0 auto;padding:72px 40px;text-align:center;">
      <p style="font-family:'Fraunces',serif;font-size:26px;line-height:1.6;color:#2b1c10;">${escapeHtml(aboutText)}</p>
      <div style="margin-top:32px;">${renderReviewCallout(lead, accentColor)}</div>
    </section>

    <section style="background:#faf4ec;padding:64px 40px;">
      <div style="max-width:640px;margin:0 auto;">
        <h2 style="font-family:'Fraunces',serif;font-size:28px;color:#2b1c10;margin-bottom:8px;text-align:center;">What We Offer</h2>
        <ul style="list-style:none;margin-top:24px;">${renderServicesList(services, accentColor)}</ul>
      </div>
    </section>

    ${gallery ? `
    <section style="padding:64px 40px;">
      <div style="max-width:1040px;margin:0 auto;">
        <h2 style="font-family:'Fraunces',serif;font-size:28px;color:#2b1c10;margin-bottom:32px;text-align:center;">Take a Look Inside</h2>
        ${gallery}
      </div>
    </section>` : ''}

    <section style="background:#faf4ec;padding:64px 40px;">
      <div class="demo-2col" style="max-width:1040px;margin:0 auto;display:grid;grid-template-columns:${mapEmbed ? '1fr 1fr' : '1fr'};gap:48px;align-items:center;">
        <div>
          <h2 style="font-family:'Fraunces',serif;font-size:28px;color:#2b1c10;margin-bottom:20px;">Visit Us</h2>
          <div style="color:#5c4a3a;">${renderContactFooter(lead)}</div>
          <a href="tel:${escapeHtml(lead.phone || '')}" style="display:inline-block;margin-top:28px;background:${accentColor};color:${ctaTextColor};font:600 15px system-ui,sans-serif;padding:14px 28px;border-radius:6px;text-decoration:none;">${escapeHtml(ctaText)}</a>
        </div>
        ${mapEmbed ? `<div style="border-radius:10px;overflow:hidden;">${mapEmbed}</div>` : ''}
      </div>
    </section>

    <footer style="padding:32px 40px;background:#2b1c10;color:#f2e9de;text-align:center;">
      <span style="font-family:'Fraunces',serif;font-size:16px;">${escapeHtml(lead.businessName)}</span>
    </footer>
  `;

  return htmlDocument({
    title: `${lead.businessName} — Demo Preview`,
    googleFont: 'https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=Inter:wght@400;500;600&display=swap',
    bodyStyle: "font-family:'Inter',system-ui,sans-serif;background:#fff;color:#2b1c10;",
    accentColor,
    content,
  });
}
