import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Topo-map technical palette
        bone: "#FAFAF8", // surface-0 (paper)
        clay: "#C8794D", // signal — the "alert" terra-cotta marker
        "clay-deep": "#9C5A36",
        sage: "#5E7263", // primary — topographic mid-line
        "sage-deep": "#3F4F44",
        ink: "#1B1F1C", // text
        graphite: "#4B5050",
        haze: "#ECEAE5", // surface-1
        contour: "#A39A82", // line work / dividers
        watch: "#1F2A23", // dark-mode terminal panel
      },
      fontFamily: {
        display: ["'Fraunces'", "'Source Serif 4'", "Georgia", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      maxWidth: {
        prose: "1180px",
      },
    },
  },
  plugins: [],
};

export default config;
