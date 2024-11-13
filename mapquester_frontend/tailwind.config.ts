import type { Config } from "tailwindcss";
const colors = require('tailwindcss/colors')

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ...colors,
        background: "var(--background)",
        foreground: "var(--foreground)",
        blue: {
          100: "#E6F3FF",
          // ... other blue shades if needed ...
          800: "#1E40AF",
        },
        green: {
          100: "#E6FFEA",
          // ... other green shades if needed ...
        },
        pink: {
          500: "#ec4899",
        }
      },
    },
  },
  plugins: [],
};

export default config;
