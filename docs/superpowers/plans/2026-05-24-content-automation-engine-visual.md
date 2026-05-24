# Content Automation Engine Social Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a social media video campaign that sells JAAGSOLUTIONS' real production automation for generating, approving, and publishing content.

**Architecture:** Create a video-first production package: script, storyboard, prompts, captions, and export checklist for LinkedIn, Facebook, and Instagram. This plan deliberately avoids touching the landing page, React components, web hero, or website assets.

**Tech Stack:** Markdown production docs, AI image/video generation prompts, video editing in the user's preferred tool (CapCut, Canva, Runway, After Effects, Premiere, or equivalent), final exports in MP4 for 16:9, 9:16, and 1:1.

---

## Scope

In scope:

- Video comercial para redes.
- Versiones para LinkedIn, Facebook e Instagram.
- Storyboard interno para producir el video.
- Prompts por escena.
- Caption, hashtags, thumbnail y CTA.
- Mensaje centrado en que JAAGSOLUTIONS ya usa esta automatizacion en produccion.

Out of scope:

- No modificar `jaagsolutions.com`.
- No crear componentes React.
- No tocar landing, hero, Vite, assets web ni secciones existentes.
- No publicar automaticamente el video desde n8n en esta fase.

---

## File Structure

**Create:**

- `docs/marketing/content-automation-engine/social-video-brief.md`  
  Brief creativo y comercial del video.

- `docs/marketing/content-automation-engine/social-video-script.md`  
  Guion por tiempo, texto en pantalla, voz opcional y visual por escena.

- `docs/marketing/content-automation-engine/social-video-prompts.md`  
  Prompts definitivos para generar imagenes/escenas.

- `docs/marketing/content-automation-engine/social-publishing-copy.md`  
  Caption, hashtags y CTAs por red.

- `docs/marketing/content-automation-engine/social-video-asset-checklist.md`  
  Lista de archivos finales a producir y criterios de aprobacion.

**Expected output assets (created during production, not by code):**

- `outputs/content-automation-engine/social-video-linkedin-16x9.mp4`
- `outputs/content-automation-engine/social-video-instagram-9x16.mp4`
- `outputs/content-automation-engine/social-video-square-1x1.mp4`
- `outputs/content-automation-engine/social-video-cover-linkedin.png`
- `outputs/content-automation-engine/social-video-cover-instagram.png`

---

### Task 1: Create The Social Video Brief

**Files:**

- Create: `docs/marketing/content-automation-engine/social-video-brief.md`

- [ ] **Step 1: Create folder**

Run:

```bash
mkdir -p docs/marketing/content-automation-engine
```

Expected: folder exists.

- [ ] **Step 2: Write the brief**

Create `docs/marketing/content-automation-engine/social-video-brief.md`:

```markdown
# Content Automation Engine - Social Video Brief

## Objetivo

Crear un video publicitario para LinkedIn, Facebook e Instagram que muestre que JAAGSOLUTIONS ya integra en su propia arquitectura una automatizacion real para generar contenido: plan editorial, IA creativa, control de calidad, aprobacion humana y publicacion multicanal.

## Mensaje Principal

JAAGSOLUTIONS no solo vende automatizacion: opera con automatizaciones reales en produccion. Este motor convierte un plan editorial en contenido visual revisado y listo para publicar.

## Audiencia

Dueno, gerente comercial, equipo de marketing o lider operativo de una PYME que publica contenido de forma irregular, manual o dependiente de una sola persona.

## Promesa

Tu empresa puede tener un sistema de contenido que genere, revise y prepare publicaciones con menos trabajo manual, manteniendo control humano antes de publicar.

## Prueba De Credibilidad

La automatizacion ya corre dentro del ecosistema JAAGSOLUTIONS:

- Workflow 1: genera y prepara contenido visual.
- Workflow 2: permite aprobar y publicar en canales sociales.

## CTA Principal

Solicitar diagnostico de contenido automatizado

## Texto De Apoyo

Revisamos como produces contenido hoy y te proponemos un flujo automatizado para generar, aprobar y publicar con menos trabajo manual.

## Tono

Creativo, estetico, premium, claro y comercial. Debe sentirse como un sistema vendible, no como una explicacion tecnica de n8n.

## Restricciones

- No mostrar tokens, URLs internas, credenciales ni datos reales.
- No mostrar capturas crudas de n8n como visual principal.
- No prometer demo SaaS cerrada.
- No decir que la IA publica sin supervision.
- No modificar landing ni componentes web.
```

