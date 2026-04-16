# JAAGSOLUTIONS Landing Visual Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the jaagsolutions-web landing page with professional SVG icons, animated counters, an improved comparison table, smooth FAQ accordion, aurora Hero background, a pricing toggle, and glassmorphism testimonial cards.

**Architecture:** Additive approach — each section modified in-place. One new hook (`useCountUp`), one new npm dep (`lucide-react`). Packages A/B/C can be dispatched as parallel subagents (Tasks 1–6 = A, Tasks 7–8 = B, Tasks 9–12 = C), then a final typecheck + build in Task 13.

**Tech Stack:** React 18 · Vite 6 · TypeScript 5 · Tailwind CSS 3 · lucide-react · existing useScrollReveal hook

**Working directory for all tasks:** `c:/Users/jalva/Documents/PaperClipAI/paperclip/.worktrees/jaagsolutions/jaagsolutions-web`

**TypeScript check command:** `node_modules/.bin/tsc.CMD --noEmit`

**Note:** This is a frontend landing page — no unit tests exist. Verification = TypeScript passes + visual review in browser (`corepack pnpm dev`).

---

## Task 1: Install lucide-react + create useCountUp hook

**Files:**
- Modify: `package.json` (add lucide-react)
- Create: `src/hooks/useCountUp.ts`

- [ ] **Step 1: Install lucide-react**

From `jaagsolutions-web/` directory:
```bash
corepack pnpm add lucide-react
```
Expected: lucide-react added to dependencies in package.json, no errors.

- [ ] **Step 2: Create `src/hooks/useCountUp.ts`**

```typescript
import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from 0 to `target` when the returned ref element
 * enters the viewport. Uses IntersectionObserver + rAF loop.
 */
export function useCountUp(target: number, duration = 1000) {
  const ref = useRef<HTMLElement | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          setCount(Math.floor(progress * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { ref, count };
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
node_modules/.bin/tsc.CMD --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useCountUp.ts package.json pnpm-lock.yaml
git commit -m "feat(visual-a): install lucide-react and add useCountUp hook"
```

---

## Task 2: StatsSection — Lucide icons + animated counters

**Files:**
- Modify: `src/sections/StatsSection.tsx`

- [ ] **Step 1: Replace StatsSection with this full file**

```tsx
import { Zap, TrendingDown, Bot, TrendingUp } from "lucide-react";
import { useCountUp } from "../hooks/useCountUp.ts";

function AnimatedStat({
  target,
  prefix = "",
  suffix = "",
  label,
  icon: Icon,
  iconColor,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  label: string;
  icon: React.ElementType;
  iconColor: string;
}) {
  const { ref, count } = useCountUp(target);
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="flex items-center gap-4 px-6 py-6"
    >
      <Icon className={`w-6 h-6 flex-shrink-0 ${iconColor}`} />
      <div>
        <div className="text-2xl font-extrabold text-white leading-none">
          {prefix}
          {count}
          <span className="text-brand-400 text-xl">{suffix}</span>
        </div>
        <div className="text-xs text-blue-300/70 mt-1 leading-tight">{label}</div>
      </div>
    </div>
  );
}

function StaticStat({
  value,
  label,
  icon: Icon,
  iconColor,
}: {
  value: string;
  label: string;
  icon: React.ElementType;
  iconColor: string;
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-6">
      <Icon className={`w-6 h-6 flex-shrink-0 ${iconColor}`} />
      <div>
        <div className="text-2xl font-extrabold text-white leading-none">{value}</div>
        <div className="text-xs text-blue-300/70 mt-1 leading-tight">{label}</div>
      </div>
    </div>
  );
}

export default function StatsSection() {
  return (
    <div className="bg-brand-900 border-y border-brand-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-brand-700/50 divide-y lg:divide-y-0">
          <StaticStat
            value="1–4 sem"
            label="de implementación MVP"
            icon={Zap}
            iconColor="text-brand-400"
          />
          <AnimatedStat
            target={60}
            prefix="−"
            suffix="%"
            label="reducción de tareas manuales"
            icon={TrendingDown}
            iconColor="text-green-400"
          />
          <StaticStat
            value="24/7"
            label="operación sin intervención"
            icon={Bot}
            iconColor="text-violet-400"
          />
          <AnimatedStat
            target={40}
            prefix="+"
            suffix="%"
            label="productividad del equipo"
            icon={TrendingUp}
            iconColor="text-blue-400"
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
node_modules/.bin/tsc.CMD --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/sections/StatsSection.tsx
git commit -m "feat(visual-a): StatsSection — Lucide icons and animated count-up"
```

---

## Task 3: ToolsSection — bordered cards with category icons

