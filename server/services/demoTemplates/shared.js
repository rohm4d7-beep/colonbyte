export function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}

export function renderPreviewBanner(accentColor) {
  return `
    <div style="background:${accentColor};color:#fff;text-align:center;font:600 13px/1.4 system-ui,sans-serif;padding:8px 16px;">
      This is an AI-generated demo preview built by Colon Byte — not this business's official website.
    </div>
  `;
}

export function renderReviewCallout(lead, accentColor) {
  if (typeof lead.rating !== 'number') return '';
  const stars = '★'.repeat(Math.round(lead.rating)) + '☆'.repeat(5 - Math.round(lead.rating));
  return `
    <div style="display:inline-flex;align-items:center;gap:8px;background:#fff;border-radius:999px;padding:8px 18px;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <span style="color:${accentColor};font-size:16px;letter-spacing:1px;">${stars}</span>
      <span style="font:600 14px system-ui,sans-serif;color:#111;">${lead.rating.toFixed(1)}</span>
      ${typeof lead.reviewCount === 'number' ? `<span style="font:400 13px system-ui,sans-serif;color:#777;">(${lead.reviewCount} reviews)</span>` : ''}
    </div>
  `;
}

export function renderServicesList(services, accentColor) {
  if (!services || services.length === 0) return '';
  return services
    .map(
      (s) => `
      <li style="display:flex;align-items:center;gap:10px;padding:14px 0;border-bottom:1px solid rgba(0,0,0,0.08);font:500 15px system-ui,sans-serif;">
        <span style="width:8px;height:8px;border-radius:50%;background:${accentColor};flex-shrink:0;"></span>
        ${escapeHtml(s)}
      </li>`
    )
    .join('');
}

export function renderContactFooter(lead) {
  return `
    <div style="display:flex;flex-wrap:wrap;gap:32px;">
      ${lead.address ? `<div><div style="font:500 12.5px system-ui,sans-serif;opacity:0.55;margin-bottom:6px;">Address</div><div style="font:400 14px system-ui,sans-serif;">${escapeHtml(lead.address)}</div></div>` : ''}
      ${lead.phone ? `<div><div style="font:500 12.5px system-ui,sans-serif;opacity:0.55;margin-bottom:6px;">Phone</div><div style="font:400 14px system-ui,sans-serif;">${escapeHtml(lead.phone)}</div></div>` : ''}
      ${lead.openingHoursSummary ? `<div><div style="font:500 12.5px system-ui,sans-serif;opacity:0.55;margin-bottom:6px;">Hours</div><div style="font:400 14px system-ui,sans-serif;">${escapeHtml(lead.openingHoursSummary)}</div></div>` : ''}
    </div>
  `;
}

export function htmlDocument({ title, googleFont, bodyStyle, accentColor, content }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex, nofollow" />
<title>${escapeHtml(title)}</title>
${googleFont ? `<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin /><link href="${googleFont}" rel="stylesheet" />` : ''}
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { ${bodyStyle} }
  a { color: inherit; }
  img { max-width: 100%; display: block; }
</style>
</head>
<body>
${renderPreviewBanner(accentColor)}
${content}
</body>
</html>`;
}
