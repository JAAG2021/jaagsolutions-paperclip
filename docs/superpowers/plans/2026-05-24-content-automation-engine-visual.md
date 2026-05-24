# Content Automation Engine Visual Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a reusable commercial visual system for the JAAGSOLUTIONS Content Automation Engine: web section, storyboard, prompt package, and future hero/video asset path.

**Architecture:** Centralize the product story in one TypeScript content module, render it on the JAAGSOLUTIONS landing as a productized workflow section, and create static marketing artifacts from the same approved narrative. The plan does not expose n8n internals as the primary sales object; it translates the production workflows into business-facing scenes.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, lucide-react, static HTML/Markdown marketing artifacts, generated bitmap/video assets prepared outside the app and stored under `jaagsolutions-web/public/media/`.

---

## File Structure

**Create:**

- `jaagsolutions-web/src/content/contentAutomationEngine.ts`  
  Single source of truth for CTA, workflow summaries, scene labels, scene copy, prompt text, and channel names.

- `jaagsolutions-web/src/sections/ContentAutomationEngineSection.tsx`  
  Landing page section that sells the automation as a productized system.

- `jaagsolutions-web/public/content-automation-engine-storyboard.html`  
  Static storyboard for commercial review and proposal sharing.

- `docs/marketing/content-automation-engine/prompts.md`  
  Final prompt package for scene/image generation.

- `docs/marketing/content-automation-engine/asset-manifest.md`  
  Asset inventory and production checklist for video, hero loop, vertical clip, and deck images.

**Modify:**

- `jaagsolutions-web/src/AppBelowFold.tsx`  
  Insert `ContentAutomationEngineSection` after `BenefitsSection` and before `ProcessSection`.

- `jaagsolutions-web/src/sections/HeroSection.tsx`  
  Only after the video loop exists: change the hero video filename from `hero-automation-hub.mp4` to `content-automation-engine-loop.mp4`, or keep the existing hero and link the new section from CTAs.

**Expected generated assets, not created by code tasks until produced:**

- `jaagsolutions-web/public/media/content-automation-engine-loop.mp4`
- `jaagsolutions-web/public/media/content-automation-engine-loop-poster.png`
- `jaagsolutions-web/public/media/content-automation-engine-master-16x9.mp4`
- `jaagsolutions-web/public/media/content-automation-engine-vertical-9x16.mp4`
- `docs/marketing/content-automation-engine/storyboard/scene-01.png` through `scene-10.png`

---

### Task 1: Centralize Content Automation Engine Copy And Prompts

**Files:**

- Create: `jaagsolutions-web/src/content/contentAutomationEngine.ts`

- [ ] **Step 1: Create the content directory**

Run:

```bash
mkdir -p jaagsolutions-web/src/content
```

Expected: directory exists at `jaagsolutions-web/src/content`.

- [ ] **Step 2: Add the content module**

Create `jaagsolutions-web/src/content/contentAutomationEngine.ts` with:

