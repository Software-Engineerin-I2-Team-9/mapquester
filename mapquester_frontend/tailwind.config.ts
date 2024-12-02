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
      fontFamily: {
        'curly': ['Pacifico', 'cursive'],
      },
      colors: {
        ...colors,
        primary: '#C91C1C',
        secondary: '#F8F8F8',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
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
        },
        terracotta: '#CD5C5C',
        sand: '#E6C9A8',
        gold: '#D4AF37',
        coral: '#F08080',
        burgundy: '#800020',
        mustardyellow: '#F2C94C',
        warmcoral: '#EB5757',
        mutedorange: '#F2994A',
        dustyteal: '#56CCF2',
        deepolivegreen: '#6FCF97',
        eggshell: "#F0EBE1",
        mutedsand: "#D9C7B4",
        softterracotta: "#D69C89",
      },
    },
  },
  plugins: [],
};

export default config;
