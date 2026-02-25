import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        black: {
          DEFAULT: '#0f0f0f',
          900: '#0f0f0f',
          800: '#171717',
          700: '#1f1f1f',
          600: '#2a2a2a',
          500: '#333333',
        },
        gold: {
          DEFAULT: '#C6A75E',
          light: '#d4b97a',
          dark: '#a8893c',
          muted: 'rgba(198,167,94,0.15)',
        },
        white: {
          DEFAULT: '#f5f5f5',
          pure: '#ffffff',
          muted: 'rgba(245,245,245,0.6)',
          faint: 'rgba(245,245,245,0.08)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(198,167,94,0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(198,167,94,0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'gold': '0 0 20px rgba(198,167,94,0.2)',
        'gold-lg': '0 0 40px rgba(198,167,94,0.3)',
        'inner-dark': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
}

export default config
