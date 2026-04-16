# JAAGSOLUTIONS Web Landing — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir y desplegar en Vercel la landing one-page de JAAGSOLUTIONS con 11 secciones, formulario de contacto funcional, SEO base y diseno responsive corporativo.

**Architecture:** Proyecto React + Vite + TypeScript independiente en `jaagsolutions-web/` dentro del monorepo de Paperclip, pero sin ser parte del workspace de pnpm. Tailwind CSS para estilos. React Hook Form para validacion del formulario. Formspree como destino del submit. Analytics con gtag opcional. Vercel apunta a esta carpeta como root directory.

**Tech Stack:** React 18, Vite 6, TypeScript 5, Tailwind CSS 3, react-hook-form, @formspree/react, Node.js 20+

---

## File Map

```
jaagsolutions-web/
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── tsconfig.node.json
├── index.html
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── components/
    │   ├── SectionHeader.tsx     ← titulo + subtitulo reutilizable
    │   ├── CTAButton.tsx         ← botones primario/secundario/texto
    │   ├── Card.tsx              ← card generica con titulo, texto, icono opcional
    │   └── FaqItem.tsx           ← accordion item
    └── sections/
        ├── TopNav.tsx
        ├── HeroSection.tsx
        ├── BenefitsSection.tsx
        ├── ServicesSection.tsx
        ├── ProcessSection.tsx
        ├── UseCasesSection.tsx
        ├── ComparisonSection.tsx
        ├── ContactFormSection.tsx
        ├── FaqSection.tsx
        ├── FinalCtaSection.tsx
        └── FooterSection.tsx
```

---

### Task 1: Scaffolding — crear el proyecto Vite + React + TypeScript + Tailwind

**Files:**
- Create: `jaagsolutions-web/package.json`
- Create: `jaagsolutions-web/vite.config.ts`
- Create: `jaagsolutions-web/tailwind.config.ts`
- Create: `jaagsolutions-web/postcss.config.js`
- Create: `jaagsolutions-web/tsconfig.json`
- Create: `jaagsolutions-web/tsconfig.node.json`
- Create: `jaagsolutions-web/index.html`
- Create: `jaagsolutions-web/src/main.tsx`
- Create: `jaagsolutions-web/src/App.tsx`
- Create: `jaagsolutions-web/src/index.css`
- Create: `jaagsolutions-web/public/favicon.svg`

- [ ] **Step 1: Crear `jaagsolutions-web/package.json`**

```json
{
  "name": "jaagsolutions-web",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@formspree/react": "^2.5.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.54.2"
  },
  "devDependencies": {
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.1",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.3",
    "vite": "^6.0.11"
  }
}
```

- [ ] **Step 2: Crear `jaagsolutions-web/vite.config.ts`**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

- [ ] **Step 3: Crear `jaagsolutions-web/tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a8a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 4: Crear `jaagsolutions-web/postcss.config.js`**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 5: Crear `jaagsolutions-web/tsconfig.json`**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.app.json" }
  ]
}
```

- [ ] **Step 6: Crear `jaagsolutions-web/tsconfig.app.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
```

- [ ] **Step 7: Crear `jaagsolutions-web/tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts", "tailwind.config.ts", "postcss.config.js"]
}
```

- [ ] **Step 8: Crear `jaagsolutions-web/index.html`**

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JAAGSOLUTIONS | Automatizacion y SaaS para PYMEs</title>
    <meta
      name="description"
      content="Optimizamos procesos empresariales con Automatizacion y desarrollo SaaS. Reduce costos, acelera operaciones y escala tu negocio con JAAGSOLUTIONS."
    />
    <meta property="og:title" content="JAAGSOLUTIONS | Automatizacion y SaaS para PYMEs" />
    <meta
      property="og:description"
      content="Optimizamos procesos empresariales con Automatizacion y desarrollo SaaS. Reduce costos, acelera operaciones y escala tu negocio con JAAGSOLUTIONS."
    />
    <meta property="og:type" content="website" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 9: Crear `jaagsolutions-web/public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#2563eb"/>
  <text x="16" y="22" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="white">J</text>
</svg>
```

- [ ] **Step 10: Crear `jaagsolutions-web/src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
  body {
    @apply font-sans text-gray-800 antialiased;
  }
}
```

- [ ] **Step 11: Crear `jaagsolutions-web/src/main.tsx`**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 12: Crear `jaagsolutions-web/src/App.tsx`** (esqueleto — se rellenara en tasks siguientes)

