# JAAGSOLUTIONS Landing — Visual Upgrade Design

> **For agentic workers:** Use `superpowers:subagent-driven-development` to implement this spec task-by-task.

**Goal:** Elevate the visual quality of the jaagsolutions-web landing page through three parallel upgrade packages: professional SVG iconography with animated counters (A), improved layout and structural sections (B), and glassmorphism/interactive premium effects (C).

**Architecture:** Additive approach — each package modifies sections in-place. One new hook (`useCountUp`), one new npm dependency (`lucide-react`). No new design system layer. Packages are implemented by parallel subagents and merged via a final review.

**Tech Stack:** React 18 + Vite 6 + TypeScript 5 + Tailwind CSS 3 + lucide-react + existing `useScrollReveal` hook

---

## Package A — Iconography + Animations

### A1 — Install lucide-react

Add `lucide-react` to `jaagsolutions-web/package.json` dependencies and install.

### A2 — useCountUp hook

Create `src/hooks/useCountUp.ts`. The hook accepts a numeric target and returns the current animated value. It uses `IntersectionObserver` to start only when the element enters the viewport, then drives a `requestAnimationFrame` loop for ~1 second to count up from 0 to the target. Returns `{ ref, count }`.

Only numeric stats can be animated — values like "24/7" and "1–4 sem" remain as static strings.

### A3 — StatsSection

Replace emoji icons with Lucide SVG icons:
- ⚡ → `<Zap />` (brand-400 color)
- 📉 → `<TrendingDown />` (green-400)
- 🤖 → `<Bot />` (violet-400)
- 🚀 → `<TrendingUp />` (blue-400)

Apply `useCountUp` to the `−60` and `+40` numeric stats. Non-numeric stats (`1–4 sem`, `24/7`) display as-is.

### A4 — ToolsSection

Replace text+emoji cards with bordered cards that have a colored left accent stripe. Add a Lucide category icon per tool group:
- Automation tools (n8n, Make, Zapier) → `<Workflow />`
- Data/DB tools (Notion, Airtable, Supabase) → `<Database />`
- Communication (WhatsApp API) → `<MessageCircle />`
- AI tools (OpenAI) → `<Brain />`

Each tool card: white background, left border in accent color, tool name, category icon in corner.

### A5 — ServicesSection

Replace emoji bullet points in both service pillars with `<CheckCircle2 />` Lucide icon (green-500 for Pilar A, blue-500 for Pilar B). Add `<ArrowRight />` to CTA links within cards.

### A6 — ProcessSection

Replace the step number badges with Lucide icons per phase:
- Diagnóstico → `<Search />`
- Diseño → `<Lightbulb />`
- Implementación → `<Code2 />`
- Entrega → `<Rocket />`

### A7 — FinalCtaSection

Replace emoji in the trust row with Lucide icons:
- ⚡ → `<Zap />`
- 🎯 → `<Target />`
- 🔒 → `<ShieldCheck />`

---

## Package B — Layout & Structure

### B1 — ComparisonSection rebuild

Replace the current 2-card layout with a full feature comparison table: **3 columns** (JAAGSOLUTIONS, Hacerlo solo, Agencia grande) × **7 rows** of features.

Features to compare:
1. Implementación < 4 semanas
2. Precio accesible para PYME
3. Soporte post-entrega
4. Capacitación al equipo
5. Automatización + SaaS integrado
6. Sin contrato de permanencia
7. Diagnóstico gratuito

Cell values: `✓` (green, CheckCircle2), `✗` (red/muted, X icon), `~` (yellow, Minus icon).

JAAGSOLUTIONS column has a highlighted header with `bg-brand-900 text-white`. Keep the existing "Ruta recomendada" banner below the table. Keep the CTA button.

### B2 — FaqSection + FaqItem rebuild

Rebuild `FaqItem.tsx` with a CSS smooth accordion using `max-height` transition (not conditional render). Use `ChevronDown` from lucide-react that rotates 180° when open via `transition-transform`. Add a subtle `bg-brand-50` background on the active item row.

