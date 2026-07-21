import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3f6fb",
          100: "#e4ebf6",
          200: "#c6d5ec",
          300: "#9bb6dd",
          400: "#6a90ca",
          500: "#476fb5",
          600: "#365799",
          700: "#2d477c",
          800: "#293e67",
          900: "#263657",
        },
      },
    },
  },
  plugins: [],
};

export default config;
