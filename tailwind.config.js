export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        wine: {
          primary: 'rgb(var(--wine-primary) / <alpha-value>)',
          dark: 'rgb(var(--wine-dark) / <alpha-value>)',
          accent: 'rgb(var(--wine-accent) / <alpha-value>)',
          glow: 'rgb(var(--wine-glow) / <alpha-value>)'
        },
        theme: {
          bg: 'rgb(var(--theme-bg) / <alpha-value>)',
          soft: 'rgb(var(--theme-soft) / <alpha-value>)',
          card: 'rgb(var(--theme-card) / <alpha-value>)',
          border: 'rgb(var(--theme-border) / <alpha-value>)',
          text: 'rgb(var(--theme-text) / <alpha-value>)',
          muted: 'rgb(var(--theme-muted) / <alpha-value>)'
        }
      }
    },
  },
  plugins: [],
}