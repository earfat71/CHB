import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary — Bay of Bengal deep teal (§6.1)
        brand: {
          50:  '#e6f7f5',
          100: '#b3e8e2',
          200: '#80d9cf',
          300: '#4dcabc',
          400: '#26bfb0',
          500: '#00b4a3',
          600: '#009d8e',
          700: '#008278',
          800: '#006660',
          900: '#004a45',
        },
        // Sand surfaces (§6.1)
        sand: {
          50:  '#fdfaf3',
          100: '#f9f3e1',
          200: '#f3e6c3',
          300: '#ecd8a4',
          400: '#e4c97f',
          500: '#d4a843',
        },
        // Marigold accent / CTA (§6.1)
        marigold: {
          50:  '#fff8e6',
          100: '#ffedb3',
          200: '#ffe080',
          300: '#ffd24d',
          400: '#ffc720',
          500: '#f5b800',
          600: '#e0a800',
          700: '#c29200',
          800: '#9e7800',
          900: '#7a5d00',
        },
        ocean: {
          50:  '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans:    ['"Instrument Sans"', 'system-ui', 'sans-serif'],
        bengali: ['"Hind Siliguri"', '"Noto Sans Bengali"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
