/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F2ECE1',
          300: '#E8DDCF',
          400: '#D5C4B0',
        },
        boutique: {
          gold: '#C5A880',
          champagne: '#E5D3B3',
          blush: '#F7E7E3',
          rose: '#D29B8F',
          terracotta: '#B86B5A',
          charcoal: '#1A1A1A',
          slate: '#4A4A4A',
          softgray: '#F5F5F3',
          border: '#EAE6E1',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        luxury: '0.2em',
        widest: '0.15em',
      }
    },
  },
  plugins: [],
}

