import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ── Euthyna dark palette ── */
        bg: {
          base: '#080B12',
          surface: '#101522',
          card: '#141A27',
          hover: '#1B2236',
        },
        accent: {
          violet: '#8B5CF6',
          'violet-muted': '#7C3AED',
          cyan: '#22D3EE',
          'cyan-muted': '#06B6D4',
        },
        /* Keep existing named colors for backward compat */
        arcBlue: '#0052FF',
        passGreen: '#10B981',
        failRed: '#EF4444',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          '"Cascadia Code"',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0,0,0,0.3), 0 1px 2px -1px rgba(0,0,0,0.3)',
        card: '0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -2px rgba(0,0,0,0.3)',
        elevated: '0 10px 25px -3px rgba(0,0,0,0.5), 0 4px 10px -4px rgba(0,0,0,0.4)',
        'glow-violet': '0 0 24px rgba(139,92,246,0.25)',
        'glow-cyan': '0 0 20px rgba(34,211,238,0.20)',
      },
      borderColor: {
        subtle: 'rgba(255,255,255,0.06)',
        DEFAULT: 'rgba(255,255,255,0.10)',
        strong: 'rgba(255,255,255,0.18)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      perspective: {
        '500': '500px',
        '1000': '1000px',
      },
    },
  },
  plugins: [],
};

export default config;
