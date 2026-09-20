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
      borderRadius: {
        DEFAULT: 'var(--soul-radius)',
        sm: 'var(--soul-radius)',
        md: 'var(--soul-radius)',
        lg: 'var(--soul-radius)',
        xl: 'var(--soul-radius)',
        '2xl': 'var(--soul-radius)',
        '3xl': 'var(--soul-radius)',
        full: 'var(--soul-radius)',
      },
    },
  },
  plugins: [],
}
