/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f0f17',
          card:    '#16161f',
          border:  '#22222e',
          hover:   '#1c1c28',
        },
      },
      animation: {
        'spin-slow':   'spin 3s linear infinite',
        'fade-up':     'fadeUp 0.5s ease-out forwards',
        'shimmer':     'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