```ts
export const contentAutomationEngineCta = {
  label: "Solicitar diagnostico de contenido automatizado",
  helper:
    "Revisamos como produces contenido hoy y te proponemos un flujo automatizado para generar, aprobar y publicar con menos trabajo manual.",
  href: "#contacto",
} as const;

export const contentAutomationEngineWorkflowSummaries = [
  {
    title: "Motor creativo",
    eyebrow: "Workflow 1",
    description:
      "Convierte un plan editorial en una pieza visual lista para aprobacion, con IA creativa, control de calidad y formato profesional.",
    value:
      "Reduce trabajo manual de diseno, mantiene consistencia visual y prepara contenido antes de la fecha de publicacion.",
  },
  {
    title: "Aprobacion y publicacion",
    eyebrow: "Workflow 2",
    description:
      "Permite aprobar desde el movil y publica automaticamente en los canales correctos, con regeneracion controlada si la pieza no cumple.",
    value:
      "Conserva control humano, elimina publicacion manual por canal y crea un proceso repetible.",
  },
] as const;

export const contentAutomationEnginePipeline = [
  {
    title: "Plan editorial",
    shortLabel: "Plan",
    description: "El sistema detecta que contenido toca producir desde una fuente estructurada.",
  },
  {
    title: "Direccion creativa IA",
    shortLabel: "IA",
    description: "La idea se transforma en un prompt visual alineado a la marca.",
  },
  {
    title: "Control de calidad",
    shortLabel: "QA",
    description: "La imagen pasa por revision visual para evitar texto no deseado o errores.",
  },
  {
    title: "Aprobacion humana",
    shortLabel: "OK",
    description: "Telegram mantiene la decision final en manos del cliente o equipo.",
  },
  {
    title: "Publicacion multicanal",
    shortLabel: "Social",
    description: "El contenido aprobado se distribuye hacia LinkedIn, Instagram y Facebook.",
  },
] as const;

export const contentAutomationEngineScenes = [
  {
    number: "01",
    title: "La necesidad",
    screenCopy: "Publicar contenido constante no deberia depender de tareas manuales.",
    businessValue: "Enmarca el problema como falta de sistema, no falta de ideas.",
    prompt:
      "Professional editorial scene inside a modern Latin American SME office. A small marketing and operations team reviews a clean editorial calendar on a large table, with abstract social media cards and scheduling blocks represented as simple visual elements, no readable text. Premium B2B style, deep navy and cool blue palette with warm human lighting, cinematic composition, realistic photography, shallow depth of field, elegant and organized, no logos, no typography, no watermarks.",
  },
  {
    number: "02",
    title: "Entrada del plan editorial",
    screenCopy: "El plan editorial entra al sistema.",
    businessValue: "Muestra una fuente de verdad para contenido, fechas y formatos.",
    prompt:
      "High-end product visualization of an editorial content plan becoming structured data. A glowing calendar grid and database-like blocks feed into a central automation stream made of clean luminous lines. Modern B2B automation aesthetic, deep navy background, cyan and white accents, subtle glass panels, no readable text, no numbers, no logos, no interface screenshots, polished commercial 3D style.",
  },
  {
    number: "03",
    title: "Motor creativo IA",
    screenCopy: "IA convierte la idea en direccion creativa.",
    businessValue: "Traduce el copy en direccion visual de marca.",
    prompt:
      "Creative AI direction engine inside a premium automation studio. A single content idea flows into a luminous neural core, generating refined visual mood frames around it: photography style, composition, lighting, brand mood, and format cues represented only as abstract image thumbnails without text. Human-tech atmosphere, elegant navy glass surfaces, cool blue light, warm highlights, cinematic commercial style, no readable text, no logos, no UI screenshots.",
  },
  {
    number: "04",
    title: "Generacion de imagen",
    screenCopy: "La imagen se genera automaticamente.",
    businessValue: "Convierte la estrategia en un asset social utilizable.",
    prompt:
      "An AI image generation chamber creating a polished social media visual for a B2B automation brand. A blank luminous canvas transforms into a professional editorial photograph, surrounded by subtle particles and clean automation lines. Premium creative production environment, deep navy, cyan, white and soft coral accents, realistic but cinematic, no readable words inside the generated image, no logos, no watermarks.",
  },
  {
    number: "05",
    title: "Control de calidad",
    screenCopy: "Control de calidad antes de mostrar la pieza.",
    businessValue: "Reduce errores antes de que el cliente revise.",
    prompt:
      "Premium quality-control scan of a generated social media image. A clean visual asset passes through a transparent light scanner that checks composition, safety and absence of unwanted text. Subtle green approval glow, abstract OCR-like scanning beams without readable characters, modern B2B production lab, realistic 3D commercial style, no typography, no logos, no numbers.",
  },
  {
    number: "06",
    title: "Composicion final",
    screenCopy: "El sistema adapta la pieza al formato social.",
    businessValue: "Prepara la imagen, copy y formato para publicacion.",
    prompt:
      "Elegant automated design composition scene. A generated image, caption blocks, brand color accents and social media format guides align into a finished premium content card. The card uses abstract placeholder lines instead of readable text. Clean layout mechanics, glass panels, cinematic lighting, polished SaaS product visualization, deep navy background with cyan and white highlights, no logos, no readable words.",
  },
  {
    number: "07",
    title: "Aprobacion humana",
    screenCopy: "El control final sigue en manos humanas.",
    businessValue: "Posiciona la supervision como ventaja, no como friccion.",
    prompt:
      "Human approval checkpoint for automated content. A business owner holds a smartphone showing a polished social media preview with two simple action buttons represented by a green check and a soft red refresh/reject icon, no readable text. Warm human hand detail, modern office background, premium B2B automation mood, shallow depth of field, cinematic lighting, clean and trustworthy.",
  },
  {
    number: "08",
    title: "Publicacion multicanal",
    screenCopy: "Al aprobar, se publica en multiples canales.",
    businessValue: "Elimina la publicacion manual canal por canal.",
    prompt:
      "Approved content flowing from a central automation hub into multiple social publishing channels. One finished visual card duplicates into several elegant platform cards connected by luminous lines. Use generic social channel shapes and clean interface silhouettes without readable text or brand logos. Premium SaaS automation style, deep navy, cyan, white and green approval accents, high-end commercial 3D render, dynamic motion-ready composition.",
  },
  {
    number: "09",
    title: "Regeneracion controlada",
    screenCopy: "Si no convence, se regenera sin romper el flujo.",
    businessValue: "Permite iterar sin volver al proceso manual.",
    prompt:
      "Content regeneration loop in a premium automation system. A rejected creative asset smoothly returns through a glowing feedback loop into the AI creative engine, then emerges as a cleaner improved version. Elegant circular motion, soft coral rejection cue turning into green approval cue, no error chaos, modern B2B product visualization, no readable text, no logos, no UI screenshots.",
  },
  {
    number: "10",
    title: "Resultado comercial",
    screenCopy: "Contenido constante, aprobado y publicado con menos friccion.",
    businessValue: "Cierra con beneficio operativo y comercial.",
    prompt:
      "Final commercial outcome of an automated content engine. A modern business team reviews a calm growth dashboard and a filled editorial calendar, while polished social content cards float neatly in the background. The mood is controlled, creative and premium, with deep navy, cool blue, white and green accents. Realistic editorial photography blended with subtle SaaS interface elements, no readable text, no logos, no numbers, no watermarks.",
  },
] as const;

export const contentAutomationEngineChannels = [
  "LinkedIn",
  "Instagram",
  "Facebook",
] as const;
```

