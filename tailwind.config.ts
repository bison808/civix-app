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
        // CIVIX Brand Colors
        civix: {
          blue: '#4A90E2',
          green: '#27AE60',
          red: '#E74C3C',
          gray: '#7F8C8D',
          gold: '#F39C12',
        },
        // Legacy colors (keeping for backward compatibility)
        primary: '#4A90E2',
        secondary: '#27AE60',
        accent: '#F39C12',
        delta: '#4A90E2', // Now points to CIVIX blue
        positive: '#27AE60',
        negative: '#E74C3C',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in',
        'pulse-once': 'pulse 0.5s ease-in-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config