import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}"],
  theme: { extend: { colors: { ink: "#26372E", moss: "#315B45", mist: "#F4F2E9", roast: "#765037", cream: "#FBF9F2", leaf: "#DCE7D9" } } },
  plugins: [],
} satisfies Config;
