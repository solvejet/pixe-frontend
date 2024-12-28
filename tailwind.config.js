/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#FAFAFA",
          dark: "#121212",
        },
        primary: {
          DEFAULT: "#1a1a1a",
          dark: "#E1E1E1",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