```tsx
import TopNav from "./sections/TopNav.tsx";
import HeroSection from "./sections/HeroSection.tsx";
import BenefitsSection from "./sections/BenefitsSection.tsx";
import ServicesSection from "./sections/ServicesSection.tsx";
import ProcessSection from "./sections/ProcessSection.tsx";
import UseCasesSection from "./sections/UseCasesSection.tsx";
import ComparisonSection from "./sections/ComparisonSection.tsx";
import ContactFormSection from "./sections/ContactFormSection.tsx";
import FaqSection from "./sections/FaqSection.tsx";
import FinalCtaSection from "./sections/FinalCtaSection.tsx";
import FooterSection from "./sections/FooterSection.tsx";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <main>
        <HeroSection />
        <BenefitsSection />
        <ServicesSection />
        <ProcessSection />
        <UseCasesSection />
        <ComparisonSection />
        <ContactFormSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <FooterSection />
    </div>
  );
}
```

- [ ] **Step 13: Instalar dependencias**

```bash
cd jaagsolutions-web
pnpm install
```

- [ ] **Step 14: Crear stubs vacios para que el proyecto compile**

Crear cada uno de los siguientes archivos con contenido minimo (se reemplazaran en tasks siguientes):

`src/components/SectionHeader.tsx`:
```tsx
export default function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-gray-600">{subtitle}</p>}
    </div>
  );
}
```

`src/components/CTAButton.tsx`:
```tsx
type CTAButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "text";
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
};

export default function CTAButton({
  children,
  variant = "primary",
  href,
  onClick,
  type = "button",
  className = "",
}: CTAButtonProps) {
  const base = "inline-flex items-center justify-center font-semibold rounded-lg transition-colors duration-200 px-6 py-3 text-base";
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
    secondary: "border-2 border-brand-600 text-brand-600 hover:bg-brand-50",
    text: "text-brand-600 hover:text-brand-700 underline-offset-2 hover:underline px-0 py-0",
  };
  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return <a href={href} className={classes}>{children}</a>;
  }
  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
```

`src/components/Card.tsx`:
```tsx
type CardProps = {
  title: string;
  text: string;
  icon?: React.ReactNode;
};

export default function Card({ title, text, icon }: CardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      {icon && <div className="mb-4 text-brand-600">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{text}</p>
    </div>
  );
}
```

`src/components/FaqItem.tsx`:
```tsx
import { useState } from "react";

type FaqItemProps = {
  question: string;
  answer: string;
};

export default function FaqItem({ question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200">
      <button
        className="w-full flex justify-between items-center py-5 text-left font-semibold text-gray-900 hover:text-brand-600 transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{question}</span>
        <span className="ml-4 text-xl text-brand-600">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <p className="pb-5 text-gray-600 leading-relaxed">{answer}</p>
      )}
    </div>
  );
}
```

Crear stubs minimos para cada seccion (se reemplazaran en tasks 2-6):

```bash
mkdir -p src/sections
```

Crear `src/sections/TopNav.tsx`:
```tsx
export default function TopNav() { return <nav />; }
```

Crear `src/sections/HeroSection.tsx`:
```tsx
export default function HeroSection() { return <section id="inicio" />; }
```

Crear `src/sections/BenefitsSection.tsx`:
```tsx
export default function BenefitsSection() { return <section id="beneficios" />; }
```

Crear `src/sections/ServicesSection.tsx`:
```tsx
export default function ServicesSection() { return <section id="servicios" />; }
```

Crear `src/sections/ProcessSection.tsx`:
```tsx
export default function ProcessSection() { return <section id="proceso" />; }
```

Crear `src/sections/UseCasesSection.tsx`:
```tsx
export default function UseCasesSection() { return <section id="casos" />; }
```

Crear `src/sections/ComparisonSection.tsx`:
```tsx
export default function ComparisonSection() { return <section id="comparativa" />; }
```

Crear `src/sections/ContactFormSection.tsx`:
```tsx
export default function ContactFormSection() { return <section id="contacto" />; }
```

Crear `src/sections/FaqSection.tsx`:
```tsx
export default function FaqSection() { return <section id="faq" />; }
```

Crear `src/sections/FinalCtaSection.tsx`:
```tsx
export default function FinalCtaSection() { return <section />; }
```

