import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        accent: "#22D3EE",
        highlight: "#FACC15",
        dark: "#0F172A",
        card: "#1E293B",
        text: "#F9FAFB"
      },
      borderRadius: {
        "2xl": "1rem"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
