import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#0052FF", // Base Blue
          hover: "#0039B3",
          light: "#3B82F6",
        },
        cyber: {
          neon: "#00F0FF",
          glow: "#00FFA3",
          purple: "#7928CA",
          dark: "#080B11",
          card: "#0F1420",
          border: "#1E293B",
          accent: "#22D3EE",
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-grid': 'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
      },
      animation: {
        'scan': 'scan 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0%)', opacity: '0.8' },
          '50%': { transform: 'translateY(100%)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
