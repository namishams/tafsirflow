import type { Config } from "tailwindcss";

const c = (v: string) => `rgb(var(--${v}) / <alpha-value>)`;

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { bg: c("bg"), surface: c("surface"), ink: c("ink"), muted: c("muted"), line: c("line"), accent: c("accent"), "accent-soft": c("accent-soft"), gold: c("gold"), stage: c("stage") },
      fontFamily: { arabic: ["'Amiri'", "'Scheherazade New'", "serif"] },
      boxShadow: { card: "none" },
    },
  },
  plugins: [],
} satisfies Config;
