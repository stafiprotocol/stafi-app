/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      white: "#ffffff",
      primary: "#00F3AB",
      navbarBg: "transparent",
      cardBg: "#0A131B",
      text1: "#9DAFBE",
      text2: "#5B6872",
      text3: "#1A2835",
      warning: "#0095EB",
      link: "#00F3AB",
      divider1: "#2B3F52",
      active: "#0095EB",
      error: "#FF52C4",
    },
    extend: {},
    fontFamily: {
      helvetica: [
        "Helvetica",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Oxygen",
        "Ubuntu",
        "Cantarell",
        "Fira Sans",
        "Droid Sans",
        "Helvetica Neue",
        "sans-serif",
      ],
    },
  },
  plugins: [],
};
