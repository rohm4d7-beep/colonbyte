import { BUSINESS_PHONE, BUSINESS_PHONE_TEL } from "@/lib/businessData";

const NAV_LINKS = [
  "Plumbing",
  "Heating",
  "Heat Pumps",
  "Duct Cleaning",
  "Air Conditioners",
  "Hot Water",
  "About Us",
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30">
      <div className="bg-francis-red-bright text-white text-center text-sm py-2 px-4 flex items-center justify-center gap-3 flex-wrap">
        <span>Get a Price Match Guarantee on a New HVAC System</span>
        <button className="bg-francis-cream text-francis-green-dark text-xs font-semibold px-3 py-1 rounded">
          Learn More
        </button>
      </div>
      <div className="bg-francis-green-dark text-francis-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex flex-col leading-tight shrink-0">
            <span className="font-heading italic font-extrabold text-2xl sm:text-3xl text-francis-gold">
              francis
            </span>
            <span className="text-[10px] sm:text-xs tracking-widest font-semibold text-francis-gold-light">
              PLUMBING · HEATING · COOLING
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-francis-gold-light">
            {NAV_LINKS.map((link) => (
              <span key={link} className="hover:text-francis-gold cursor-default">
                {link}
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`tel:${BUSINESS_PHONE_TEL}`}
              className="hidden sm:inline-flex items-center rounded bg-francis-gold px-3 py-2 text-xs sm:text-sm font-bold text-francis-green-dark"
            >
              {BUSINESS_PHONE}
            </a>
            <span className="hidden md:inline-flex items-center rounded border border-francis-gold-light/40 px-3 py-2 text-xs font-semibold text-francis-cream">
              Emergency Service
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
