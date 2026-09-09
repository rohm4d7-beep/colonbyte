import { SERVICES } from "@/lib/businessData";
import { FlameIcon, SnowflakeIcon, WrenchIcon } from "./icons";

const CATEGORY_ICONS = {
  plumbing: WrenchIcon,
  heating: FlameIcon,
  coolingHotWater: SnowflakeIcon,
} as const;

export function ServicesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
      <h2 className="font-heading text-2xl sm:text-3xl font-bold text-francis-green-dark text-center">
        What We Do
      </h2>
      <div className="mt-8 grid sm:grid-cols-3 gap-5">
        {(Object.entries(SERVICES) as [keyof typeof SERVICES, (typeof SERVICES)[keyof typeof SERVICES]][]).map(
          ([key, category]) => {
            const Icon = CATEGORY_ICONS[key];
            return (
              <div
                key={key}
                className="rounded-xl border border-francis-green-dark/10 bg-white p-6 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-francis-green-dark">
                  <Icon className="h-6 w-6 text-francis-gold" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-bold text-francis-green-dark">
                  {category.title}
                </h3>
                <ul className="mt-3 space-y-1.5 text-sm text-francis-text-muted">
                  {category.items.map((item) => (
                    <li key={item.label}>{item.label}</li>
                  ))}
                </ul>
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}
