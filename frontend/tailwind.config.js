/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        data: ['var(--font-data)'],
        sans: ['var(--font-body)'],
        mono: ['var(--font-data)'],
      },
      colors: {
        surface: {
          DEFAULT: 'rgba(255, 255, 255, 0.03)',
          1: 'rgba(255, 255, 255, 0.015)',
          2: 'rgba(255, 255, 255, 0.03)',
          panel: 'rgba(0, 0, 0, 0.4)',
        },
        text: {
          DEFAULT: 'rgb(248, 250, 252)',
          base: 'rgb(203, 213, 225)',
          muted: 'rgb(148, 163, 184)',
        },
        accent: {
          teal: 'var(--accent-teal)',
        },
        semantic: {
          bom: 'var(--sem-bom)',
          atencao: 'var(--sem-atencao)',
          perigo: 'var(--sem-perigo)',
          fraco: 'var(--sem-fraco)',
          alerta: 'var(--sem-alerta)',
          nerd: 'var(--sem-nerd)',
        },
        app: {
          DEFAULT: 'rgb(var(--app-bg) / <alpha-value>)',
          card: 'rgb(var(--app-card) / <alpha-value>)',
          tertiary: 'rgb(var(--app-tertiary) / <alpha-value>)',
          border: 'rgb(var(--app-border) / <alpha-value>)',
          text: 'rgb(var(--app-text) / <alpha-value>)',
          'text-2': 'rgb(var(--app-text-2) / <alpha-value>)',
          'text-muted': 'rgb(var(--app-text-muted) / <alpha-value>)',
          accent: 'rgb(var(--app-accent) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
};
