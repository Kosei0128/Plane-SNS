import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0f172a",
          turquoise: "#0ea5e9",
          sand: "#f1f5f9"
        }
      },
      fontFamily: {
        display: ["var(--font-sans)", "system-ui"],
        body: ["var(--font-sans)", "system-ui"]
      }
    }
  },
  plugins: []
};

export default config;
