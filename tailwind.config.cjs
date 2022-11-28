/** @type {import('tailwindcss').Config} */
  const colors = require('tailwindcss/colors')


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