- [ ] **Step 3: Run TypeScript build to validate the module**

Run:

```bash
pnpm --dir jaagsolutions-web build
```

Expected: command completes with Vite build output and no TypeScript errors.

- [ ] **Step 4: Commit**

Run:

```bash
git add jaagsolutions-web/src/content/contentAutomationEngine.ts
git commit -m "feat(web): add content automation engine content model"
```

---

### Task 2: Build The Landing Page Product Section

**Files:**

- Create: `jaagsolutions-web/src/sections/ContentAutomationEngineSection.tsx`
- Modify: `jaagsolutions-web/src/AppBelowFold.tsx`

- [ ] **Step 1: Create the section component**

Create `jaagsolutions-web/src/sections/ContentAutomationEngineSection.tsx` with:

```tsx
import {
  ArrowRight,
  CheckCircle2,
  RefreshCcw,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import CTAButton from "../components/CTAButton.tsx";
import {
  contentAutomationEngineChannels,
  contentAutomationEngineCta,
  contentAutomationEnginePipeline,
  contentAutomationEngineWorkflowSummaries,
} from "../content/contentAutomationEngine.ts";

const pipelineIcons = [Sparkles, ShieldCheck, CheckCircle2, Smartphone, Send] as const;

export default function ContentAutomationEngineSection() {
  return (
    <section id="content-automation-engine" className="bg-brand-950 py-24 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <span className="mb-4 inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-cyan-100">
              Producto en produccion
            </span>
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Automatiza tu contenido sin perder control creativo.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-blue-100/85">
              De un plan editorial a publicaciones listas en LinkedIn, Instagram y Facebook, con IA,
              aprobacion humana y distribucion automatica.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {contentAutomationEngineWorkflowSummaries.map((workflow) => (
                <article
                  key={workflow.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/10"
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-cyan-200/80">
                    {workflow.eyebrow}
                  </p>
                  <h3 className="mt-2 text-xl font-extrabold">{workflow.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-blue-100/80">{workflow.description}</p>
                  <p className="mt-4 border-l-2 border-emerald-300/70 pl-3 text-sm font-semibold leading-relaxed text-emerald-100">
                    {workflow.value}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm font-semibold leading-relaxed text-blue-100/90">
                {contentAutomationEngineCta.helper}
              </p>
              <div className="mt-5">
                <CTAButton href={contentAutomationEngineCta.href} variant="primary">
                  {contentAutomationEngineCta.label} <ArrowRight className="size-4" aria-hidden />
                </CTAButton>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.12] to-white/[0.04] p-5 shadow-2xl shadow-black/20">
            <div className="absolute inset-0 bg-dot-pattern opacity-30" aria-hidden />
            <div className="relative">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-cyan-100/70">
                    Content Automation Engine
                  </p>
                  <p className="mt-1 text-sm text-blue-100/70">
                    Plan editorial - IA - aprobacion - publicacion
                  </p>
                </div>
                <RefreshCcw className="size-5 text-cyan-200" aria-hidden />
              </div>

              <ol className="space-y-3">
                {contentAutomationEnginePipeline.map((step, index) => {
                  const Icon = pipelineIcons[index] ?? Sparkles;
                  const isLast = index === contentAutomationEnginePipeline.length - 1;
                  return (
                    <li key={step.title} className="relative grid grid-cols-[2.75rem_1fr] gap-3">
                      <div className="flex flex-col items-center" aria-hidden>
                        <span className="flex size-11 items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-200/10 text-cyan-100">
                          <Icon className="size-5" />
                        </span>
                        {!isLast && <span className="mt-2 h-8 w-px bg-gradient-to-b from-cyan-300/70 to-transparent" />}
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-brand-900/75 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest text-cyan-200/80">
                              {step.shortLabel}
                            </p>
                            <h3 className="mt-1 text-base font-extrabold">{step.title}</h3>
                          </div>
                          <span className="rounded-full border border-white/10 px-2 py-1 text-xs font-bold text-blue-100/70">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-blue-100/75">{step.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-6 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-100/80">
                  Canales conectados
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {contentAutomationEngineChannels.map((channel) => (
                    <span
                      key={channel}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-bold text-white"
                    >
                      {channel}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Insert the section in `AppBelowFold.tsx`**

Modify `jaagsolutions-web/src/AppBelowFold.tsx` imports:

```tsx
import StatsSection from "./sections/StatsSection.tsx";
import ToolsSection from "./sections/ToolsSection.tsx";
import BenefitsSection from "./sections/BenefitsSection.tsx";
import ContentAutomationEngineSection from "./sections/ContentAutomationEngineSection.tsx";
import RoiCalculatorSection from "./sections/RoiCalculatorSection.tsx";
```

Then insert the section after `BenefitsSection`:

```tsx
      {/* 2. Por que funciona - beneficios diferenciadores */}
      <BenefitsSection />
      {/* 3. Producto visualizable - motor real de contenido automatizado */}
      <ContentAutomationEngineSection />
      {/* 4. Como trabajamos - reduce el miedo a lo desconocido */}
      <ProcessSection />