- [ ] **Step 3: Commit**

Run:

```bash
git add docs/marketing/content-automation-engine/social-video-brief.md
git commit -m "docs(marketing): add content automation social video brief"
```

---

### Task 2: Write The Social Video Script

**Files:**

- Create: `docs/marketing/content-automation-engine/social-video-script.md`

- [ ] **Step 1: Create 45-60s master script**

Create `docs/marketing/content-automation-engine/social-video-script.md`:

```markdown
# Content Automation Engine - Social Video Script

## Version Maestra 45-60s

### 0:00-0:04 - Hook

**Texto en pantalla:**  
Publicar contenido no deberia depender de tareas manuales.

**Visual:**  
Calendario editorial, publicaciones pendientes, equipo pequeno revisando tareas.

**Voz opcional:**  
Crear contenido constante es dificil cuando todo depende de procesos manuales.

### 0:04-0:09 - Credibilidad

**Texto en pantalla:**  
En JAAGSOLUTIONS ya automatizamos este proceso.

**Visual:**  
Arquitectura visual elegante: plan editorial entrando a un motor de automatizacion.

**Voz opcional:**  
Por eso construimos un sistema real que ya opera dentro de nuestra propia arquitectura.

### 0:09-0:16 - Workflow 1

**Texto en pantalla:**  
El sistema toma el plan editorial y genera la pieza.

**Visual:**  
Plan editorial -> IA creativa -> imagen generada.

**Voz opcional:**  
El primer flujo selecciona el contenido, mejora la direccion creativa y genera una pieza visual.

### 0:16-0:23 - Calidad

**Texto en pantalla:**  
Antes de revisar, pasa por control de calidad.

**Visual:**  
Escaner visual, check de calidad, pieza limpia lista.

**Voz opcional:**  
Tambien valida que la imagen este limpia y lista para presentarse.

### 0:23-0:31 - Aprobacion humana

**Texto en pantalla:**  
La decision final sigue en manos humanas.

**Visual:**  
Movil con preview visual y dos acciones: aprobar o regenerar.

**Voz opcional:**  
El equipo aprueba desde el movil. Si no convence, se regenera.

### 0:31-0:40 - Workflow 2

**Texto en pantalla:**  
Al aprobar, el contenido queda listo para publicarse.

**Visual:**  
Pieza aprobada saliendo hacia LinkedIn, Instagram y Facebook.

**Voz opcional:**  
El segundo flujo conecta la aprobacion con la distribucion multicanal.

### 0:40-0:50 - Resultado

**Texto en pantalla:**  
Contenido constante. Menos friccion. Mas control.

**Visual:**  
Calendario ordenado, publicaciones listas, equipo enfocado en estrategia.

**Voz opcional:**  
El resultado es un sistema repetible para crear, aprobar y publicar contenido con menos trabajo manual.

### 0:50-0:60 - CTA

**Texto en pantalla:**  
Solicitar diagnostico de contenido automatizado

**Subtexto:**  
Revisamos como produces contenido hoy y te proponemos un flujo automatizado.

**Visual:**  
Logo JAAGSOLUTIONS, sistema completo en una linea: Plan -> IA -> Aprobacion -> Redes.
```

- [ ] **Step 2: Create 30-45s vertical cut script**

Append to the same file:

