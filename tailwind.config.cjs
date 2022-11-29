const colors = require('tailwindcss/colors')
/** @type {import('tailwindcss').Config} */

delete colors['lightBlue'];
delete colors['warmGray'];
delete colors['trueGray'];
delete colors['coolGray'];
delete colors['blueGray'];

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    colors: {
      ...colors,
      victory: '#68b568',
      loss: '#c33c3c',
      neutral: '#ADD8E6',
    },
  },
  plugins: [],
};
