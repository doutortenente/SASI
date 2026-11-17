import type {Config} from "tailwindcss";
// Cores: `app.*` = tokens da v1.0 "Comando UTI Alpha" (CSS vars RGB em globals.css);
// demais chaves = tokens do design system usados pelas telas do SASI v2.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Theme-aware tokens da v1.0 (backed by CSS vars in globals.css)
        app: {
          DEFAULT: "rgb(var(--app-bg) / <alpha-value>)",
          card: "rgb(var(--app-card) / <alpha-value>)",
          tertiary: "rgb(var(--app-tertiary) / <alpha-value>)",
          border: "rgb(var(--app-border) / <alpha-value>)",
          text: "rgb(var(--app-text) / <alpha-value>)",
          "text-2": "rgb(var(--app-text-2) / <alpha-value>)",
          "text-muted": "rgb(var(--app-text-muted) / <alpha-value>)",
          accent: "rgb(var(--app-accent) / <alpha-value>)",
          "accent-hover": "rgb(var(--app-accent-hover) / <alpha-value>)",
          success: "rgb(var(--app-success, 16 185 129) / <alpha-value>)",
          warning: "rgb(var(--app-warning, 245 158 11) / <alpha-value>)",
          danger: "rgb(var(--app-danger, 239 68 68) / <alpha-value>)",
        },
        sasi: {
          critical: "#dc2626",
          warning: "#f59e0b",
          ok: "#16a34a",
          bg: "#0f172a",
          panel: "#1e293b",
        },
        card: "var(--surface-card)", accent: "var(--accent)",
        heading: "var(--text-heading)", body: "var(--text-body)", muted: "var(--text-muted)",
        grav: {
          stable: "var(--grav-stable-solid)",
          watcher: "var(--grav-watcher-solid)",
          unstable: "var(--grav-unstable-solid)",
          critical: "var(--grav-critical-solid)",
          deceased: "var(--grav-deceased-solid)"
        },
        sofa: {
          low: "var(--sofa-low)",
          medium: "var(--sofa-medium)",
          high: "var(--sofa-high)",
          critical: "var(--sofa-critical)"
        },
      },
    }
  },
  plugins: [],
};
export default config;
