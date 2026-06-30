/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class', // optional dark mode via a `dark` class on <html>
  theme: {
    extend: {
      colors: {
        // Brand: a warm coral/rose — Airbnb-inspired but distinct.
        coral: {
          50: '#FFF1F4',
          100: '#FFE0E7',
          200: '#FFC2CF',
          300: '#FF98AE',
          400: '#FF6F8B',
          500: '#FB4B6E', // primary accent
          600: '#E92E55',
          700: '#C41E45',
          800: '#A21C3F',
          900: '#871B3A',
        },
        // Neutral charcoal/slate for text and surfaces.
        ink: {
          50: '#F7F7F8',
          100: '#ECEDEF',
          200: '#D9DBDF',
          300: '#B9BdC4',
          400: '#8A9099',
          500: '#646B75',
          600: '#4B515A',
          700: '#3A3F47',
          800: '#22262C',
          900: '#14171B',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,23,27,0.04), 0 4px 16px rgba(20,23,27,0.06)',
        'card-hover': '0 8px 30px rgba(20,23,27,0.14)',
        pill: '0 1px 6px rgba(20,23,27,0.10)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
      },
    },
  },
  plugins: [],
};
