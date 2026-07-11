/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          50:  '#f8f9fa',
          100: '#1e1e2e',
          200: '#181825',
          300: '#13131f',
          400: '#0e0e18',
        },
        accent: {
          DEFAULT: '#7c3aed',
          hover:   '#6d28d9',
          light:   '#8b5cf6',
        },
      },
      animation: {
        'fade-in':   'fadeIn 0.2s ease-out',
        'slide-up':  'slideUp 0.25s ease-out',
        'blink':     'blink 1s step-start infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        blink:   { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0 } },
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#e2e8f0',
            maxWidth: 'none',
            code: {
              color: '#a78bfa',
              backgroundColor: '#1e1b4b',
              padding: '0.15em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
            'code::before': { content: '""' },
            'code::after':  { content: '""' },
            pre: {
              backgroundColor: '#0f0f1a',
              border: '1px solid #2d2d4a',
            },
            a: { color: '#818cf8' },
            strong: { color: '#f1f5f9' },
            h1: { color: '#f1f5f9' },
            h2: { color: '#f1f5f9' },
            h3: { color: '#f1f5f9' },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
