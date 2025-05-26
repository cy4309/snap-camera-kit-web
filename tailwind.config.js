/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#000",
      },
      boxShadow: {
        glow: "0px 0px 23.94px 0px rgba(255, 255, 255, 0.8), 0px 0px 13.68px 0px rgba(255, 255, 255, 0.6), 0px 0px 7.98px 0px rgba(255, 255, 255, 0.4), 0px 0px 3.99px 0px rgba(255, 255, 255, 0.3), 0px 0px 1.14px 0px rgba(255, 255, 255, 0.2), 0px 0px 0.57px 0px rgba(255, 255, 255, 0.1)",
      },
    },
  },
  plugins: [],
};
