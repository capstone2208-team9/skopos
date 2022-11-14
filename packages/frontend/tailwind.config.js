/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "../../node_modules/daisyui/dist/**/*.js",
    "../../node_modules/react-daisyui/dist/**/*.js']",
  ],
  theme: {
    extend: {
      colors: {
        'powder-blue': '#BCE2E8',
        'sky-blue': '#24C5E3',
        'viridian-green': '#2E939E',
        'cadmium-orange': '#E28027',
        'cedar-chest': '#D3593D',
        'dark-green': '#172729',
      },
      gridTemplateRows: {
        'layout': '80px 1fr 80px'
      }
    },
  },
  plugins: [
    require('daisyui')
  ],
}
