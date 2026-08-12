/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        border: 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-soft': 'var(--color-accent-soft)',
        'accent-2': 'var(--color-accent-2)',
        'accent-2-soft': 'var(--color-accent-2-soft)',
        'on-accent-2': 'var(--color-on-accent-2)',
        'accent-3': 'var(--color-accent-3)',
        'accent-3-soft': 'var(--color-accent-3-soft)',
        'on-accent-3': 'var(--color-on-accent-3)',
        success: 'var(--color-success)',
        'success-soft': 'var(--color-success-soft)',
        danger: 'var(--color-danger)',
        'danger-soft': 'var(--color-danger-soft)',
        text: 'var(--color-text)',
        'text-2': 'var(--color-text-2)',
        'text-3': 'var(--color-text-3)',
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
      },
      fontSize: {
        '2xs': ['11px', '15px'],
      },
    },
  },
  plugins: [],
};
