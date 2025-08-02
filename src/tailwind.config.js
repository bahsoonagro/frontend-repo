/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#001F3F',
        },
        sky: {
          400: '#38bdf8',
          600: '#0284c7',
          700: '#0369a1',
        },
        'light-brown': '#C19A6B',
        brown: {
          600: '#9B7E44',
        },
      },
    },
  },
  plugins: [],
};

