// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1) Tous les répertoires où tu utilises des classes Tailwind
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",    // si tu as un dossier hooks
    "./styles/**/*.css",               // pour ton globals.css ou autres
    "./public/**/*.html",              // si tu as des pages statiques
  ],

  // 2) Safelist pour les classes dynamiques et/ou critiques
  safelist: [
    // patterns dynamiques
    /^bg-(red|green|blue|yellow|indigo|purple|pink)-(400|500|600)$/,
    /^text-(xs|sm|base|lg|xl|2xl)$/,
    /^p-[0-9]+$/, /^m-[0-9]+$/,
    // classes spécifiques
    "grid-cols-3",
    "p-8",
    "text-center",
    "bg-gradient-to-r",
    "from-indigo-500",
    "to-pink-500",
  ],

  theme: {
    extend: {},
  },
  plugins: [],
};