Add 2 additional FAQ questions to `FaqSection.tsx`:
- "¿Necesito conocimientos técnicos para usar las automatizaciones?" → No. Entregamos documentación y capacitamos al equipo operativo.
- "¿Qué pasa si el proceso cambia después de la implementación?" → Incluimos ajustes durante el período de soporte. Los flujos están diseñados para ser modificables sin reescribir desde cero.

### B3 — ProcessSection animated timeline

Add a vertical timeline connector line on desktop that animates its height from 0% to 100% when the section enters the viewport, using `useScrollReveal` + a CSS `scaleY` animation on the connector element. The connector sits between cards in the grid.

---

## Package C — Premium Effects

### C1 — HeroSection aurora background

Add 2 additional glow orbs to the Hero background with slow drift animations defined in `src/index.css`:

```css
@keyframes aurora-drift-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(60px, -40px) scale(1.15); }
}
@keyframes aurora-drift-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-50px, 30px) scale(1.1); }
}
```

Duration: 12s and 16s respectively, infinite, ease-in-out. The orbs use opacity-15 so they are subtle and do not distract from the content.

### C2 — PricingSection monthly/annual toggle

Add a billing toggle above the pricing cards: a pill-style toggle with two states (`Mensual` / `Anual`). When `Anual` is selected:
- A "Ahorra 20%" badge appears next to the toggle
- The Starter price changes from `$499` to `$399`
- The Growth price changes from `$1,299` to `$1,039`
- Scale remains `Personalizado`

Prices animate with a brief opacity fade transition (`transition-opacity duration-200`). Toggle state managed with `useState` local to PricingSection.

### C3 — TestimonialsSection glassmorphism + logo strip

Upgrade testimonial cards to glassmorphism style:
- Background: `bg-white/8` (was `bg-white/5`)
- Border: `border-white/15`
- Add `backdrop-blur-md`
- Add subtle gradient overlay: `before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none`

Add a **client logo strip** above the cards:
- Label: "Empresas que confían en nosotros"
- 5 placeholder company names styled as pill badges: `Inmobiliaria Cenit`, `Distribuidora Apex`, `LogiTech MX`, `Retail Pro`, `Servicios Delta`
- Style: `bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-sm text-blue-200/70`
- Display as a centered flex-wrap row with gap

### C4 — PricingSection featured card glassmorphism

Upgrade the highlighted Growth card with:
- `backdrop-blur-sm` (already present, keep)
- Add animated gradient border via a pseudo-element `before:` that cycles hue — implemented as a CSS animation in `index.css`
- Increase shadow to `shadow-[0_0_60px_rgba(37,99,235,0.35)]`

---

## Files Affected

| File | Package | Action |
|------|---------|--------|
| `jaagsolutions-web/package.json` | A | Add lucide-react dep |
| `src/hooks/useCountUp.ts` | A | Create |
| `src/sections/StatsSection.tsx` | A | Modify |
| `src/sections/ToolsSection.tsx` | A | Modify |
| `src/sections/ServicesSection.tsx` | A | Modify |
| `src/sections/ProcessSection.tsx` | A+B | Modify |
| `src/sections/FinalCtaSection.tsx` | A | Modify |
| `src/sections/ComparisonSection.tsx` | B | Rebuild |
| `src/sections/FaqSection.tsx` | B | Modify |
| `src/components/FaqItem.tsx` | B | Rebuild |
| `src/sections/HeroSection.tsx` | C | Modify |
| `src/sections/PricingSection.tsx` | C | Modify |
| `src/sections/TestimonialsSection.tsx` | C | Modify |
| `src/index.css` | C | Add animations |

## TypeScript constraints

- All Lucide icon components accept `className` for sizing and color
- `useCountUp` must handle non-numeric values gracefully (return as-is)
- No new dependencies beyond `lucide-react`
- All components keep `export default function` pattern
- TSC `--noEmit` must pass after all changes

## Success criteria

1. `tsc --noEmit` passes with 0 errors
2. `vite build` produces a clean dist
3. All emoji replaced with Lucide SVGs across 5 sections
4. Stats counters animate on scroll
5. Comparison table has 3 columns with 7 feature rows
6. FAQ accordion uses smooth CSS transition (no layout jump)
7. Pricing toggle switches between monthly/annual prices
8. Hero has subtle aurora drift animation
9. Testimonials has logo strip and glassmorphism cards
