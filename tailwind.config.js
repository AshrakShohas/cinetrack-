/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cinema: {
          950: '#06080F',
          900: '#0B0F19',
          850: '#101626',
          800: '#161F36',
          700: '#222E4C',
          gold: '#F59E0B',
          amber: '#D97706',
          cyan: '#06B6D4',
          rose: '#F43F5E',
          purple: '#A855F7',
          neon: '#10B981',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-gold': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.4)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
