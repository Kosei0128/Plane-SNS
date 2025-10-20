import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          blue: "#0f172a",
          turquoise: "#0ea5e9",
          sand: "#f1f5f9",
        },
        dark: {
          bg: "#0a0a0f", // Deep, near-black background
          surface: "#13141f", // Cards and elevated surfaces
          elevated: "#1a1b2e", // Hover states, modals
          border: "#2a2b3f", // Borders and dividers
          accent: "#00d9ff", // Bright cyan for highlights
          purple: "#a855f7", // Vibrant purple
          pink: "#ec4899", // Hot pink
          glow: "rgba(0, 217, 255, 0.15)", // Glow color for shadows
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        display: ["var(--font-sans)", "system-ui"],
        body: ["var(--font-sans)", "system-ui"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 217, 255, 0.3)",
        "glow-sm": "0 0 10px rgba(0, 217, 255, 0.2)",
        "glow-lg": "0 0 30px rgba(0, 217, 255, 0.4)",
        "purple-glow": "0 0 20px rgba(168, 85, 247, 0.3)",
        "pink-glow": "0 0 20px rgba(236, 72, 153, 0.3)",
      },
      backgroundImage: {
        "dark-gradient": "linear-gradient(135deg, #0a0a0f 0%, #13141f 50%, #1a1b2e 100%)",
        "accent-gradient": "linear-gradient(135deg, #00d9ff 0%, #a855f7 100%)",
        "pink-gradient": "linear-gradient(135deg, #ec4899 0%, #a855f7 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
