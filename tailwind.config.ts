import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        paper: "#f5f1ea",
        line: "#1a1a1a",
        muted: "#ece7de",
        accent: "#262626"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"]
      },
      boxShadow: {
        card: "8px 8px 0 0 rgba(17,17,17,0.96)"
      }
    }
  },
  plugins: []
};

export default config;
