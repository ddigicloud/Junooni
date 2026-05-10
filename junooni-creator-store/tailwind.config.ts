import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter:           ["var(--font-inter)", "sans-serif"],
        poppins:         ["var(--font-poppins)", "sans-serif"],
        playfair:        ["var(--font-playfair)", "serif"],
        "dm-sans":       ["var(--font-dm-sans)", "sans-serif"],
        "space-grotesk": ["var(--font-space-grotesk)", "sans-serif"],
        "nunito":     ["var(--font-nunito)", "sans-serif"],
        "raleway":    ["var(--font-raleway)", "sans-serif"],
        "montserrat": ["var(--font-montserrat)", "sans-serif"],
      },
      colors: {
        brand: {
          primary:   "var(--brand-primary)",
          secondary: "var(--brand-secondary)",
        },
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}

export default config