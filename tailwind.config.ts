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
        brand: {
          primary: "var(--brand-primary, #1D4ED8)",
          "primary-hover": "var(--brand-primary-hover, #1E40AF)",
          accent: "var(--brand-accent, #F59E0B)",
        },
        surface: {
          base: "var(--surface-base, #FFFFFF)",
          subtle: "var(--surface-subtle, #F8FAFC)",
          "admin-base": "var(--surface-admin-base, #F1F5F9)",
        },
        border: {
          default: "var(--border-default, #E2E8F0)",
        },
        text: {
          primary: "var(--text-primary, #0F172A)",
          secondary: "var(--text-secondary, #475569)",
          muted: "var(--text-muted, #94A3B8)",
        },
        status: {
          neutral: "var(--status-neutral, #64748B)",
          info: "var(--status-info, #2563EB)",
          success: "var(--status-success, #16A34A)",
          warning: "var(--status-warning, #D97706)",
          danger: "var(--status-danger, #DC2626)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        12: "48px",
        16: "64px",
      },
      maxWidth: {
        container: "1120px",
      },
    },
  },
  plugins: [],
};
export default config;
