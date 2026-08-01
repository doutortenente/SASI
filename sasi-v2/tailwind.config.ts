import type {Config} from "tailwindcss";
// Cores = tokens do design system (CSS vars). Nunca hex hardcoded em componente. Cada cor e um sinal.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        app: "var(--surface-app)", card: "var(--surface-card)", accent: "var(--accent)",
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
      fontFamily: {
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"]
      },
    }
  },
  plugins: [],
};
export default config;
