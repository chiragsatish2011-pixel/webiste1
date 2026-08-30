/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'ct-orange': '#FF6500',
        'ct-bg': '#06111F',
        'ct-dark': '#05080C',
        'ct-build': '#D8D0BC',
        'ct-offwhite': '#F2EFE6',
      },
      fontFamily: {
        'condensed': ['"Barlow Condensed"', '"Oswald"', '"Roboto Condensed"', 'sans-serif'],
        'sans': ['"Barlow"', '"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
