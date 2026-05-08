import type { Config } from "tailwindcss";

/*
 * Skyline Watch — Wave 2 design refresh 2026-05-08
 * Reference: officevibe (Electric Data Flow)
 * Token NAMES preserved (bone, clay, sage, ink, graphite, haze,
 * contour, watch) so existing page.tsx/component classes keep
 * rendering unchanged. Only VALUES are remapped from topographic
 * terra-cotta + sage palette → Brand-Electric blue + Boardroom-Navy
 * + Soft Off-White. Display face swapped from Fraunces serif →
 * DM Sans (substitute for ABC Favorit Variable per ref).
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces
        bone: "#F9F8F6",         // surface-0 (Soft Off-White)
        haze: "#EAEBF8",         // surface-1 (Light Cool Gray)
        contour: "#CCCCCC",      // line work / Input Border Gray
        // Brand pigments
        sage: "#0C1754",         // primary heading / Boardroom Navy
        "sage-deep": "#171417",  // Pitch Black
        clay: "#2545FF",         // Brand Electric — alert/CTA
        "clay-deep": "#1A2EBC",  // Brand Electric darker
        // Ink
        ink: "#171417",          // Pitch Black
        graphite: "#222222",     // Medium Gray
        // Dark panel
        watch: "#0C1754"         // Boardroom Navy
      },
      fontFamily: {
        display: ["'DM Sans'", "'Inter'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"]
      },
      maxWidth: {
        prose: "1180px"
      },
      borderRadius: {
        pill: "100px",
        card: "16px"
      },
      boxShadow: {
        card: "0 16px 40px -32px rgba(12, 23, 84, 0.18)",
        cardHover: "0 24px 48px -28px rgba(12, 23, 84, 0.28)"
      }
    }
  },
  plugins: []
};

export default config;
