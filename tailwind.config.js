import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#121212',
        surface: '#1E1E1E',
        surfaceHighlight: '#2C2C2C',
        textPrimary: '#F5F5F5',
        textSecondary: '#A0A0A0',
        accent: '#818CF8', 
        accentMuted: '#4F46E5', 
        border: '#333333',
      },
      fontFamily: {
        sans: ['"Open Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [
    plugin(function({ addBase }) {
      addBase({
        // Remove totalmente outlines, rings e seleções visuais de clique no projeto todo
        '*, *::before, *::after': {
          '-webkit-tap-highlight-color': 'transparent',
        },
        '*:focus, *:focus-visible, *:focus-within, *:active': {
          'outline': 'none !important',
          'box-shadow': 'none !important',
        },
      });
    }),
  ],
}