/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
        },
        border: {
          DEFAULT: "var(--border)",
          token: "var(--color-border-default)",
          strong: "var(--color-border-strong)",
        },
        input: "var(--input)",
        ring: "var(--ring)",
        app: "var(--color-bg-app)",
        surface: {
          DEFAULT: "var(--color-bg-surface)",
          muted: "var(--color-bg-app)",
        },
        editor: "var(--color-bg-editor)",
        ink: {
          DEFAULT: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
        },
        "accent-primary": "var(--color-accent-primary)",
        "accent-danger": "var(--color-accent-danger)",
        "accent-warning": "var(--color-accent-warning)",
        "accent-success": "var(--color-accent-success)",
      },
      spacing: {
        "token-2": "var(--space-2)",
        "token-4": "var(--space-4)",
        "token-8": "var(--space-8)",
        "token-12": "var(--space-12)",
        "token-16": "var(--space-16)",
        "token-24": "var(--space-24)",
        "token-32": "var(--space-32)",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
