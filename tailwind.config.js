/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF7F50',
        secondary: '#FFE5B4',
        accent: '#2E8B57'
      }
    }
  },
  plugins: []
}