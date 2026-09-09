import { BUSINESS_PHONE } from "@/lib/businessData";

export function SiteFooter() {
  return (
    <footer className="bg-francis-green-dark border-t border-francis-gold/10 pb-24 sm:pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-francis-gold-light text-sm">
        <span className="font-heading italic font-extrabold text-xl text-francis-gold">francis</span>
        <span>{BUSINESS_PHONE} · Ottawa &amp; surrounding areas</span>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-6">
        <p className="text-center text-xs text-francis-gold-light/50">
          Prototype built by Colonbyte to demonstrate a website chat assistant. Not affiliated
          with or a replacement for francisplumbing.com.
        </p>
      </div>
    </footer>
  );
}
