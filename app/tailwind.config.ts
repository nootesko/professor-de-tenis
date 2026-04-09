import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#30675d",
          dark: "#23514a",
          green: "#0f8445",
          lime: "#b6cd21",
          lime2: "#a3e242",
          lime3: "#97c251",
          mint: "#eff8f6",
          mint2: "#e8f2f0",
          tint: "#ebfbd2",
          tint2: "#dcecc3",
          info: "#3aa8f5",
          yellow: "#edbe16",
          purple: "#241957",
        },
        ink: {
          900: "#363636",
          700: "#525866",
          600: "#545d68",
          500: "#788d88",
          300: "#b9c2bd",
        },
        line: "#e0e5ed",
      },
      fontFamily: {
        sans: ["var(--font-dmsans)", "system-ui", "sans-serif"],
        display: ["var(--font-archivo)", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "16px", input: "12px", pill: "999px" },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)",
        soft: "0 4px 24px rgba(48,103,93,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
