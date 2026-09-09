import { SERVICE_AREAS } from "@/lib/businessData";

export function ServiceAreaSection() {
  return (
    <section className="bg-francis-green-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 text-center">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-francis-cream">
          Proudly Serving Ottawa &amp; Surrounding Areas
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          {SERVICE_AREAS.map((area) => (
            <span
              key={area}
              className="rounded-full border border-francis-gold/40 bg-francis-green px-4 py-1.5 text-sm font-medium text-francis-gold-light"
            >
              {area}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
