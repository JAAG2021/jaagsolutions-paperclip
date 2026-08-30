import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          DEFAULT: "#2563eb",
        },
        // Acento de marca de Caligrapha (nuestro producto SaaS). Se usa solo
        // dentro de la sección/barra de Caligrapha para darle identidad propia
        // sin romper el azul del resto del sitio.
        caligrapha: {
          ink:   "#0a0908",
          gold:  "#d4a843",
          "gold-light": "#e8c46a",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        // Cara display de Caligrapha; solo para el wordmark del producto.
        caligrapha: ['"DM Serif Display"', "Georgia", "Cambria", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
