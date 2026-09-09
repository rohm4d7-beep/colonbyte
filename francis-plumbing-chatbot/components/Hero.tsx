import { FlameIcon, GasLineIcon, SnowflakeIcon, WaterHeaterIcon, WavesIcon, WrenchIcon } from "./icons";

const HERO_ITEMS = [
  { label: "Plumbing", icon: WrenchIcon },
  { label: "Heating", icon: FlameIcon },
  { label: "Cooling", icon: SnowflakeIcon },
  { label: "Hot Water", icon: WaterHeaterIcon },
  { label: "Water Purification", icon: WavesIcon },
  { label: "Gas Lines", icon: GasLineIcon },
];

export function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-14 pb-6">
      <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-francis-green-dark max-w-3xl">
        Expert HVAC &amp; Plumbing Services in Ottawa Since 1933
      </h1>
      <p className="mt-4 max-w-2xl text-francis-text-muted text-base sm:text-lg">
        Trusted by the Ottawa area for over 90 years — plumbing, heating, and cooling done right.
      </p>
      <button className="mt-6 inline-flex items-center rounded bg-francis-red px-6 py-3 font-semibold text-white shadow-sm hover:bg-francis-red/90 transition-colors">
        Book an Appointment
      </button>

      <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {HERO_ITEMS.map(({ label, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl bg-gradient-to-br from-francis-gold-light to-francis-gold px-3 py-6 flex flex-col items-center justify-center gap-2 text-center shadow-sm"
          >
            <Icon className="h-8 w-8 text-francis-green-dark" />
            <span className="text-xs sm:text-sm font-bold text-francis-green-dark uppercase tracking-tight">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
