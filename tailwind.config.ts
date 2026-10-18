import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}"],
  theme: { extend: { colors: { ink: "#1E2B26", moss: "#2E5B4C", mist: "#ECEFEA", roast: "#6B3F26" } } },
  plugins: [],
} satisfies Config;