```

Renumbering comments below this insertion is optional; do it only if the surrounding comments are already being edited.

- [ ] **Step 3: Build**

Run:

```bash
pnpm --dir jaagsolutions-web build
```

Expected: TypeScript and Vite build pass.

- [ ] **Step 4: Visual check locally**

Run:

```bash
pnpm --dir jaagsolutions-web dev -- --host 127.0.0.1
```

Open:

```text
http://127.0.0.1:5173/#content-automation-engine
```

Expected:

- Section appears after benefits.
- CTA text is `Solicitar diagnostico de contenido automatizado`.
- Mobile width does not overlap text.
- Pipeline card shows five steps.
- Channel chips show LinkedIn, Instagram, Facebook.

- [ ] **Step 5: Commit**

Run:

```bash
git add jaagsolutions-web/src/content/contentAutomationEngine.ts jaagsolutions-web/src/sections/ContentAutomationEngineSection.tsx jaagsolutions-web/src/AppBelowFold.tsx
git commit -m "feat(web): add content automation engine section"
```

---

### Task 3: Create The Static Storyboard Review Page

**Files:**

- Create: `jaagsolutions-web/public/content-automation-engine-storyboard.html`

- [ ] **Step 1: Add the storyboard HTML**

Create `jaagsolutions-web/public/content-automation-engine-storyboard.html` with:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Storyboard - Content Automation Engine</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #07111f;
        --panel: rgba(255, 255, 255, 0.08);
        --line: rgba(125, 211, 252, 0.45);
        --text: #f8fafc;
        --muted: #bfd7ee;
        --cyan: #67e8f9;
        --green: #86efac;
        --coral: #fb7185;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: radial-gradient(circle at top left, rgba(14, 165, 233, 0.24), transparent 34rem), var(--bg);
        color: var(--text);
      }
      main { max-width: 1180px; margin: 0 auto; padding: 56px 20px 72px; }
      .eyebrow { color: var(--cyan); font-size: 12px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; }
      h1 { max-width: 860px; margin: 14px 0 16px; font-size: clamp(38px, 7vw, 76px); line-height: 0.95; letter-spacing: -0.04em; }
      .lead { max-width: 760px; color: var(--muted); font-size: 19px; line-height: 1.65; }
      .cta { display: inline-flex; margin-top: 24px; border: 1px solid rgba(255,255,255,0.18); background: white; color: #06101f; padding: 14px 18px; border-radius: 12px; font-weight: 900; text-decoration: none; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-top: 44px; }
      .card {
        min-height: 290px;
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 22px;
        background: linear-gradient(145deg, rgba(255,255,255,0.11), rgba(255,255,255,0.04));
        padding: 22px;
        position: relative;
        overflow: hidden;
      }
      .card::before {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at top right, rgba(103,232,249,0.14), transparent 18rem);
        pointer-events: none;
      }
      .num { color: var(--cyan); font-size: 13px; font-weight: 950; letter-spacing: 0.14em; }
      h2 { position: relative; margin: 10px 0 10px; font-size: 24px; }
      .copy { position: relative; color: white; font-size: 16px; font-weight: 800; line-height: 1.45; }
      .value { position: relative; margin-top: 14px; color: var(--green); font-size: 14px; font-weight: 750; line-height: 1.5; }
      .prompt { position: relative; margin-top: 18px; color: var(--muted); font-size: 12px; line-height: 1.55; max-height: 96px; overflow: auto; border-left: 2px solid var(--line); padding-left: 12px; }
      .flow { margin-top: 36px; padding: 18px; border: 1px solid var(--line); border-radius: 18px; color: var(--muted); background: rgba(103,232,249,0.08); font-weight: 800; line-height: 1.7; }
      @media (max-width: 760px) {
        main { padding-top: 36px; }
        .grid { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">JAAGSOLUTIONS - Content Automation Engine</p>
      <h1>Automatiza tu contenido sin perder control creativo.</h1>
      <p class="lead">Storyboard comercial para explicar un sistema real en produccion: genera contenido visual con IA, lo valida, pide aprobacion humana y publica en canales sociales.</p>
      <a class="cta" href="https://jaagsolutions.com/#contacto">Solicitar diagnostico de contenido automatizado</a>
      <p class="flow">Plan editorial -> IA creativa -> Control de calidad -> Aprobacion humana -> Publicacion multicanal</p>
      <section class="grid" aria-label="Storyboard de escenas">
        <article class="card"><p class="num">01</p><h2>La necesidad</h2><p class="copy">Publicar contenido constante no deberia depender de tareas manuales.</p><p class="value">Enmarca el problema como falta de sistema, no falta de ideas.</p><p class="prompt">Professional editorial scene inside a modern Latin American SME office. A small marketing and operations team reviews a clean editorial calendar on a large table...</p></article>
        <article class="card"><p class="num">02</p><h2>Entrada del plan editorial</h2><p class="copy">El plan editorial entra al sistema.</p><p class="value">Muestra una fuente de verdad para contenido, fechas y formatos.</p><p class="prompt">High-end product visualization of an editorial content plan becoming structured data. A glowing calendar grid and database-like blocks feed into a central automation stream...</p></article>
        <article class="card"><p class="num">03</p><h2>Motor creativo IA</h2><p class="copy">IA convierte la idea en direccion creativa.</p><p class="value">Traduce el copy en direccion visual de marca.</p><p class="prompt">Creative AI direction engine inside a premium automation studio. A single content idea flows into a luminous neural core...</p></article>
        <article class="card"><p class="num">04</p><h2>Generacion de imagen</h2><p class="copy">La imagen se genera automaticamente.</p><p class="value">Convierte la estrategia en un asset social utilizable.</p><p class="prompt">An AI image generation chamber creating a polished social media visual for a B2B automation brand...</p></article>
        <article class="card"><p class="num">05</p><h2>Control de calidad</h2><p class="copy">Control de calidad antes de mostrar la pieza.</p><p class="value">Reduce errores antes de que el cliente revise.</p><p class="prompt">Premium quality-control scan of a generated social media image. A clean visual asset passes through a transparent light scanner...</p></article>
        <article class="card"><p class="num">06</p><h2>Composicion final</h2><p class="copy">El sistema adapta la pieza al formato social.</p><p class="value">Prepara la imagen, copy y formato para publicacion.</p><p class="prompt">Elegant automated design composition scene. A generated image, caption blocks, brand color accents and social media format guides align...</p></article>
        <article class="card"><p class="num">07</p><h2>Aprobacion humana</h2><p class="copy">El control final sigue en manos humanas.</p><p class="value">Posiciona la supervision como ventaja, no como friccion.</p><p class="prompt">Human approval checkpoint for automated content. A business owner holds a smartphone showing a polished social media preview...</p></article>
        <article class="card"><p class="num">08</p><h2>Publicacion multicanal</h2><p class="copy">Al aprobar, se publica en multiples canales.</p><p class="value">Elimina la publicacion manual canal por canal.</p><p class="prompt">Approved content flowing from a central automation hub into multiple social publishing channels...</p></article>
        <article class="card"><p class="num">09</p><h2>Regeneracion controlada</h2><p class="copy">Si no convence, se regenera sin romper el flujo.</p><p class="value">Permite iterar sin volver al proceso manual.</p><p class="prompt">Content regeneration loop in a premium automation system. A rejected creative asset smoothly returns through a glowing feedback loop...</p></article>
        <article class="card"><p class="num">10</p><h2>Resultado comercial</h2><p class="copy">Contenido constante, aprobado y publicado con menos friccion.</p><p class="value">Cierra con beneficio operativo y comercial.</p><p class="prompt">Final commercial outcome of an automated content engine. A modern business team reviews a calm growth dashboard...</p></article>
      </section>
    </main>
  </body>
</html>
```

