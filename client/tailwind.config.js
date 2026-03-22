/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        bebas: ['"Bebas Neue"', 'sans-serif'],
        barlow: ['"Barlow"', 'sans-serif'],
        condensed: ['"Barlow Condensed"', 'sans-serif'],
      },
      colors: {
        gold: '#F5A623',
        'gold-dark': '#c27d0e',
        bg: '#07090F',
        s1: '#0D1120',
        s2: '#141928',
        s3: '#1C2338',
        s4: '#232B42',
        danger: '#E24B4A',
        success: '#4ADE80',
        info: '#60A5FA',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease',
        'slide-up': 'slideUp 0.4s ease',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
