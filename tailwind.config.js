/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#FE8C15",
        "cream-50": "#FFF9F1",
        "orange-200": "#FFE8CC",
        "green-200": "#CCF6E8",
        "blue-200": "#CCEEFF",
        "yellow-200": "#FFF9CC",
      },
    },
  },
  plugins: [],
};