- [ ] **Step 2: Verify static page exists in Vite public output**

Run:

```bash
pnpm --dir jaagsolutions-web build
```

Expected: `jaagsolutions-web/dist/content-automation-engine-storyboard.html` exists after build.

- [ ] **Step 3: Preview**

Run:

```bash
pnpm --dir jaagsolutions-web preview -- --host 127.0.0.1
```

Open:

```text
http://127.0.0.1:4173/content-automation-engine-storyboard.html
```

Expected: storyboard page renders with 10 cards and no horizontal overflow at mobile width.

- [ ] **Step 4: Commit**

Run:

```bash
git add jaagsolutions-web/public/content-automation-engine-storyboard.html
git commit -m "docs(web): add content automation storyboard page"
```

---

### Task 4: Create Marketing Prompt And Asset Package

**Files:**

- Create: `docs/marketing/content-automation-engine/prompts.md`
- Create: `docs/marketing/content-automation-engine/asset-manifest.md`

- [ ] **Step 1: Create docs folder**

Run:

```bash
mkdir -p docs/marketing/content-automation-engine
```

Expected: folder exists.

- [ ] **Step 2: Create prompt package**

Create `docs/marketing/content-automation-engine/prompts.md`:

```markdown
# Content Automation Engine - Prompt Package

Use these prompts to generate the 10 base scenes for the JAAGSOLUTIONS Content Automation Engine visual campaign.

## Global Negative Prompt

```text
no readable text, no letters, no numbers, no logos, no watermarks, no screenshots, no real credentials, no API keys, no brand names inside the image, no chaotic dashboard, no fake UI text, no distorted hands, no uncanny faces
```

## Style Lock

```text
Premium B2B SaaS product visualization for a Latin American automation agency. Deep navy, cool blue, cyan and white palette with restrained green approval accents and soft coral rejection accents. Cinematic lighting, high-end commercial style, clean motion-ready composition, human-tech balance.
```

## Scenes

Copy the scene prompts from `docs/superpowers/specs/2026-05-24-content-automation-engine-visual-design.md` or from `jaagsolutions-web/src/content/contentAutomationEngine.ts`.

## Output Requirements

- Generate each scene in 16:9 and 9:16.
- Keep a calm area for overlay text.
- Do not bake text into the image.
- Name files `scene-01.png` through `scene-10.png`.
- Save approved images under `docs/marketing/content-automation-engine/storyboard/`.
```

