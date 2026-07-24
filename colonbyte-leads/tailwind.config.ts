import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "rgba(255,255,255,0.1)",
        input: "rgb(30,41,59)",
        ring: "rgb(99,102,241)",
        background: "rgb(6,6,16)",
        foreground: "rgb(226,232,240)",
        primary: {
          DEFAULT: "rgb(99,102,241)",
          foreground: "rgb(255,255,255)",
        },
        muted: {
          DEFAULT: "rgb(15,23,42)",
          foreground: "rgb(100,116,139)",
        },
        accent: {
          DEFAULT: "rgb(30,41,59)",
          foreground: "rgb(226,232,240)",
        },
        popover: {
          DEFAULT: "rgb(15,23,42)",
          foreground: "rgb(226,232,240)",
        },
      },
      animation: {
        "gradient-x": "gradient-x 3s ease infinite",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
