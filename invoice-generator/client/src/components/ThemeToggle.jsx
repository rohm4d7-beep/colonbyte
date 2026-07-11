import { useTheme } from "../context/ThemeContext";

const icons = { default: "🎨", light: "☀️", dark: "🌑" };

export default function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();
  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      title={`Theme: ${theme}`}
    >
      <span className="text-lg">{icons[theme]}</span>
      <span className="capitalize hidden sm:inline">{theme}</span>
    </button>
  );
}
