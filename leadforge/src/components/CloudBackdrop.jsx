// Decorative only - large soft blurred circles behind all page content, matching the
// reference design's light backdrop. Hidden in dark mode via CSS (see index.css).
export default function CloudBackdrop() {
  return (
    <div className="cloud-backdrop" aria-hidden="true">
      <span style={{ width: 560, height: 560, top: -220, left: -160 }} />
      <span style={{ width: 420, height: 420, top: -140, right: '18%' }} />
      <span style={{ width: 480, height: 480, top: 80, right: -200 }} />
      <span style={{ width: 380, height: 380, bottom: -180, left: '22%' }} />
    </div>
  );
}