Crear `src/sections/FooterSection.tsx`:
```tsx
export default function FooterSection() { return <footer />; }
```

- [ ] **Step 15: Verificar que el proyecto compila**

```bash
cd jaagsolutions-web
pnpm dev
```

Abrir http://localhost:5173 — debe mostrar una pagina en blanco sin errores en consola.

- [ ] **Step 16: Commit**

```bash
git add jaagsolutions-web/
git commit -m "feat(jaagsolutions-web): scaffold Vite + React + TypeScript + Tailwind project"
```

---

### Task 2: TopNav y HeroSection

**Files:**
- Modify: `jaagsolutions-web/src/sections/TopNav.tsx`
- Modify: `jaagsolutions-web/src/sections/HeroSection.tsx`

- [ ] **Step 1: Implementar `TopNav.tsx`**

```tsx
import { useState } from "react";
import CTAButton from "../components/CTAButton.tsx";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Proceso", href: "#proceso" },
  { label: "Casos de uso", href: "#casos" },
  { label: "Contacto", href: "#contacto" },
];

export default function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#inicio" className="font-bold text-xl text-brand-700 tracking-tight">
            JAAG<span className="text-gray-900">SOLUTIONS</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <CTAButton href="#contacto" variant="primary" className="text-sm px-4 py-2">
              Solicitar diagnostico
            </CTAButton>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-2 py-2 text-sm font-medium text-gray-700 hover:text-brand-600"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2">
              <CTAButton href="#contacto" variant="primary" className="w-full text-sm">
                Solicitar diagnostico
              </CTAButton>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Implementar `HeroSection.tsx`**

```tsx
import CTAButton from "../components/CTAButton.tsx";