**Files:**
- Modify: `src/sections/ToolsSection.tsx`

- [ ] **Step 1: Replace ToolsSection with this full file**

```tsx
import { Workflow, Database, MessageCircle, Brain, GitBranch } from "lucide-react";

type Tool = {
  name: string;
  desc: string;
  accentClass: string;
  CategoryIcon: React.ElementType;
  iconColor: string;
};

const tools: Tool[] = [
  { name: "n8n", desc: "Automatización", accentClass: "border-l-orange-400", CategoryIcon: Workflow, iconColor: "text-orange-300" },
  { name: "Make", desc: "Workflows", accentClass: "border-l-violet-400", CategoryIcon: GitBranch, iconColor: "text-violet-300" },
  { name: "Zapier", desc: "Integraciones", accentClass: "border-l-brand-400", CategoryIcon: Workflow, iconColor: "text-brand-400" },
  { name: "Notion", desc: "Gestión", accentClass: "border-l-gray-400", CategoryIcon: Database, iconColor: "text-gray-400" },
  { name: "Airtable", desc: "Base de datos", accentClass: "border-l-teal-400", CategoryIcon: Database, iconColor: "text-teal-400" },
  { name: "WhatsApp API", desc: "Mensajería", accentClass: "border-l-green-400", CategoryIcon: MessageCircle, iconColor: "text-green-400" },
  { name: "OpenAI", desc: "IA generativa", accentClass: "border-l-emerald-400", CategoryIcon: Brain, iconColor: "text-emerald-400" },
  { name: "Supabase", desc: "Backend", accentClass: "border-l-green-500", CategoryIcon: Database, iconColor: "text-green-500" },
];

export default function ToolsSection() {
  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-10">
          Tecnologías y herramientas que utilizamos
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {tools.map((t) => (
            <div
              key={t.name}
              className={`card-hover flex flex-col gap-2 p-3 rounded-xl border border-gray-100 bg-white border-l-4 ${t.accentClass} group cursor-default`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-700 leading-tight">{t.name}</p>
                <t.CategoryIcon className={`w-3.5 h-3.5 ${t.iconColor} opacity-60 flex-shrink-0`} />
              </div>
              <p className="text-xs text-gray-400">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
node_modules/.bin/tsc.CMD --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/sections/ToolsSection.tsx
git commit -m "feat(visual-a): ToolsSection — bordered cards with Lucide category icons"
```

---

## Task 4: ServicesSection — Lucide icons in service lists

**Files:**
- Modify: `src/sections/ServicesSection.tsx`

- [ ] **Step 1: Replace ServicesSection with this full file**

```tsx
import { CheckCircle2, Zap, Monitor } from "lucide-react";
import CTAButton from "../components/CTAButton.tsx";

const pillarA = [
  "Captación, calificación y seguimiento de leads",
  "Cotización, aprobación y cierre comercial",
  "Tickets de soporte y SLA",
  "Automatización documental (facturas, contratos)",
  "Cobranza automatizada y alertas de cartera",
];

const pillarB = [
  "SaaS comercial (pipeline, seguimiento, reportes)",
  "SaaS operativo (tareas, aprobaciones, flujos)",
  "SaaS de soporte (tickets, base de conocimiento)",
  "SaaS financiero ligero (facturación, cobranza)",
  "Módulos a medida según proceso y madurez",
];

export default function ServicesSection() {
  return (
    <section id="servicios" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <span className="inline-block mb-3 px-4 py-1 text-xs font-bold tracking-widest uppercase text-brand-600 bg-brand-50 rounded-full border border-brand-100">
            Servicios
          </span>
          <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-4">
            Automatización + SaaS:{" "}
            <span className="gradient-text">dos líneas, un objetivo</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Se complementan según la etapa y madurez de tu empresa. Empezamos donde más duele y escalamos con control.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Pilar A — Automatización */}
          <div className="card-hover animate-fade-in-up-d1 bg-brand-900 text-white rounded-2xl overflow-hidden shadow-lg">
            <div className="bg-dot-pattern px-8 pt-8 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-bold text-brand-200 uppercase tracking-widest">Línea A</span>
              </div>
              <h3 className="text-2xl font-extrabold mb-2">Automatización de Procesos</h3>
              <p className="text-brand-200 text-sm leading-relaxed">
                Implementamos flujos que eliminan fricción, aceleran operaciones y reducen errores humanos.
              </p>
            </div>
            <ul className="px-8 py-6 space-y-3">
              {pillarA.map((text) => (
                <li key={text} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-blue-100 leading-snug">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pilar B — SaaS */}
          <div className="card-hover animate-fade-in-up-d2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-8 pt-8 pb-6 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Línea B</span>
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Desarrollo SaaS para PYMEs</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Construimos plataformas SaaS para gobernar áreas clave del negocio con trazabilidad y escalabilidad.
              </p>
            </div>
            <ul className="px-8 py-6 space-y-3">
              {pillarB.map((text) => (
                <li key={text} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 leading-snug">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <CTAButton href="#contacto" variant="primary">
            Hablar con un especialista →
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
node_modules/.bin/tsc.CMD --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/sections/ServicesSection.tsx
git commit -m "feat(visual-a): ServicesSection — CheckCircle2 and Lucide header icons"
```