```markdown
## Version Vertical 30-45s

### Hook

**Texto:**  
Este es el sistema que usamos para automatizar contenido.

### Problema

**Texto:**  
Ideas, diseno, revision y publicacion suelen vivir en tareas separadas.

### Sistema

**Texto:**  
JAAGSOLUTIONS conecta todo en un flujo: plan editorial, IA, calidad, aprobacion y publicacion.

### Control

**Texto:**  
La IA ayuda. El humano aprueba.

### Resultado

**Texto:**  
Contenido mas constante, con menos trabajo manual.

### CTA

**Texto:**  
Solicitar diagnostico de contenido automatizado
```

- [ ] **Step 3: Commit**

Run:

```bash
git add docs/marketing/content-automation-engine/social-video-script.md
git commit -m "docs(marketing): add content automation social video script"
```

---

### Task 3: Create Final Scene Prompts

**Files:**

- Create: `docs/marketing/content-automation-engine/social-video-prompts.md`

- [ ] **Step 1: Write prompt package**

Create `docs/marketing/content-automation-engine/social-video-prompts.md`:

```markdown
# Content Automation Engine - Social Video Prompts

## Global Style

Premium B2B automation campaign for JAAGSOLUTIONS, a Latin American automation agency. Deep navy, cool blue, cyan, clean white, restrained green approval accents and soft coral rejection accents. Cinematic lighting, elegant product visualization, human-tech balance, modern creative operations, motion-ready composition.

## Global Negative Prompt

No readable text inside the image, no fake letters, no numbers, no logos, no watermarks, no screenshots, no credentials, no API keys, no real customer data, no chaotic interface, no distorted hands, no uncanny faces.

## Scene 01 - Hook: trabajo manual

Professional editorial scene inside a modern Latin American SME office. A small marketing and operations team reviews a clean editorial calendar on a large table, with abstract social media cards and scheduling blocks represented as simple visual elements, no readable text. Premium B2B style, deep navy and cool blue palette with warm human lighting, cinematic composition, realistic photography, shallow depth of field, elegant and organized.

## Scene 02 - JAAGSOLUTIONS usa el sistema

High-end product visualization of JAAGSOLUTIONS internal automation architecture. A central luminous engine receives structured editorial planning blocks and sends them through clean automation lines. Modern B2B automation aesthetic, deep navy background, cyan and white accents, subtle glass panels, polished commercial 3D style, no readable text, no logos.

## Scene 03 - Direccion creativa IA

Creative AI direction engine inside a premium automation studio. A single content idea flows into a luminous neural core, generating refined visual mood frames around it: photography style, composition, lighting, brand mood, and format cues represented only as abstract image thumbnails without text.

## Scene 04 - Generacion de imagen

An AI image generation chamber creating a polished social media visual for a B2B automation brand. A blank luminous canvas transforms into a professional editorial photograph, surrounded by subtle particles and clean automation lines.

## Scene 05 - Control de calidad

Premium quality-control scan of a generated social media image. A clean visual asset passes through a transparent light scanner that checks composition, safety and absence of unwanted text. Subtle green approval glow, abstract OCR-like scanning beams without readable characters.

## Scene 06 - Composicion social

Elegant automated design composition scene. A generated image, caption blocks, brand color accents and social media format guides align into a finished premium content card. The card uses abstract placeholder lines instead of readable text.

## Scene 07 - Aprobacion humana

Human approval checkpoint for automated content. A business owner holds a smartphone showing a polished social media preview with two simple action buttons represented by a green check and a soft red refresh/reject icon, no readable text. Warm human hand detail, modern office background, premium B2B automation mood.

## Scene 08 - Publicacion multicanal

Approved content flowing from a central automation hub into multiple social publishing channels. One finished visual card duplicates into several elegant platform cards connected by luminous lines. Use generic social channel shapes and clean interface silhouettes without readable text or brand logos.

## Scene 09 - Regeneracion controlada

Content regeneration loop in a premium automation system. A rejected creative asset smoothly returns through a glowing feedback loop into the AI creative engine, then emerges as a cleaner improved version. Elegant circular motion, soft coral rejection cue turning into green approval cue.

## Scene 10 - Resultado

Final commercial outcome of an automated content engine. A modern business team reviews a calm growth dashboard and a filled editorial calendar, while polished social content cards float neatly in the background. The mood is controlled, creative and premium.
```