export default function HeroSection() {
  return (
    <section id="inicio" className="relative bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%23ffffff opacity=.03%3E%3Cpath d=M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Automatizacion + SaaS para PYMEs
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Automatiza tus procesos y escala tu empresa con soluciones inteligentes.
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 leading-relaxed">
              En JAAGSOLUTIONS ayudamos a PYMEs a mejorar su operacion con dos lineas de servicio integradas: Automatizaciones de flujo y desarrollo SaaS orientado a resultados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <CTAButton href="#contacto" variant="primary" className="bg-white text-brand-700 hover:bg-gray-50 text-base px-8 py-4">
                Solicitar diagnostico
              </CTAButton>
              <CTAButton href="#servicios" variant="secondary" className="border-white text-white hover:bg-white/10 text-base px-8 py-4">
                Ver servicios
              </CTAButton>
            </div>
            <p className="mt-6 text-sm text-blue-200">
              Implementacion clara, enfoque en retorno y acompanamiento continuo.
            </p>
          </div>

          {/* Visual — stats/trust */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {[
              { value: "1–4 sem", label: "Tiempo de implementacion MVP" },
              { value: "−60%", label: "Reduccion de tareas manuales" },
              { value: "3 paquetes", label: "Starter / Growth / Scale" },
              { value: "2 lineas", label: "Automatizacion + SaaS" },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-extrabold text-white mb-1">{value}</div>
                <div className="text-sm text-blue-200">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verificar en browser**

```bash
cd jaagsolutions-web && pnpm dev
```

Abrir http://localhost:5173. Verificar: nav sticky, hero con gradiente azul, CTA primario y secundario visibles, menu hamburguesa funciona en mobile.

- [ ] **Step 4: Commit**

```bash
git add jaagsolutions-web/src/sections/TopNav.tsx jaagsolutions-web/src/sections/HeroSection.tsx
git commit -m "feat(jaagsolutions-web): implement TopNav with mobile menu and HeroSection"
```

---

### Task 3: BenefitsSection y ServicesSection

**Files:**
- Modify: `jaagsolutions-web/src/sections/BenefitsSection.tsx`
- Modify: `jaagsolutions-web/src/sections/ServicesSection.tsx`

- [ ] **Step 1: Implementar `BenefitsSection.tsx`**

```tsx
import SectionHeader from "../components/SectionHeader.tsx";
import Card from "../components/Card.tsx";

const benefits = [
  {
    title: "Menos trabajo manual",
    text: "Eliminamos tareas repetitivas para liberar tiempo de tu equipo en actividades de mayor valor.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Mayor velocidad operativa",
    text: "Reducimos tiempos de respuesta y ejecucion con flujos estructurados y automatizados.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Menos errores y retrabajo",
    text: "Estandarizamos procesos para aumentar consistencia, calidad y control.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    title: "Mejor toma de decisiones",
    text: "Centralizamos datos y visibilidad para que lideres con informacion clara y accionable.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export default function BenefitsSection() {
  return (
    <section id="beneficios" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Beneficios tangibles para tu negocio" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b) => (
            <Card key={b.title} title={b.title} text={b.text} icon={b.icon} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Implementar `ServicesSection.tsx`**

```tsx
import SectionHeader from "../components/SectionHeader.tsx";
import CTAButton from "../components/CTAButton.tsx";

const pillarA = [
  "Captacion, calificacion y seguimiento de leads",
  "Cotizacion, aprobacion y cierre comercial",
  "Tickets de soporte y SLA",
  "Automatizacion documental (facturas, contratos, formularios)",
  "Cobranza automatizada y alertas de cartera",
];

const pillarB = [
  "SaaS comercial (pipeline, seguimiento, reportes)",
  "SaaS operativo (tareas, aprobaciones, flujos internos)",
  "SaaS de soporte (tickets, base de conocimiento, tiempos)",
  "SaaS financiero ligero (facturacion, cobranza, dashboard)",
  "Modulos a medida segun proceso y madurez del cliente",
];

export default function ServicesSection() {
  return (
    <section id="servicios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Servicios para crecer con orden: Automatizacion + SaaS"
          subtitle="Dos lineas de servicio integradas que se complementan segun la etapa y objetivo de tu empresa."
        />
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Pilar A */}
          <div className="bg-brand-50 border border-brand-100 rounded-2xl p-8">
            <div className="inline-flex items-center gap-2 bg-brand-600 text-white text-sm font-semibold px-3 py-1 rounded-full mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Automatizacion de flujos
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Automatizacion de Procesos</h3>
            <p className="text-gray-600 mb-6">
              Disenamos e implementamos automatizaciones de alto impacto para optimizar procesos puntuales o transversales.
            </p>
            <ul className="space-y-3">
              {pillarA.map((item) => (
                <li key={item} className="flex items-start gap-2 text-gray-700 text-sm">
                  <svg className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Pilar B */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
            <div className="inline-flex items-center gap-2 bg-gray-800 text-white text-sm font-semibold px-3 py-1 rounded-full mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
              </svg>
              Desarrollo SaaS
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">SaaS para PYMEs</h3>
            <p className="text-gray-600 mb-6">
              Construimos plataformas SaaS para operar areas clave del negocio con trazabilidad, control y escalabilidad.
            </p>
            <ul className="space-y-3">
              {pillarB.map((item) => (
                <li key={item} className="flex items-start gap-2 text-gray-700 text-sm">
                  <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center">
          <CTAButton href="#contacto" variant="primary">
            Hablar con un especialista
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verificar en browser**

Verificar que Benefits muestra 4 cards en grid y Services muestra 2 pilares simetricos. En mobile deben apilarse verticalmente.

- [ ] **Step 4: Commit**

```bash
git add jaagsolutions-web/src/sections/BenefitsSection.tsx jaagsolutions-web/src/sections/ServicesSection.tsx
git commit -m "feat(jaagsolutions-web): implement BenefitsSection and ServicesSection"
```

---

### Task 4: ProcessSection y UseCasesSection

**Files:**
- Modify: `jaagsolutions-web/src/sections/ProcessSection.tsx`
- Modify: `jaagsolutions-web/src/sections/UseCasesSection.tsx`

- [ ] **Step 1: Implementar `ProcessSection.tsx`**

```tsx
import SectionHeader from "../components/SectionHeader.tsx";
import CTAButton from "../components/CTAButton.tsx";

const steps = [
  {
    number: "01",
    title: "Analizamos",
    text: "Entendemos tu operacion y detectamos oportunidades de alto impacto con criterios de negocio.",
  },
  {
    number: "02",
    title: "Implementamos",
    text: "Disenamos y desplegamos soluciones adaptadas a tus procesos, con foco en uso real y adopcion.",
  },
  {
    number: "03",
    title: "Optimizamos",
    text: "Medimos resultados, ajustamos flujos y acompanamos mejoras continuas.",
  },
];

export default function ProcessSection() {
  return (
    <section id="proceso" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Nuestro metodo en 3 pasos" />
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-brand-200 z-0" style={{ width: "calc(100% - 4rem)" }} />
              )}
              <div className="relative z-10 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-600 text-white text-xl font-extrabold mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <CTAButton href="#contacto" variant="secondary">
            Conocer nuestro metodo
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Implementar `UseCasesSection.tsx`**

```tsx
import SectionHeader from "../components/SectionHeader.tsx";
import CTAButton from "../components/CTAButton.tsx";

const useCases = [
  {
    title: "Captacion y seguimiento de leads",
    problem: "Se pierden oportunidades por falta de seguimiento oportuno.",
    solution: "Flujo automatico de captacion, scoring, asignacion y agenda.",
    result: "Mayor tasa de contacto y reuniones efectivas.",
  },
  {
    title: "Cotizacion a cierre",
    problem: "Las propuestas tardan y cae la conversion.",
    solution: "Generacion semiautomatica de propuestas y seguimiento de etapas.",
    result: "Menor tiempo de respuesta y mayor cierre.",
  },
  {
    title: "Cuentas por cobrar",
    problem: "Cartera vencida y gestion manual ineficiente.",
    solution: "Recordatorios, escalamiento y tablero de cobranza.",
    result: "Mejor flujo de caja y menor morosidad.",
  },
  {
    title: "Mesa de ayuda y soporte",
    problem: "Solicitudes dispersas sin trazabilidad.",
    solution: "Ticketing centralizado, prioridades y SLA por tipo de caso.",
    result: "Mejor experiencia y menor tiempo de resolucion.",
  },
];

export default function UseCasesSection() {
  return (
    <section id="casos" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Casos de uso frecuentes en PYMEs"
          subtitle="Soluciones concretas para los problemas mas comunes en operaciones empresariales."
        />
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {useCases.map((uc) => (
            <div key={uc.title} className="bg-gray-50 rounded-xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{uc.title}</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">Problema</span>
                  <p className="text-sm text-gray-700 mt-1">{uc.problem}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">Solucion</span>
                  <p className="text-sm text-gray-700 mt-1">{uc.solution}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Resultado esperado</span>
                  <p className="text-sm text-gray-700 mt-1">{uc.result}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <CTAButton href="#contacto" variant="secondary">
            Ver flujos para mi empresa
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verificar en browser**

Process debe mostrar 3 pasos numerados en columnas (con conector visual en desktop). UseCases debe mostrar 4 cards en grid 2x2.

- [ ] **Step 4: Commit**

```bash
git add jaagsolutions-web/src/sections/ProcessSection.tsx jaagsolutions-web/src/sections/UseCasesSection.tsx
git commit -m "feat(jaagsolutions-web): implement ProcessSection and UseCasesSection"
```

---

### Task 5: ComparisonSection y ContactFormSection

**Files:**
- Modify: `jaagsolutions-web/src/sections/ComparisonSection.tsx`
- Modify: `jaagsolutions-web/src/sections/ContactFormSection.tsx`

- [ ] **Step 1: Implementar `ComparisonSection.tsx`**

```tsx
import SectionHeader from "../components/SectionHeader.tsx";
import CTAButton from "../components/CTAButton.tsx";

export default function ComparisonSection() {
  return (
    <section id="comparativa" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="No compiten entre si: se complementan"
          subtitle="Cada solucion tiene su momento ideal. La clave esta en elegir la ruta correcta segun tu etapa."
        />

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Automatizacion */}
          <div className="bg-white rounded-2xl border border-brand-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Automatizacion</h3>
            </div>
            <p className="text-gray-600 mb-5">
              Ideal para resolver cuellos de botella puntuales con impacto rapido y menor inversion inicial.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              {["Rapida implementacion (1-4 semanas)", "Impacto puntual y medible", "Menor inversion inicial", "Ideal cuando hay un dolor claro e inmediato"].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-brand-600 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* SaaS */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">SaaS</h3>
            </div>
            <p className="text-gray-600 mb-5">
              Ideal para estandarizar, escalar y gobernar procesos de forma integral en el largo plazo.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              {["Plataforma integral para un area de negocio", "Escalabilidad con usuarios y roles", "Mayor control y trazabilidad", "Ideal cuando el proceso ya esta validado"].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-gray-500 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Ruta recomendada */}
        <div className="bg-brand-700 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-medium text-blue-200 mb-1">Ruta recomendada JAAGSOLUTIONS</p>
            <div className="flex items-center gap-3 text-lg font-bold flex-wrap">
              <span>Automatizacion</span>
              <span className="text-blue-300">→</span>
              <span>Medicion</span>
              <span className="text-blue-300">→</span>
              <span>Escalado SaaS</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <CTAButton href="#contacto" variant="primary">
            Solicitar diagnostico
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Implementar `ContactFormSection.tsx`**

```tsx
import { useForm } from "react-hook-form";
import SectionHeader from "../components/SectionHeader.tsx";
import CTAButton from "../components/CTAButton.tsx";

type FormData = {
  nombre: string;
  empresa: string;
  cargo: string;
  email: string;
  whatsapp: string;
  sector: string;
  rango: string;
  proceso: string;
};

const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID as string | undefined;

export default function ContactFormSection() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>();

  const [submitError, setSubmitError] = useState(false);

  async function onSubmit(data: FormData) {
    setSubmitError(false);
    try {
      if (FORMSPREE_ID) {
        const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("form error");
      }

      // Track conversion event if GA is configured
      const gaId = import.meta.env.VITE_GA_ID as string | undefined;
      if (gaId && typeof window !== "undefined" && "gtag" in window) {
        (window as { gtag: (...args: unknown[]) => void }).gtag("event", "form_submit", {
          event_category: "conversion",
          event_label: "diagnostico",
        });
      }

      reset();
    } catch {
      setSubmitError(true);
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm";
  const errorClass = "mt-1 text-xs text-red-500";

  return (
    <section id="contacto" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left — copy */}
          <div>
            <SectionHeader
              title="Solicita tu diagnostico empresarial"
              subtitle="Cuentanos tu proceso actual y te proponemos una ruta clara de implementacion."
            />
            <div className="space-y-4 mt-8">
              {[
                { icon: "⏱", text: "Respuesta en menos de 24 horas" },
                { icon: "🎯", text: "Diagnostico sin costo ni compromiso" },
                { icon: "🔒", text: "Tus datos solo se usan para contactarte" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-gray-700">
                  <span className="text-2xl">{icon}</span>
                  <span className="text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
            {isSubmitSuccessful ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Solicitud recibida</h3>
                <p className="text-gray-600">Gracias. Recibimos tu solicitud y te contactaremos en breve.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      {...register("nombre", { required: "Campo obligatorio" })}
                      placeholder="Nombre completo *"
                      className={inputClass}
                    />
                    {errors.nombre && <p className={errorClass}>{errors.nombre.message}</p>}
                  </div>
                  <div>
                    <input
                      {...register("empresa", { required: "Campo obligatorio" })}
                      placeholder="Empresa *"
                      className={inputClass}
                    />
                    {errors.empresa && <p className={errorClass}>{errors.empresa.message}</p>}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    {...register("cargo")}
                    placeholder="Cargo"
                    className={inputClass}
                  />
                  <div>
                    <input
                      {...register("email", {
                        required: "Campo obligatorio",
                        pattern: { value: /^\S+@\S+\.\S+$/, message: "Email invalido" },
                      })}
                      type="email"
                      placeholder="Email corporativo *"
                      className={inputClass}
                    />
                    {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    {...register("whatsapp")}
                    placeholder="WhatsApp"
                    className={inputClass}
                  />
                  <input
                    {...register("sector")}
                    placeholder="Sector de la empresa"
                    className={inputClass}
                  />
                </div>
                <select {...register("rango")} className={inputClass}>
                  <option value="">Rango de inversion (opcional)</option>
                  <option value="menos-1k">Menos de $1,000 USD</option>
                  <option value="1k-5k">$1,000 – $5,000 USD</option>
                  <option value="5k-15k">$5,000 – $15,000 USD</option>
                  <option value="mas-15k">Mas de $15,000 USD</option>
                </select>
                <div>
                  <textarea
                    {...register("proceso", { required: "Campo obligatorio" })}
                    placeholder="Describe brevemente el proceso que quieres mejorar *"
                    rows={4}
                    className={inputClass}
                  />
                  {errors.proceso && <p className={errorClass}>{errors.proceso.message}</p>}
                </div>

                {submitError && (
                  <p className="text-sm text-red-600">
                    Ocurrio un problema al enviar. Intenta nuevamente o escribenos por WhatsApp.
                  </p>
                )}

                <CTAButton type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : "Enviar solicitud"}
                </CTAButton>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
```

Nota: necesitas agregar `useState` al import de React en este archivo. Actualiza la primera linea:

```tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
```

- [ ] **Step 3: Actualizar `CTAButton.tsx` para aceptar prop `disabled`**

El CTAButton del Task 1 necesita el prop `disabled`. Actualiza la parte del button:

```tsx
type CTAButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "text";
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
};

// ... en el return del button:
<button
  type={type}
  onClick={onClick}
  disabled={disabled}
  className={`${classes} disabled:opacity-60 disabled:cursor-not-allowed`}
>
  {children}
</button>
```

- [ ] **Step 4: Verificar en browser**

Llenar el formulario con datos de prueba y hacer submit. Si no tienes VITE_FORMSPREE_ID configurado, el formulario igual mostrara el estado de exito (el fetch se saltea). Verificar estado de exito visible, validaciones de campos obligatorios, y mensajes de error en campos invalidos.

- [ ] **Step 5: Commit**

```bash
git add jaagsolutions-web/src/sections/ComparisonSection.tsx jaagsolutions-web/src/sections/ContactFormSection.tsx jaagsolutions-web/src/components/CTAButton.tsx
git commit -m "feat(jaagsolutions-web): implement ComparisonSection and ContactFormSection with form validation"
```

---

### Task 6: FaqSection, FinalCtaSection y FooterSection

**Files:**
- Modify: `jaagsolutions-web/src/sections/FaqSection.tsx`
- Modify: `jaagsolutions-web/src/sections/FinalCtaSection.tsx`
- Modify: `jaagsolutions-web/src/sections/FooterSection.tsx`

- [ ] **Step 1: Implementar `FaqSection.tsx`**

```tsx
import SectionHeader from "../components/SectionHeader.tsx";
import FaqItem from "../components/FaqItem.tsx";

const faqs = [
  {
    question: "En cuanto tiempo se implementa una solucion?",
    answer: "Depende del alcance, pero un MVP de automatizacion suele estar entre 1 y 4 semanas. Los proyectos SaaS tienen un ciclo mas largo dependiendo del numero de modulos.",
  },
  {
    question: "Pueden trabajar con nuestras herramientas actuales?",
    answer: "Si. Priorizamos integraciones con tu stack para acelerar adopcion y reducir friccion. Evaluamos tu entorno en la sesion de diagnostico.",
  },
  {
    question: "Como se decide entre Automatizacion y SaaS?",
    answer: "Evaluamos tu etapa y objetivo. Normalmente iniciamos con automatizacion de alto impacto y escalamos a SaaS cuando hay validacion de retorno e impacto operativo.",
  },
  {
    question: "Ofrecen soporte despues de la implementacion?",
    answer: "Si. Incluimos acompanamiento, ajustes y evolucion de la solucion segun resultados. El nivel de soporte depende del paquete contratado.",
  },
];

export default function FaqSection() {
  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Preguntas frecuentes" />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-200 px-6">
          {faqs.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Implementar `FinalCtaSection.tsx`**

```tsx
import CTAButton from "../components/CTAButton.tsx";

export default function FinalCtaSection() {
  return (
    <section className="py-20 bg-brand-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
          Convierte procesos manuales en crecimiento sostenible.
        </h2>
        <p className="text-lg text-blue-200 mb-10 max-w-2xl mx-auto">
          JAAGSOLUTIONS combina estrategia, automatizacion y desarrollo SaaS para ayudarte a operar mejor hoy y escalar con control manana.
        </p>
        <CTAButton
          href="#contacto"
          variant="primary"
          className="bg-white text-brand-700 hover:bg-gray-100 text-base px-10 py-4"
        >
          Hablar con un especialista
        </CTAButton>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Implementar `FooterSection.tsx`**

```tsx
const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Proceso", href: "#proceso" },
  { label: "Casos de uso", href: "#casos" },
  { label: "Contacto", href: "#contacto" },
];

const legalLinks = [
  { label: "Politica de privacidad", href: "#" },
  { label: "Terminos y condiciones", href: "#" },
];

export default function FooterSection() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          {/* Brand */}
          <div>
            <p className="text-white font-bold text-lg mb-2">
              JAAG<span className="text-brand-400">SOLUTIONS</span>
            </p>
            <p className="text-sm">Automatizacion y SaaS para PYMEs.</p>
          </div>

          {/* Nav */}
          <nav className="flex flex-wrap gap-x-8 gap-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div>
            <a
              href="#contacto"
              className="inline-flex items-center gap-2 bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-700 transition-colors"
            >
              Solicitar diagnostico
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between gap-4 text-sm">
          <p>© {new Date().getFullYear()} JAAGSOLUTIONS. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            {legalLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-white transition-colors">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Verificar la landing completa en browser**

Navegar http://localhost:5173 de arriba a abajo. Verificar:
- Nav funciona y hace scroll suave a cada seccion
- FAQ accordion abre y cierra correctamente
- FinalCTA tiene fondo azul oscuro y boton prominente
- Footer con links de navegacion y legal

- [ ] **Step 5: Commit**

```bash
git add jaagsolutions-web/src/sections/FaqSection.tsx jaagsolutions-web/src/sections/FinalCtaSection.tsx jaagsolutions-web/src/sections/FooterSection.tsx
git commit -m "feat(jaagsolutions-web): implement FaqSection, FinalCtaSection, and FooterSection — landing complete"
```

---

### Task 7: Typecheck, build y verificacion final

**Files:** ninguno nuevo

- [ ] **Step 1: Typecheck completo**

```bash
cd jaagsolutions-web
pnpm typecheck
```

Resultado esperado: sin errores de TypeScript.

Si hay errores, corregirlos antes de continuar.

- [ ] **Step 2: Build de produccion**

```bash
cd jaagsolutions-web
pnpm build
```

Resultado esperado:
```
vite v6.x.x building for production...
✓ XX modules transformed.
dist/index.html        X.XX kB
dist/assets/index-xxx.css   XX.X kB
dist/assets/index-xxx.js   XXX.X kB
✓ built in X.XXs
```

- [ ] **Step 3: Preview del build**

```bash
cd jaagsolutions-web
pnpm preview
```

Abrir http://localhost:4173. Verificar que el build funciona identico al dev.

- [ ] **Step 4: Checklist de aceptacion**

Verificar manualmente en http://localhost:4173:

- [ ] Navegacion por anclas funciona en desktop y mobile
- [ ] Hero con gradiente azul y dos CTAs visibles
- [ ] Benefits: 4 cards en grid
- [ ] Services: 2 pilares simetricos
- [ ] Process: 3 pasos numerados
- [ ] UseCases: 4 casos en grid 2x2
- [ ] Comparison: 2 columnas + franja de ruta recomendada
- [ ] Form: valida campos obligatorios, submit muestra estado de exito
- [ ] FAQ: accordion abre/cierra
- [ ] FinalCTA + Footer visibles
- [ ] En mobile (viewport 375px): no hay scroll horizontal, menu hamburguesa funciona

- [ ] **Step 5: Commit final**

```bash
git add jaagsolutions-web/
git commit -m "feat(jaagsolutions-web): verified build and production-ready landing"
```

---

### Task 8: Configuracion de Vercel (instrucciones)

**Files:** ninguno — configuracion en dashboard de Vercel

- [ ] **Step 1: Crear cuenta en Formspree**

Ir a https://formspree.io → crear formulario nuevo → copiar el ID (formato `xxxxxxxx`).

- [ ] **Step 2: Conectar el repo a Vercel**

1. Ir a https://vercel.com → New Project
2. Importar el repositorio de Paperclip desde GitHub/GitLab
3. En "Configure Project":
   - **Root Directory:** `jaagsolutions-web`
   - **Framework Preset:** Vite
   - **Build Command:** `pnpm build`
   - **Output Directory:** `dist`
   - **Install Command:** `pnpm install`
4. En "Environment Variables", agregar:
   - `VITE_FORMSPREE_ID` = ID copiado de Formspree
   - `VITE_GA_ID` = ID de Google Analytics (opcional, dejar vacio si no se usa)
5. Hacer Deploy.

- [ ] **Step 3: Verificar deploy**

Abrir la URL asignada por Vercel. Repetir el checklist del Task 7 Step 4 en la URL publica.

Enviar un formulario de prueba real y verificar que llega al panel de Formspree.

- [ ] **Step 4: Prueba de conversion en produccion**

Llenar el formulario en produccion con:
- Nombre: Test JAAGSOLUTIONS
- Empresa: Empresa Prueba
- Email: tu email real
- Proceso: "Prueba de integracion del formulario"

Verificar que el email llega a Formspree dentro de los 5 minutos.
