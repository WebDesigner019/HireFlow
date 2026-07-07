import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "#FFFFFF"
        },
        success: {
          DEFAULT: "#16A34A",
          foreground: "#FFFFFF"
        },
        warning: {
          DEFAULT: "#F59E0B",
          foreground: "#111827"
        },
        danger: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      boxShadow: {
        soft: "0 14px 40px rgba(15, 23, 42, 0.08)",
        lift: "0 18px 55px rgba(37, 99, 235, 0.14)"
      },
      borderRadius: {
        xl: "0.85rem"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"]
      }
    }
  },
  plugins: [animate]
};
