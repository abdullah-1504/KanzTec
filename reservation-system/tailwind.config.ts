import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm, appetising "hospitality" primary (terracotta / amber-orange).
        // Intentionally distinct from the table-status palette so it never
        // clashes on the floor map (status uses slate/rose/emerald/amber/violet).
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Warm neutral surfaces (cream) used for page backgrounds.
        sand: {
          50: '#faf8f5',
          100: '#f4f0ea',
          200: '#e9e2d8',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(28,25,23,0.04), 0 4px 12px -6px rgba(28,25,23,0.08)',
        lift: '0 12px 32px -12px rgba(234,88,12,0.22)',
        soft: '0 2px 8px rgba(28,25,23,0.06)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.92)' },
          '60%': { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.35s ease-out',
        pop: 'pop 0.25s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;