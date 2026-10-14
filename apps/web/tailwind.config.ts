import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F17',
        surface: '#111827',
        surfaceHover: '#1F2937',
        border: '#1F2937',
        arcBlue: '#0052FF',
        arcCyan: '#00D2FF',
        passGreen: '#10B981',
        failRed: '#EF4444',
        accentGold: '#F59E0B'
      }
    },
  },
  plugins: [],
};
export default config;
