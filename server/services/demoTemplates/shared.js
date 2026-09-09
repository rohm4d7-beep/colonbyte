// Templates use accentColor as a solid CTA-button/banner background and need to know whether
// white or dark text reads legibly on it - hardcoding white (or, in boldModern's case, a fixed
// dark ink) broke the moment accentColor stopped being restricted to a curated palette and
// started coming from a business's own real photos (services/brandColorExtractor.js), which
// can legitimately land on anything, including light golds/pastels where white text disappears.
export function readableTextColor(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const [rl, gl, bl] = [r, g, b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
  const contrastWithWhite = 1.05 / (luminance + 0.05);
  const contrastWithDark = (luminance + 0.05) / 0.05;
  return contrastWithWhite >= contrastWithDark ? '#ffffff' : '#1a1a1a';
}

export function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}

// Understated on purpose (see server/services/demoTemplates/shared.js history) - the prospect
// should experience the concept's quality before anything else on the page. Still transparent
// (never implies ownership/official affiliation) and still the first thing rendered, just not
// styled as the visual centerpiece the old accent-colored full-width banner was.
export function renderPreviewBanner(accentColor, businessName) {
  return `
    <div style="background:#f4f4f5;color:#71717a;text-align:center;font:500 11.5px/1.4 system-ui,sans-serif;padding:5px 16px;">
      Private website concept prepared by COLONBYTE. Not the official website of ${escapeHtml(businessName || 'this business')}.
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

// Real photos of the actual business (routes/scrape.js captures up to 6 at scrape time),
// never stock or AI-generated - a business owner recognizing their own space is what makes a
// demo land as "this could be ours" instead of "generic template". Skips entirely below 2
// remaining photos rather than rendering a lonely single-image row - not worth a whole
// section for one more shot they've already seen as the hero.
export function renderGallery(lead, heroImage, accentColor) {
  // listingPhotoScraper.js's gallery occasionally includes a Street View panorama thumbnail
  // alongside the real listing photos (a car on the street, not the business's interior) -
  // confirmed live on a real lead, where it rendered as the 4th "inside the business" gallery
  // tile. Exclude by host rather than trying to detect it visually.
  const rest = (lead.photos || [])
    .filter((url) => url && url !== heroImage && !url.includes('streetviewpixels-pa.googleapis.com'))
    .slice(0, 5);
  if (rest.length < 2) return '';
  return `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
      ${rest
        .map(
          (url) => `
        <div style="border-radius:10px;overflow:hidden;aspect-ratio:4/3;">
          <img src="${url}" alt="${escapeHtml(lead.businessName)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;" />
        </div>`
        )
        .join('')}
    </div>
  `;
}

// The old no-key `maps.google.com/maps?output=embed` trick no longer works - confirmed live,
// Google now serves that page with `X-Frame-Options: SAMEORIGIN`, so a browser silently
// refuses to render it in a third-party iframe (blank box, no console-visible error on many
// setups). OpenStreetMap's own embed endpoint is a genuinely free, no-key, iframe-friendly
// alternative (no X-Frame-Options/CSP framing restriction, confirmed live) - a small bbox
// around the coordinate plus a marker pin. Coordinates come straight from the Maps listing
// itself (routes/scrape.js), not a geocoded address, so no mismatch risk.
export function renderMapEmbed(lead, height = 280) {
  if (typeof lead.lat !== 'number' || typeof lead.lng !== 'number') return '';
  const d = 0.006; // ~650m half-width at typical latitudes - close enough to read the block, wide enough for context
  const bbox = `${lead.lng - d},${lead.lat - d},${lead.lng + d},${lead.lat + d}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&marker=${lead.lat}%2C${lead.lng}`;
  return `<iframe src="${src}" width="100%" height="${height}" style="border:0;display:block;" loading="lazy" title="${escapeHtml(lead.businessName)} location"></iframe>`;
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

export function htmlDocument({ title, googleFont, bodyStyle, accentColor, businessName, content }) {
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
  /* Almost every demo link is opened on a phone, not the laptop it was designed on - these
     templates lay out their hero and "visit us" sections as fixed two-column grids with
     40-88px of horizontal padding, which is fine at desktop widths but crushes each column to
     under 150px and eats a third of the screen in padding on a 375-430px phone. Collapse to a
     single column and shrink the padding below the point where that happens. */
  @media (max-width: 700px) {
    section, footer { padding-left: 20px !important; padding-right: 20px !important; }
    .demo-2col { grid-template-columns: 1fr !important; }
  }
</style>
</head>
<body>
${renderPreviewBanner(accentColor, businessName)}
${content}
</body>
</html>`;
}