- [ ] **Step 2: Commit**

Run:

```bash
git add docs/marketing/content-automation-engine/social-video-prompts.md
git commit -m "docs(marketing): add social video scene prompts"
```

---

### Task 4: Create Publishing Copy For Each Network

**Files:**

- Create: `docs/marketing/content-automation-engine/social-publishing-copy.md`

- [ ] **Step 1: Write copy variants**

Create `docs/marketing/content-automation-engine/social-publishing-copy.md`:

```markdown
# Content Automation Engine - Social Publishing Copy

## CTA Principal

Solicitar diagnostico de contenido automatizado

## LinkedIn Caption

En JAAGSOLUTIONS no solo disenamos automatizaciones para clientes: tambien las usamos dentro de nuestra propia operacion.

Este flujo ya corre en produccion y conecta:

- Plan editorial
- Generacion visual con IA
- Control de calidad
- Aprobacion humana
- Publicacion multicanal

El objetivo no es reemplazar criterio humano. Es eliminar el trabajo repetitivo entre la idea y la publicacion.

Si tu empresa publica contenido de forma manual, irregular o dependiente de demasiados pasos, podemos revisar tu proceso y proponerte un flujo automatizado.

CTA: Solicitar diagnostico de contenido automatizado.

## Facebook Caption

Crear contenido constante no deberia depender de tareas manuales.

En JAAGSOLUTIONS ya usamos una automatizacion real para convertir un plan editorial en piezas listas para revisar y publicar.

IA para generar, humano para aprobar, automatizacion para distribuir.

Solicita un diagnostico de contenido automatizado y revisamos como adaptar este tipo de flujo a tu negocio.

## Instagram Caption

De idea a contenido publicado con menos trabajo manual.

Este es el tipo de automatizacion que JAAGSOLUTIONS ya usa en produccion:

Plan editorial -> IA -> control de calidad -> aprobacion humana -> publicacion

La IA ayuda. El humano aprueba. El sistema ejecuta.

Solicita un diagnostico de contenido automatizado.

## Hashtags

#JAAGSOLUTIONS #Automatizacion #ContenidoDigital #IAParaNegocios #n8n #Pymes #MarketingAutomation #AutomatizacionDeProcesos #LinkedInMarketing #TransformacionDigital

## Thumbnail Copy Options

1. Automatiza tu contenido sin perder control creativo
2. De idea a publicacion con IA y aprobacion humana
3. El sistema que usamos para crear contenido en JAAGSOLUTIONS
```

- [ ] **Step 2: Commit**

Run:

```bash
git add docs/marketing/content-automation-engine/social-publishing-copy.md
git commit -m "docs(marketing): add social publishing copy"
```

---

### Task 5: Create Asset Checklist

**Files:**

- Create: `docs/marketing/content-automation-engine/social-video-asset-checklist.md`

- [ ] **Step 1: Write asset checklist**

Create `docs/marketing/content-automation-engine/social-video-asset-checklist.md`:

```markdown
# Content Automation Engine - Social Video Asset Checklist

## Required Exports

| Asset | Path | Size | Use |
|---|---|---:|---|
| LinkedIn/Facebook feed video | `outputs/content-automation-engine/social-video-linkedin-16x9.mp4` | 1920x1080 | LinkedIn + Facebook feed |
| Instagram/Facebook reels video | `outputs/content-automation-engine/social-video-instagram-9x16.mp4` | 1080x1920 | Instagram Reels + Facebook Reels |
| Square video | `outputs/content-automation-engine/social-video-square-1x1.mp4` | 1080x1080 | Instagram/Facebook square feed |
| LinkedIn/Facebook cover | `outputs/content-automation-engine/social-video-cover-linkedin.png` | 1920x1080 | Cover/thumbnail |
| Instagram cover | `outputs/content-automation-engine/social-video-cover-instagram.png` | 1080x1920 | Reels cover |

## Visual Acceptance

- [ ] The viewer understands this is a real JAAGSOLUTIONS production automation.
- [ ] The video shows two flows: creative generation and approval/publishing.
- [ ] Human approval is clearly visible.
- [ ] No credentials, internal URLs or private data appear.
- [ ] No fake unreadable text is baked into generated scenes.
- [ ] CTA appears exactly as: `Solicitar diagnostico de contenido automatizado`.
- [ ] 9:16 version keeps core action inside mobile safe zones.
- [ ] 1:1 version does not crop the approval/publishing sequence.

## Recommended Video Settings

- MP4 H.264
- 24 or 30 fps
- Under 60 seconds
- Captions/text baked in for social autoplay without sound
- Audio optional, but video must work muted

## Publishing Order

1. LinkedIn 16:9
2. Instagram Reels 9:16
3. Facebook feed or reels
4. WhatsApp business follow-up if useful
```

- [ ] **Step 2: Commit**

Run:

```bash
git add docs/marketing/content-automation-engine/social-video-asset-checklist.md
git commit -m "docs(marketing): add social video asset checklist"
```

---

### Task 6: Produce The Video Assets

**Files:**

- Create output assets under `outputs/content-automation-engine/`

- [ ] **Step 1: Create output folder**

Run:

```bash
mkdir -p outputs/content-automation-engine
```

Expected: folder exists.

- [ ] **Step 2: Generate or design scene visuals**

Use `docs/marketing/content-automation-engine/social-video-prompts.md` to create 10 scene visuals. Keep text outside generated images; add all copy in the video editor.

- [ ] **Step 3: Assemble master video**

Use `docs/marketing/content-automation-engine/social-video-script.md` as timeline. Export:

```text
outputs/content-automation-engine/social-video-linkedin-16x9.mp4
```

- [ ] **Step 4: Create vertical cut**

Adapt the same timeline to 9:16 using larger text and centered action. Export:

```text
outputs/content-automation-engine/social-video-instagram-9x16.mp4
```

- [ ] **Step 5: Create square cut**

Adapt to 1:1 with central composition. Export:

```text
outputs/content-automation-engine/social-video-square-1x1.mp4
```

- [ ] **Step 6: Create cover images**

Create:

```text
outputs/content-automation-engine/social-video-cover-linkedin.png
outputs/content-automation-engine/social-video-cover-instagram.png
```

Cover text:

```text
Automatiza tu contenido sin perder control creativo
```

- [ ] **Step 7: Review exports**

Check all items in `social-video-asset-checklist.md`.

- [ ] **Step 8: Commit production docs only**

Commit source docs and only commit final video assets if repository policy allows storing MP4s. If MP4s are too large, keep them in `outputs/` and document their local path.

Run:

```bash
git status --short
```

Expected: docs are tracked; large binary files are intentionally reviewed before commit.

---

## Self-Review

**Spec coverage:**

- Social-only scope: covered in Scope and all tasks.
- No landing/web changes: explicitly out of scope.
- Video for LinkedIn, Facebook, Instagram: Tasks 2, 4, 5, 6.
- Real production automation message: Tasks 1, 2, 4.
- CTA approved by user: Tasks 1, 2, 4, 5.

**No-placeholder scan:**

- No `TBD`.
- No `TODO`.
- No web implementation tasks remain.

**Execution note:**

Do not modify `jaagsolutions-web`, `HeroSection.tsx`, `AppBelowFold.tsx`, landing sections, or website assets while executing this plan.