- [ ] **Step 3: Create asset manifest**

Create `docs/marketing/content-automation-engine/asset-manifest.md`:

```markdown
# Content Automation Engine - Asset Manifest

## Final Deliverables

| Asset | Path | Format | Purpose |
|---|---|---:|---|
| Master commercial video | `jaagsolutions-web/public/media/content-automation-engine-master-16x9.mp4` | 1920x1080 MP4 | Sales calls, landing page, presentations |
| Vertical commercial video | `jaagsolutions-web/public/media/content-automation-engine-vertical-9x16.mp4` | 1080x1920 MP4 | LinkedIn mobile, Instagram, WhatsApp |
| Hero loop | `jaagsolutions-web/public/media/content-automation-engine-loop.mp4` | 896x1200 MP4 | Website hero or product section |
| Hero poster | `jaagsolutions-web/public/media/content-automation-engine-loop-poster.png` | PNG | Fallback image |
| Storyboard scene images | `docs/marketing/content-automation-engine/storyboard/scene-01.png` to `scene-10.png` | PNG | Deck and review |

## Acceptance Checklist

- [ ] No secrets or internal URLs visible.
- [ ] No readable text baked into generated images.
- [ ] Human approval is visually clear.
- [ ] Two engines are visible: creative generation and approval/publishing.
- [ ] CTA uses: `Solicitar diagnostico de contenido automatizado`.
- [ ] 16:9 video is under 20 MB or compressed before deploy.
- [ ] Hero loop is under 5 MB or compressed before deploy.
- [ ] Mobile crop remains understandable.

## Production Notes

The website can ship the section before final video assets exist. Do not change `HeroSection.tsx` to the new hero loop until `content-automation-engine-loop.mp4` is present and verified in browser.
```

