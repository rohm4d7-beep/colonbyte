import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/70 dark:bg-gray-950/70 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="DevsAura" className="w-8 h-8 rounded-lg object-cover" />
          <div>
            <h1 className="text-sm font-semibold leading-tight">DevsAura</h1>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">Invoice Generator</p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