---

## Task 5: ProcessSection — Lucide phase icons + animated connector

**Files:**
- Modify: `src/sections/ProcessSection.tsx`
- Modify: `src/index.css` (add connector animation)

- [ ] **Step 1: Add connector animation to `src/index.css`**

Append inside the `@layer utilities` block (before the closing `}`):

```css
  .animate-connector {
    animation: connectorGrow 1.2s ease-out 0.3s both;
    transform-origin: left center;
  }
```

Then append at the bottom of the file (after the existing `@keyframes float`):

```css
@keyframes connectorGrow {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
```

- [ ] **Step 2: Replace ProcessSection with this full file**

```tsx
import { Search, Code2, Rocket } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal.ts";
import CTAButton from "../components/CTAButton.tsx";

const steps = [
  {
    number: "01",
    Icon: Search,
    title: "Analizamos",
    text: "Entendemos tu operación, detectamos cuellos de botella y priorizamos procesos de alto impacto.",
    tags: ["Entrevistas", "Mapeo de flujos", "Diagnóstico"],
    color: "from-brand-600 to-brand-700",
    iconBg: "bg-brand-600",
  },
  {
    number: "02",
    Icon: Code2,
    title: "Implementamos",
    text: "Diseñamos y desplegamos la solución adaptada a tus herramientas, con foco en adopción real.",
    tags: ["Prototipo rápido", "Integración", "QA"],
    color: "from-violet-600 to-purple-700",
    iconBg: "bg-violet-600",
  },
  {
    number: "03",
    Icon: Rocket,
    title: "Optimizamos",
    text: "Medimos resultados, ajustamos flujos y acompañamos la mejora continua con métricas claras.",
    tags: ["KPIs", "Iteraciones", "Soporte"],
    color: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-500",
  },
];

export default function ProcessSection() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      id="proceso"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-24 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <span className="inline-block mb-3 px-4 py-1 text-xs font-bold tracking-widest uppercase text-brand-600 bg-brand-50 rounded-full border border-brand-100">
            Nuestro método
          </span>
          <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-4">
            Simple, ágil y{" "}
            <span className="gradient-text">orientado a resultados</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Tres pasos que llevamos a la práctica en cada proyecto, sin importar el tamaño de tu empresa.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid md:grid-cols-3 gap-8 mb-12">
          {/* Animated connector line (desktop) */}
          <div
            className={`hidden md:block absolute top-16 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-0.5 bg-gradient-to-r from-brand-200 via-violet-200 to-emerald-200 z-0 ${visible ? "animate-connector" : "scale-x-0"}`}
          />

          {steps.map((step, i) => (
            <div
              key={step.number}
              style={{ transitionDelay: `${i * 120}ms` }}
              className={`card-hover transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} relative z-10 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden`}
            >
              {/* Colored top bar */}
              <div className={`h-1.5 bg-gradient-to-r ${step.color}`} />

              <div className="p-7">
                {/* Number badge + icon */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-md`}>
                    <step.Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-extrabold text-gray-300 tracking-widest">{step.number}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm mb-5">{step.text}</p>

                <div className="flex flex-wrap gap-2">
                  {step.tags.map((tag) => (
                    <span key={tag} className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <CTAButton href="#contacto" variant="secondary">
            Conocer nuestro método →
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
node_modules/.bin/tsc.CMD --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/sections/ProcessSection.tsx src/index.css
git commit -m "feat(visual-a+b): ProcessSection — Lucide icons and animated connector"
```

---

## Task 6: FinalCtaSection — Lucide trust icons

**Files:**
- Modify: `src/sections/FinalCtaSection.tsx`

- [ ] **Step 1: Replace trust row section in FinalCtaSection**

Full file replacement:

```tsx
import { Zap, Target, ShieldCheck } from "lucide-react";

export default function FinalCtaSection() {
  return (
    <section className="relative py-28 bg-brand-900 text-white overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600 opacity-20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-600 opacity-15 blur-[90px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-dot-pattern opacity-40" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          ¿Listo para automatizar?
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
          Convierte fricción en{" "}
          <span className="gradient-text">crecimiento sostenible.</span>
        </h2>

        <p className="text-xl text-blue-200 mb-12 max-w-2xl mx-auto leading-relaxed">
          Combinamos estrategia, automatización y SaaS para que operes mejor hoy — y escales con control mañana.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <a
            href="#contacto"
            className="btn-glow inline-flex items-center justify-center gap-2 bg-white text-brand-900 font-bold px-10 py-4 rounded-xl text-base hover:bg-blue-50 transition-colors shadow-xl"
          >
            Hablar con un especialista
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <a
            href="#casos"
            className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-white/10 transition-colors"
          >
            Ver casos de uso
          </a>
        </div>

        {/* Mini trust row — Lucide icons */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-blue-300/70">
          {[
            { Icon: Zap, text: "MVP en 1–4 semanas" },
            { Icon: Target, text: "Diagnóstico sin costo" },
            { Icon: ShieldCheck, text: "Sin compromiso" },
          ].map(({ Icon, text }) => (
            <span key={text} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-blue-400" />
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
node_modules/.bin/tsc.CMD --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/sections/FinalCtaSection.tsx
git commit -m "feat(visual-a): FinalCtaSection — Lucide icons in trust row"
```

---

## Task 7: ComparisonSection — 3-column feature matrix

**Files:**
- Modify: `src/sections/ComparisonSection.tsx`

- [ ] **Step 1: Replace ComparisonSection with this full file**

```tsx
import { CheckCircle2, X, Minus } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal.ts";
import CTAButton from "../components/CTAButton.tsx";

type CellValue = "yes" | "no" | "partial";

const features: {
  label: string;
  jaagsolutions: CellValue;
  solo: CellValue;
  agency: CellValue;
}[] = [
  { label: "Implementación < 4 semanas",        jaagsolutions: "yes", solo: "no",      agency: "no"      },
  { label: "Precio accesible para PYME",         jaagsolutions: "yes", solo: "partial", agency: "no"      },
  { label: "Soporte post-entrega",               jaagsolutions: "yes", solo: "no",      agency: "partial" },
  { label: "Capacitación al equipo",             jaagsolutions: "yes", solo: "no",      agency: "partial" },
  { label: "Automatización + SaaS integrado",    jaagsolutions: "yes", solo: "no",      agency: "no"      },
  { label: "Sin contrato de permanencia",        jaagsolutions: "yes", solo: "yes",     agency: "no"      },
  { label: "Diagnóstico gratuito",               jaagsolutions: "yes", solo: "no",      agency: "no"      },
];

function Cell({ value }: { value: CellValue }) {
  if (value === "yes")     return <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />;
  if (value === "no")      return <X            className="w-5 h-5 text-red-400/60 mx-auto" />;
  return                          <Minus        className="w-5 h-5 text-yellow-500 mx-auto" />;
}

export default function ComparisonSection() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      id="comparativa"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-20 bg-gray-50"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="inline-block mb-3 px-4 py-1 text-xs font-bold tracking-widest uppercase text-brand-600 bg-brand-50 rounded-full border border-brand-100">
            Comparativa
          </span>
          <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-4">
            ¿Por qué{" "}
            <span className="gradient-text">JAAGSOLUTIONS?</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Compara las opciones disponibles para tu PYME y elige con información.
          </p>
        </div>

        {/* Table */}
        <div className={`transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} overflow-hidden rounded-2xl border border-gray-200 shadow-sm`}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-500 bg-gray-50 w-1/2">
                  Característica
                </th>
                <th className="p-4 text-center text-sm font-bold text-white bg-brand-900 w-[calc(50%/3)]">
                  JAAGSOLUTIONS
                </th>
                <th className="p-4 text-center text-xs font-semibold text-gray-500 bg-gray-50 w-[calc(50%/3)]">
                  Hacerlo solo
                </th>
                <th className="p-4 text-center text-xs font-semibold text-gray-500 bg-gray-50 w-[calc(50%/3)]">
                  Agencia grande
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {features.map((f, i) => (
                <tr
                  key={f.label}
                  className={`border-t border-gray-100 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}
                >
                  <td className="p-4 text-sm text-gray-700 font-medium">{f.label}</td>
                  <td className="p-4 bg-brand-50/40">
                    <Cell value={f.jaagsolutions} />
                  </td>
                  <td className="p-4">
                    <Cell value={f.solo} />
                  </td>
                  <td className="p-4">
                    <Cell value={f.agency} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Incluido
          </span>
          <span className="flex items-center gap-1.5">
            <Minus className="w-3.5 h-3.5 text-yellow-500" /> Parcial
          </span>
          <span className="flex items-center gap-1.5">
            <X className="w-3.5 h-3.5 text-red-400/60" /> No disponible
          </span>
        </div>

        {/* Ruta recomendada */}
        <div className="bg-brand-700 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          <div>
            <p className="text-sm font-medium text-blue-200 mb-1">Ruta recomendada JAAGSOLUTIONS</p>
            <div className="flex items-center gap-3 text-lg font-bold flex-wrap">
              <span>Automatización</span>
              <span className="text-blue-300">→</span>
              <span>Medición</span>
              <span className="text-blue-300">→</span>
              <span>Escalado SaaS</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <CTAButton href="#contacto" variant="primary">
            Solicitar diagnóstico
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
node_modules/.bin/tsc.CMD --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/sections/ComparisonSection.tsx
git commit -m "feat(visual-b): ComparisonSection — 3-column feature matrix with Lucide icons"
```

---

## Task 8: FaqItem + FaqSection — smooth accordion + 2 new questions

**Files:**
- Modify: `src/components/FaqItem.tsx`
- Modify: `src/sections/FaqSection.tsx`

- [ ] **Step 1: Replace `src/components/FaqItem.tsx` with this full file**

```tsx
import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";

type FaqItemProps = {
  question: string;
  answer: string;
};

export default function FaqItem({ question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`border-b border-gray-200 last:border-b-0 transition-colors duration-200 ${open ? "bg-brand-50/40" : ""}`}>
      <button
        className="w-full flex justify-between items-center py-5 text-left font-semibold text-gray-900 hover:text-brand-600 transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-brand-500 flex-shrink-0 ml-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        ref={bodyRef}
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{
          maxHeight: open ? `${bodyRef.current?.scrollHeight ?? 300}px` : "0px",
        }}
      >
        <p className="pb-5 text-gray-600 leading-relaxed pr-8">{answer}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `src/sections/FaqSection.tsx` with this full file**

```tsx
import SectionHeader from "../components/SectionHeader.tsx";
import FaqItem from "../components/FaqItem.tsx";

const faqs = [
  {
    question: "¿En cuánto tiempo se implementa una solución?",
    answer:
      "Depende del alcance, pero un MVP de automatización suele estar entre 1 y 4 semanas. Los proyectos SaaS tienen un ciclo más largo dependiendo del número de módulos.",
  },
  {
    question: "¿Pueden trabajar con nuestras herramientas actuales?",
    answer:
      "Sí. Priorizamos integraciones con tu stack para acelerar adopción y reducir fricción. Evaluamos tu entorno en la sesión de diagnóstico.",
  },
  {
    question: "¿Cómo se decide entre Automatización y SaaS?",
    answer:
      "Evaluamos tu etapa y objetivo. Normalmente iniciamos con automatización de alto impacto y escalamos a SaaS cuando hay validación de retorno e impacto operativo.",
  },
  {
    question: "¿Ofrecen soporte después de la implementación?",
    answer:
      "Sí. Incluimos acompañamiento, ajustes y evolución de la solución según resultados. El nivel de soporte depende del paquete contratado.",
  },
  {
    question: "¿Necesito conocimientos técnicos para usar las automatizaciones?",
    answer:
      "No. Entregamos documentación clara y capacitamos al equipo operativo para que puedan gestionar, monitorear y ajustar los flujos de forma autónoma.",
  },
  {
    question: "¿Qué pasa si el proceso cambia después de la implementación?",
    answer:
      "Incluimos ajustes durante el período de soporte. Los flujos están diseñados para ser modificables sin reescribir desde cero, por lo que los cambios menores suelen resolverse en horas.",
  },
];

export default function FaqSection() {
  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Preguntas frecuentes" />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden px-6">
          {faqs.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
node_modules/.bin/tsc.CMD --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/FaqItem.tsx src/sections/FaqSection.tsx
git commit -m "feat(visual-b): FaqItem smooth accordion with ChevronDown, 2 new FAQ items"
```

---

## Task 9: index.css — aurora + gradient-border animations

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace `src/index.css` with this full file**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { scroll-behavior: smooth; }
  body { @apply font-sans text-gray-900 antialiased bg-white; }
}

@layer utilities {
  .animate-fade-in-up          { animation: fadeInUp 0.55s ease-out both; }
  .animate-fade-in-up-d1       { animation: fadeInUp 0.55s ease-out 0.12s both; }
  .animate-fade-in-up-d2       { animation: fadeInUp 0.55s ease-out 0.24s both; }
  .animate-fade-in-up-d3       { animation: fadeInUp 0.55s ease-out 0.36s both; }
  .animate-fade-in-up-d4       { animation: fadeInUp 0.55s ease-out 0.48s both; }

  .animate-float               { animation: float 4s ease-in-out infinite; }
  .animate-float-slow          { animation: float 7s ease-in-out infinite; }

  .animate-aurora-1            { animation: aurora-drift-1 12s ease-in-out infinite; }
  .animate-aurora-2            { animation: aurora-drift-2 16s ease-in-out infinite; }

  .animate-connector {
    animation: connectorGrow 1.2s ease-out 0.3s both;
    transform-origin: left center;
  }

  .animate-gradient-border {
    background: linear-gradient(270deg, #2563eb, #7c3aed, #2563eb);
    background-size: 200% 200%;
    animation: gradient-border-spin 4s ease infinite;
  }

  .card-hover {
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }
  .card-hover:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 42px -10px rgba(37, 99, 235, 0.16);
  }

  .gradient-text {
    background: linear-gradient(120deg, #60a5fa 0%, #a78bfa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .btn-glow {
    box-shadow: 0 0 22px rgba(37, 99, 235, 0.45);
    transition: box-shadow 0.3s ease, transform 0.2s ease;
  }
  .btn-glow:hover {
    box-shadow: 0 0 36px rgba(37, 99, 235, 0.7);
    transform: translateY(-2px);
  }

  .bg-dot-pattern {
    background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
    background-size: 28px 28px;
  }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-12px); }
}

@keyframes aurora-drift-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%       { transform: translate(60px, -40px) scale(1.15); }
}

@keyframes aurora-drift-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%       { transform: translate(-50px, 30px) scale(1.1); }
}

@keyframes connectorGrow {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}

@keyframes gradient-border-spin {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
node_modules/.bin/tsc.CMD --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat(visual-c): index.css — aurora, connector, and gradient-border animations"
```

---

## Task 10: HeroSection — aurora background orbs

**Files:**
- Modify: `src/sections/HeroSection.tsx`

- [ ] **Step 1: Add 2 aurora orbs to the decorative background in HeroSection**

In `src/sections/HeroSection.tsx`, find the decorative background block (lines 6–12 in the current file). It currently has 2 orbs and a separator line. Add 2 more orbs with aurora animation classes **after** the existing violet orb and before the separator line:

```tsx
      {/* Glow orb top-left */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-brand-600 opacity-20 blur-[120px] pointer-events-none" />
      {/* Glow orb bottom-right */}
      <div className="absolute -bottom-32 -right-20 w-[500px] h-[500px] rounded-full bg-violet-600 opacity-15 blur-[100px] pointer-events-none" />
      {/* Aurora orb 1 — drifts slowly */}
      <div className="absolute top-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-brand-500 opacity-10 blur-[100px] pointer-events-none animate-aurora-1" />
      {/* Aurora orb 2 — drifts slowly */}
      <div className="absolute bottom-1/3 left-1/4 w-[350px] h-[350px] rounded-full bg-violet-500 opacity-10 blur-[90px] pointer-events-none animate-aurora-2" />
      {/* Horizontal separator glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
```

- [ ] **Step 2: Verify TypeScript**

```bash
node_modules/.bin/tsc.CMD --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/sections/HeroSection.tsx
git commit -m "feat(visual-c): HeroSection — aurora drift orbs in background"
```

---

## Task 11: PricingSection — monthly/annual toggle + enhanced featured card

**Files:**
- Modify: `src/sections/PricingSection.tsx`

- [ ] **Step 1: Replace PricingSection with this full file**

```tsx
import { useState } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal.ts";

type BillingCycle = "monthly" | "annual";

const plans = [
  {
    name: "Starter",
    tagline: "Para negocios que quieren empezar a automatizar",
    priceMonthly: "Desde $499",
    priceAnnual: "Desde $399",
    period: "/ proyecto",
    highlight: false,
    color: "border-white/10",
    badge: null,
    features: [
      "1 flujo de automatización",
      "Integración con 2 herramientas",
      "Documentación del proceso",
      "Soporte por 30 días",
      "Entrega en 1–2 semanas",
    ],
    missing: [
      "Dashboard de monitoreo",
      "Automatizaciones ilimitadas",
      "Soporte prioritario",
    ],
    cta: "Solicitar diagnóstico",
    ctaStyle: "border border-white/30 text-white hover:bg-white/10",
  },
  {
    name: "Growth",
    tagline: "El paquete más popular para PYMEs en crecimiento",
    priceMonthly: "Desde $1,299",
    priceAnnual: "Desde $1,039",
    period: "/ proyecto",
    highlight: true,
    color: "border-brand-500",
    badge: "Más popular",
    features: [
      "Hasta 4 flujos de automatización",
      "Integración con herramientas ilimitadas",
      "Dashboard de monitoreo básico",
      "Documentación + capacitación al equipo",
      "Soporte por 60 días",
      "Entrega en 2–3 semanas",
    ],
    missing: ["SaaS personalizado"],
    cta: "Hablar con un especialista",
    ctaStyle: "bg-white text-brand-900 hover:bg-blue-50 btn-glow",
  },
  {
    name: "Scale",
    tagline: "Solución completa con SaaS a medida",
    priceMonthly: "Personalizado",
    priceAnnual: "Personalizado",
    period: "",
    highlight: false,
    color: "border-violet-500/40",
    badge: null,
    features: [
      "Automatizaciones ilimitadas",
      "Desarrollo SaaS personalizado",
      "Dashboard avanzado con reportes",
      "Capacitación completa al equipo",
      "Soporte dedicado 6 meses",
      "Entrega en 3–6 semanas",
      "Consultoría estratégica incluida",
    ],
    missing: [],
    cta: "Cotizar solución",
    ctaStyle: "border border-violet-400/50 text-violet-300 hover:bg-violet-500/10",
  },
];

export default function PricingSection() {
  const { ref, visible } = useScrollReveal();
  const [billing, setBilling] = useState<BillingCycle>("monthly");

  return (
    <section
      id="precios"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-24 bg-brand-900 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-dot-pattern opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-700 opacity-10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-10 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="inline-block mb-3 px-4 py-1 text-xs font-bold tracking-widest uppercase text-brand-400 bg-brand-800 rounded-full border border-brand-700">
            Planes y precios
          </span>
          <h2 className="text-4xl font-extrabold text-white mt-2 mb-4">
            Inversión clara,{" "}
            <span className="gradient-text">resultados medibles</span>
          </h2>
          <p className="text-blue-200/70 max-w-xl mx-auto">
            Sin costos ocultos. Sin contratos largos. Empezamos con un diagnóstico gratuito.
          </p>
        </div>

        {/* Billing toggle */}
        <div className={`flex items-center justify-center gap-3 mb-10 transition-all duration-700 delay-100 ${visible ? "opacity-100" : "opacity-0"}`}>
          <button
            onClick={() => setBilling("monthly")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${billing === "monthly" ? "bg-white text-brand-900 shadow" : "text-blue-300 hover:text-white"}`}
          >
            Mensual
          </button>
          <div
            className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer border border-white/20"
            onClick={() => setBilling(billing === "monthly" ? "annual" : "monthly")}
            role="switch"
            aria-checked={billing === "annual"}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-brand-400 rounded-full transition-all duration-200 ${billing === "annual" ? "left-7" : "left-1"}`}
            />
          </div>
          <button
            onClick={() => setBilling("annual")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${billing === "annual" ? "bg-white text-brand-900 shadow" : "text-blue-300 hover:text-white"}`}
          >
            Anual
          </button>
          {billing === "annual" && (
            <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2.5 py-1 rounded-full border border-green-500/30 animate-fade-in-up">
              Ahorra 20%
            </span>
          )}
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              style={{
                transitionDelay: `${i * 120}ms`,
                boxShadow: plan.highlight
                  ? "0 0 60px rgba(37,99,235,0.35), 0 0 0 1px rgba(99,102,241,0.3)"
                  : undefined,
              }}
              className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} relative flex flex-col rounded-2xl border ${plan.color} ${plan.highlight ? "bg-brand-800/80 backdrop-blur-sm" : "bg-white/5"} p-7`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-blue-300/70 text-sm mb-4">{plan.tagline}</p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-extrabold text-white transition-opacity duration-200">
                    {billing === "monthly" ? plan.priceMonthly : plan.priceAnnual}
                  </span>
                  {plan.period && (
                    <span className="text-blue-300/60 text-sm mb-1">{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-blue-100">
                    <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
                {plan.missing.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/30">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#contacto"
                className={`inline-flex items-center justify-center gap-2 font-bold px-6 py-3 rounded-xl text-sm transition-colors ${plan.ctaStyle}`}
              >
                {plan.cta}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          ))}
        </div>

        <p className={`text-center text-sm text-blue-300/50 mt-10 transition-all duration-700 delay-500 ${visible ? "opacity-100" : "opacity-0"}`}>
          Todos los proyectos incluyen diagnóstico gratuito · Sin contratos de permanencia · Garantía de satisfacción
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
node_modules/.bin/tsc.CMD --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/sections/PricingSection.tsx
git commit -m "feat(visual-c): PricingSection — monthly/annual toggle and enhanced featured card"
```

---

## Task 12: TestimonialsSection — glassmorphism cards + client logo strip

**Files:**
- Modify: `src/sections/TestimonialsSection.tsx`

- [ ] **Step 1: Replace TestimonialsSection with this full file**

```tsx
import { useScrollReveal } from "../hooks/useScrollReveal.ts";

const testimonials = [
  {
    quote:
      "En menos de 3 semanas automatizamos el seguimiento de leads y duplicamos nuestra tasa de contacto. El equipo de JAAGSOLUTIONS entendió nuestro proceso desde el primer día.",
    name: "Carlos Mendoza",
    role: "Director Comercial",
    company: "Inmobiliaria Cenit",
    avatar: "CM",
    color: "from-blue-500 to-brand-600",
  },
  {
    quote:
      "Teníamos a 2 personas dedicadas 4 horas diarias a conciliar facturas. Hoy ese proceso corre solo. Fue la mejor inversión operativa que hemos hecho este año.",
    name: "Laura Espinoza",
    role: "CFO",
    company: "Distribuidora Apex",
    avatar: "LE",
    color: "from-violet-500 to-purple-600",
  },
  {
    quote:
      "Lo que más valoro es que no solo implementaron la automatización — nos enseñaron a operar con ella. Ahora el equipo es autónomo y yo tengo visibilidad total del proceso.",
    name: "Andrés Torres",
    role: "Gerente de Operaciones",
    company: "LogiTech MX",
    avatar: "AT",
    color: "from-emerald-500 to-teal-600",
  },
];

const clientLogos = [
  "Inmobiliaria Cenit",
  "Distribuidora Apex",
  "LogiTech MX",
  "Retail Pro",
  "Servicios Delta",
];

export default function TestimonialsSection() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="py-24 bg-brand-900 relative overflow-hidden"
    >
      {/* Decorative */}
      <div className="absolute inset-0 bg-dot-pattern opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-48 bg-brand-600 opacity-10 blur-[80px] pointer-events-none rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-10 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="inline-block mb-3 px-4 py-1 text-xs font-bold tracking-widest uppercase text-brand-400 bg-brand-800 rounded-full border border-brand-700">
            Resultados reales
          </span>
          <h2 className="text-4xl font-extrabold text-white mt-2 mb-4">
            Lo que dicen nuestros{" "}
            <span className="gradient-text">clientes</span>
          </h2>
        </div>

        {/* Client logo strip */}
        <div className={`mb-12 transition-all duration-700 delay-150 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <p className="text-center text-xs font-bold text-blue-300/40 uppercase tracking-widest mb-5">
            Empresas que confían en nosotros
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {clientLogos.map((name) => (
              <span
                key={name}
                className="bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-sm text-blue-200/70 font-medium"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              style={{ transitionDelay: `${i * 120}ms` }}
              className={`card-hover transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} relative bg-white/8 border border-white/15 rounded-2xl p-7 backdrop-blur-md flex flex-col gap-5`}
            >
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

              {/* Stars */}
              <div className="flex gap-1 relative">
                {Array.from({ length: 5 }).map((_, si) => (
                  <svg key={si} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-blue-100 leading-relaxed text-sm flex-1 relative">
                "{t.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10 relative">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-blue-300/70 text-xs">
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof bar */}
        <div
          className={`mt-14 flex flex-col sm:flex-row items-center justify-center gap-8 text-center transition-all duration-700 delay-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          {[
            { value: "100%", label: "clientes satisfechos" },
            { value: "+50", label: "flujos implementados" },
            { value: "< 4 sem", label: "tiempo promedio de entrega" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-3xl font-extrabold text-white">{value}</span>
              <span className="text-sm text-blue-300/70">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
node_modules/.bin/tsc.CMD --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/sections/TestimonialsSection.tsx
git commit -m "feat(visual-c): TestimonialsSection — glassmorphism cards and client logo strip"
```

---

## Task 13: Final typecheck + production build

**Files:** none

- [ ] **Step 1: Full TypeScript check across entire project**

```bash
node_modules/.bin/tsc.CMD --noEmit
```
Expected: 0 errors, 0 warnings.

- [ ] **Step 2: Production build**

```bash
corepack pnpm build
```
Expected: output like `dist/index.html`, `dist/assets/index-[hash].js`, no errors. Build completes successfully.

- [ ] **Step 3: Commit if any stray changes remain**

```bash
git status
```
If any files show as modified, stage and commit them:
```bash
git add -A
git commit -m "chore: final build verification — packages A+B+C visual upgrade"
```

If `git status` is clean, no commit needed.
