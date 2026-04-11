/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        primaryHover: "#2563EB",
        secondary: "#E0E7FF",
        dark: "#111827",
        bodyText: "#4B5563",
        surface: "#FFFFFF",
        surfaceAlt: "#F9FAFB",
        glass: "rgba(255, 255, 255, 0.25)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  corePlugins: {
    preflight: false,
    transitionProperty: false,
    transitionDuration: false,
    transitionTimingFunction: false,
    animation: false,
  },
  plugins: [],
};
