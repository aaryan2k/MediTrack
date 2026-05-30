/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#030014",
        secondary: "#151312",
        accent: "#2FA3DC",
        warning: "#D40000",
      },
    },
  },
  plugins: [],
};