- [ ] **Step 4: Commit**

Run:

```bash
git add docs/marketing/content-automation-engine/prompts.md docs/marketing/content-automation-engine/asset-manifest.md
git commit -m "docs(marketing): add content automation prompt and asset package"
```

---

### Task 5: Produce And Install Visual Assets

**Files:**

- Create: `docs/marketing/content-automation-engine/storyboard/scene-01.png` through `scene-10.png`
- Create: `jaagsolutions-web/public/media/content-automation-engine-loop.mp4`
- Create: `jaagsolutions-web/public/media/content-automation-engine-loop-poster.png`
- Optional create: `jaagsolutions-web/public/media/content-automation-engine-master-16x9.mp4`
- Optional create: `jaagsolutions-web/public/media/content-automation-engine-vertical-9x16.mp4`

- [ ] **Step 1: Generate 10 scene images**

Use the prompt package from Task 4. Generate each scene with the global style lock and negative prompt.

Expected files:

```text
docs/marketing/content-automation-engine/storyboard/scene-01.png
docs/marketing/content-automation-engine/storyboard/scene-02.png
docs/marketing/content-automation-engine/storyboard/scene-03.png
docs/marketing/content-automation-engine/storyboard/scene-04.png
docs/marketing/content-automation-engine/storyboard/scene-05.png
docs/marketing/content-automation-engine/storyboard/scene-06.png
docs/marketing/content-automation-engine/storyboard/scene-07.png
docs/marketing/content-automation-engine/storyboard/scene-08.png
docs/marketing/content-automation-engine/storyboard/scene-09.png
docs/marketing/content-automation-engine/storyboard/scene-10.png
```

- [ ] **Step 2: Review each image**

Check:

- No readable fake text.
- No logos.
- No distorted hands in scene 7.
- Scene 7 clearly implies approval/rejection without exposing real Telegram UI.
- Scene 8 clearly implies multichannel publishing.

- [ ] **Step 3: Create hero loop**

Create `jaagsolutions-web/public/media/content-automation-engine-loop.mp4` as an 8-12 second loop showing:

```text
Plan editorial -> IA creativa -> Control de calidad -> Aprobacion humana -> Publicacion multicanal
```

Recommended export:

```text
896x1200 MP4, H.264, muted, loop-friendly, under 5 MB
```

- [ ] **Step 4: Create poster**

Create `jaagsolutions-web/public/media/content-automation-engine-loop-poster.png` from a frame that shows the complete flow.

- [ ] **Step 5: Verify file sizes**

Run:

