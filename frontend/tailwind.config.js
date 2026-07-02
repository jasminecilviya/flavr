/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        flavr: {
          50: '#FFF3E6',
          100: '#FFE0B3',
          200: '#FFCC80',
          300: '#FFB84D',
          400: '#FFA31A',
          500: '#FF6B00',
          600: '#CC5500',
          700: '#994000',
          800: '#662B00',
          900: '#331500',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
