/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#adc2ff',
          400: '#7599ff',
          500: '#3b66ff', // RentEase brand blue
          600: '#2546e6',
          700: '#1c33b8',
          800: '#182994',
          900: '#182575',
        },
      },
    },
  },
  plugins: [],
}