```bash
Get-ChildItem -Path jaagsolutions-web/public/media/content-automation-engine* | Select-Object Name,Length
```

Expected:

- `content-automation-engine-loop.mp4` is present.
- `content-automation-engine-loop-poster.png` is present.
- MP4 length is acceptable for web delivery.

- [ ] **Step 6: Commit assets**

Run:

```bash
git add docs/marketing/content-automation-engine/storyboard jaagsolutions-web/public/media/content-automation-engine-loop.mp4 jaagsolutions-web/public/media/content-automation-engine-loop-poster.png
git commit -m "assets: add content automation engine visuals"
```

---

### Task 6: Wire The Hero To The New Loop After Asset Verification

**Files:**

- Modify: `jaagsolutions-web/src/sections/HeroSection.tsx`

- [ ] **Step 1: Confirm hero loop exists**

Run:

```bash
Test-Path jaagsolutions-web/public/media/content-automation-engine-loop.mp4
```

Expected:

```text
True
```

- [ ] **Step 2: Update hero video constant**

In `jaagsolutions-web/src/sections/HeroSection.tsx`, change:

```ts
const HERO_VIDEO_FILENAME = "hero-automation-hub.mp4";
```

to:

```ts
const HERO_VIDEO_FILENAME = "media/content-automation-engine-loop.mp4";
```

Then update `HERO_VISUAL_ALT` to:

```ts
const HERO_VISUAL_ALT =
  "Animacion comercial del Content Automation Engine de JAAGSOLUTIONS: plan editorial, IA creativa, control de calidad, aprobacion humana y publicacion multicanal conectados por lineas luminosas.";
```

- [ ] **Step 3: Build**

Run:

```bash
pnpm --dir jaagsolutions-web build
```

Expected: build passes.

- [ ] **Step 4: Browser verification**

Run:

```bash
pnpm --dir jaagsolutions-web preview -- --host 127.0.0.1
```

Open:

```text
http://127.0.0.1:4173/
```

Expected:

- Hero video loads.
- No black/blank hero frame.
- Video loops.
- On mobile viewport, content is not cropped beyond recognition.

- [ ] **Step 5: Commit**

Run:

```bash
git add jaagsolutions-web/src/sections/HeroSection.tsx
git commit -m "feat(web): use content automation engine hero loop"
```

---

### Task 7: Final Verification And Handoff

**Files:**

- No new files.

- [ ] **Step 1: Run production build**

Run:

```bash
pnpm --dir jaagsolutions-web build
```

Expected: build passes.

- [ ] **Step 2: Preview key pages**

Run:

```bash
pnpm --dir jaagsolutions-web preview -- --host 127.0.0.1
```

Check:

```text
http://127.0.0.1:4173/
http://127.0.0.1:4173/#content-automation-engine
http://127.0.0.1:4173/content-automation-engine-storyboard.html
```

Expected:

- Landing loads.
- New section appears.
- Storyboard page loads.
- CTA link scrolls or navigates to `#contacto`.

- [ ] **Step 3: Check git status**

Run:

```bash
git status --short
```

Expected: no uncommitted changes except intentionally untracked large video source files that are not meant for the repo.

- [ ] **Step 4: Prepare deployment note**

Write this in the final handoff:

```text
Implemented Content Automation Engine visual package:
- Added landing page section for the productized content automation workflow.
- Added static storyboard page.
- Added prompt package and asset manifest.
- Added/verified video loop assets if available.
- Verified with pnpm --dir jaagsolutions-web build and browser preview.
```

---

## Self-Review

**Spec coverage:**

- Video commercial concept: Task 5 defines master and vertical assets.
- Web/hero adaptation: Tasks 2 and 6.
- Proposal/storyboard adaptation: Task 3 and Task 4.
- Prompt package by scene: Task 1 data model and Task 4 prompt package.
- CTA update: Task 1 and Task 2 use `Solicitar diagnostico de contenido automatizado`.
- Human approval emphasis: Task 1 scenes, Task 2 section copy, Task 5 review criteria.

**No-placeholder scan:**

- No `TBD`.
- No `TODO`.
- No unspecified file paths.
- Asset generation is explicitly scoped with filenames and review criteria.

**Execution note:**

Task 6 must not run before Task 5 creates and verifies `content-automation-engine-loop.mp4`; otherwise the hero will point to a missing asset.
