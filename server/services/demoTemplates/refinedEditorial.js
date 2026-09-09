import { escapeHtml, renderReviewCallout, renderGallery, renderMapEmbed, renderContactFooter, readableTextColor, htmlDocument } from './shared.js';

// Replaces cleanProfessional's flat corporate navy-and-blue look with an editorial, boutique-
// hospitality-brochure aesthetic (cream ground, serif display type, full-bleed photography) —
// same category coverage (clinics, medical, legal, finance, professional & B2B, larger/chain
// hospitality), just a warmer, more considered visual language for it.
export function renderTemplate(lead, demoSite) {
  const { accentColor, tagline, aboutText, services, ctaText } = demoSite;
  const ctaTextColor = readableTextColor(accentColor);
  const photo = demoSite.heroImage || lead.photos?.[0] || '';
  const gallery = renderGallery(lead, photo, accentColor);
  const mapEmbed = renderMapEmbed(lead);

  const servicesPills = !services?.length
    ? ''
    : `<div style="display:flex;flex-wrap:wrap;gap:12px;">
        ${services
          .map(
            (s) => `
          <span style="border:1px solid #d8cfc0;border-radius:4px;padding:12px 20px;font:500 14px system-ui,sans-serif;color:#2b2620;background:#fff;">${escapeHtml(s)}</span>`
          )
          .join('')}
      </div>`;

  const content = `
    <section style="position:relative;min-height:560px;display:flex;align-items:flex-end;background:${photo ? `url('${photo}') center/cover no-repeat` : `linear-gradient(135deg, ${accentColor}, #2b2620)`};">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(20,16,10,0.05) 0%, rgba(20,16,10,0.7) 100%);"></div>
      <div style="position:relative;padding:64px 56px;max-width:760px;color:#fdfbf7;">
        <div style="font:500 13px system-ui,sans-serif;letter-spacing:0.12em;text-transform:uppercase;color:${accentColor};margin-bottom:16px;">${escapeHtml(lead.category || 'Professional Services')}</div>
        <h1 style="font-family:'Fraunces',serif;font-size:clamp(32px,5.5vw,58px);font-weight:500;line-height:1.08;letter-spacing:-0.01em;margin-bottom:14px;text-wrap:balance;">${escapeHtml(lead.businessName)}</h1>
        <p style="font-family:'Fraunces',serif;font-style:italic;font-size:clamp(18px,2.4vw,24px);font-weight:400;opacity:0.92;max-width:44ch;margin-bottom:32px;">${escapeHtml(tagline)}</p>
        <a href="tel:${escapeHtml(lead.phone || '')}" style="display:inline-block;background:${accentColor};color:${ctaTextColor};font:600 14px system-ui,sans-serif;padding:15px 30px;border-radius:3px;text-decoration:none;letter-spacing:0.02em;">${escapeHtml(ctaText)}</a>
      </div>
    </section>

    <section style="background:#f3efe6;padding:80px 56px;">
      <div style="max-width:760px;margin:0 auto;text-align:center;">
        <p style="font-family:'Fraunces',serif;font-size:clamp(20px,2.4vw,27px);font-weight:400;font-style:italic;line-height:1.55;color:#2b2620;text-wrap:balance;">${escapeHtml(aboutText)}</p>
        ${lead.rating ? `<div style="margin-top:32px;display:flex;justify-content:center;">${renderReviewCallout(lead, accentColor)}</div>` : ''}
      </div>
    </section>

    <section style="background:#fdfbf7;padding:80px 56px;border-top:1px solid #e6ddcc;border-bottom:1px solid #e6ddcc;">
      <div style="max-width:900px;margin:0 auto;">
        <h2 style="font-family:'Fraunces',serif;font-size:26px;font-weight:500;color:#2b2620;margin-bottom:28px;">What we offer</h2>
        ${servicesPills}
      </div>
    </section>

    ${gallery ? `
    <section style="background:#f3efe6;padding:80px 56px;">
      <div style="max-width:1040px;margin:0 auto;">
        <h2 style="font-family:'Fraunces',serif;font-size:26px;font-weight:500;color:#2b2620;margin-bottom:32px;">A closer look</h2>
        ${gallery}
      </div>
    </section>` : ''}

    <section style="background:#fdfbf7;padding:80px 56px;">
      <div class="demo-2col" style="max-width:1040px;margin:0 auto;display:grid;grid-template-columns:${mapEmbed ? '1fr 1fr' : '1fr'};gap:48px;align-items:center;">
        <div>
          <h2 style="font-family:'Fraunces',serif;font-size:26px;font-weight:500;color:#2b2620;margin-bottom:22px;">Visit Us</h2>
          <div style="color:#5c5648;">${renderContactFooter(lead)}</div>
          <a href="tel:${escapeHtml(lead.phone || '')}" style="display:inline-block;margin-top:28px;background:${accentColor};color:${ctaTextColor};font:600 14px system-ui,sans-serif;padding:15px 30px;border-radius:3px;text-decoration:none;">${escapeHtml(ctaText)}</a>
        </div>
        ${mapEmbed ? `<div style="border-radius:4px;overflow:hidden;border:1px solid #e6ddcc;">${mapEmbed}</div>` : ''}
      </div>
    </section>

    <footer style="padding:32px 56px;background:#2b2620;color:#e6ddcc;text-align:center;">
      <span style="font-family:'Fraunces',serif;font-size:15px;">${escapeHtml(lead.businessName)}</span>
    </footer>
  `;

  return htmlDocument({
    title: `${lead.businessName} — Demo Preview`,
    googleFont: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap',
    bodyStyle: "font-family:'Inter',system-ui,sans-serif;background:#fdfbf7;color:#2b2620;",
    accentColor,
    businessName: lead.businessName,
    content,
  });
}
