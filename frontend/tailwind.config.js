/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        office: {
          blue: '#2564cf',
          'blue-light': '#3b6cd4',
          'blue-dark': '#1e4db0',
          'blue-bg': '#eff6ff',
        },
      },
    },
  },
  plugins: [],
};
