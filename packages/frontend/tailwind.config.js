/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "../../node_modules/daisyui/dist/**/*.js",
    "../../node_modules/react-daisyui/dist/**/*.js']",
  ],
  theme: {
    extend: {
      backgroundImage: {
        collection: 'url(assets/SVGs/Skopos_Branding_Final Logo_SKOPOS_graphic_inverted.svg)'
      },
      colors: {
        'powder-blue': '#BCE2E8',
        'powder-blue-lt': 'rgb(191,237,244)',
        'sky-blue': '#24C5E3',
        'viridian-green': '#2E939E',
        'cadmium-orange': '#E28027',
        'cedar-chest': '#D3593D',
        'dark-green': '#172729',
      },
      gridTemplateRows: {
        'layout': '80px 1fr 80px',
      },
      gridTemplateColumns: {
        'assertion-form': 'repeat(5, min-content)',
        'collections': '210px 1fr'
      }
    },
  },
  plugins: [
    require('daisyui')
  ],
}
