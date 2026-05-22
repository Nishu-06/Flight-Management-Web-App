import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        skyway: "#0f766e",
        runway: "#334155",
        cloud: "#f8fafc"
      },
      boxShadow: {
        panel: "0 18px 45px rgba(15, 23, 42, 0.09)"
      }
    }
  },
  plugins: []
};

export default config;
