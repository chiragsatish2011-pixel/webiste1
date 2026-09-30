/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette lifted from the Sadvidya Pipeline document
        cream: '#F7F3EA',
        card: '#FDFBF6',
        terracotta: '#C4623F',
        olive: '#6B6B52',
        ink: '#22201C',
        peach: '#F0DBCF',
        sand: '#EEE7DA',
        sage: '#E1E8D8',
      },
      fontFamily: {
        heading: ['Poppins', 'system-ui', 'sans-serif'],
        body: ['Lora', 'Georgia', 'serif'],
        deva: ['"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '18px',
      },
      boxShadow: {
        soft: '0 2px 18px rgba(34, 32, 28, 0.06)',
      },
    },
  },
  plugins: [],
}
