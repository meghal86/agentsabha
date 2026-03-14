import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        neela: "#1B2A4A",
        kesariya: "#FF9933",
        sindoori: "#C8592A",
        hariyali: "#2D6A4F",
        haldi: "#F5E6C8",
        mitti: "#A0522D",
        haath: "#FAF3E0",
        raat: "#1A1A2E"
      },
      fontFamily: {
        display: ["var(--font-playfair)"],
        hindi: ["var(--font-tiro)"],
        body: ["var(--font-dm-sans)"],
        devanagari: ["var(--font-noto-devanagari)"]
      }
    }
  },
  plugins: []
};

export default config;

