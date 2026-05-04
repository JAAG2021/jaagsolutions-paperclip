# Checklist Maestro — Proyecto JAAGSOLUTIONS
**Revisión:** 2026-05-04  
**Rama:** `feature/jaagsolutions`  
**Regla:** actualizar este archivo inmediatamente al completar cada item. No ejecutar tareas repetitivas.

---

## RESUMEN EJECUTIVO

| Entregable | Estado | % Completo |
|-----------|--------|-----------|
| Seed Paperclip | Código listo, ejecución en prod pendiente | 80% |
| Landing Web (código) | Completo + mejoras visuales extra | 100% |
| Landing Web (deploy Vercel) | Parcialmente completo | 60% |
| Infraestructura VPS / n8n | Docs listos, provisión pendiente | 30% |

---

## ENTREGABLE 1 — Seed de Paperclip

### Archivos en repo

| Archivo | Estado |
|---------|--------|
| `Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json` | ✅ Completo — company, 4 agentes, 4 goals, 2 proyectos, 8 issues |
| `packages/db/src/seed-jaagsolutions.ts` | ✅ Completo — loader idempotente con upserts |
| `packages/db/package.json` → script `seed:jaagsolutions` | ✅ Completo |
| `package.json` (root) → script `db:seed:jaagsolutions` | ✅ Completo |

### Criterios de aceptación

- [x] Archivo JSON con estructura completa (company/agents/goals/projects/issues)
- [x] Loader TypeScript con upserts idempotentes
- [x] Script `pnpm db:seed:jaagsolutions` configurado
- [ ] **PENDIENTE:** Correr el seed con Paperclip activo en producción y verificar:
  - [ ] Company JAAGSOLUTIONS visible en UI de Paperclip
  - [ ] 4 agentes con jerarquía correcta visibles
  - [ ] 4 goals con parentId correcto
  - [ ] 2 proyectos con lead asignado
  - [ ] 8 issues distribuidos correctamente
  - [ ] Correr el script dos veces sin duplicar datos

---

## ENTREGABLE 2 — Landing Web (código)

### Estructura y configuración base

| Item | Estado |
|------|--------|
| Scaffold Vite + React + TypeScript + Tailwind | ✅ Completo |
| `package.json` con dependencias correctas | ✅ Completo |
| `vite.config.ts` con proxy `/api/lead` → Formspree | ✅ Completo |
| `tailwind.config.ts` con colores `brand` numéricos | ✅ Completo |
| `tsconfig.json` | ✅ Completo |
| `index.html` con SEO base + OG tags | ✅ Completo |
| `public/favicon.svg` | ✅ Completo |
| `public/og-share.png` | ✅ Completo |
| `api/lead.js` (Vercel Serverless — proxy Formspree sin CORS) | ✅ Completo |
| `vercel.json` (build + output + install config) | ✅ Completo |
| `src/index.css` (Aurora animations + Tailwind layers) | ✅ Completo |
| Lazy loading (`AppBelowFold.tsx`) para reducir JS inicial | ✅ Completo |
| `hooks/useCountUp.ts` (animación numérica + reduced-motion) | ✅ Completo |
| `hooks/useScrollReveal.ts` (animación entrada por scroll) | ✅ Completo |

### Componentes base

| Componente | Estado |
|-----------|--------|
| `components/SectionHeader.tsx` | ✅ Completo |
| `components/CTAButton.tsx` (primario/secundario/texto + disabled) | ✅ Completo |
| `components/Card.tsx` | ✅ Completo |
| `components/FaqItem.tsx` (accordion smooth + ChevronDown) | ✅ Completo |
| `components/AutomationFlowDiagram.tsx` | ✅ Completo |
| `components/HeroAutomationHubIllustration.tsx` | ✅ Completo |

### Secciones — Plan original (11 secciones)

| Sección | Estado | Notas |
|---------|--------|-------|
| `TopNav.tsx` | ✅ Completo | Sticky, hamburguesa mobile, anclas |
| `HeroSection.tsx` | ✅ Completo | Orbs animados, aurora bg, Lottie/video/mockup |
| `BenefitsSection.tsx` | ✅ Completo | 4 cards con Lucide icons |
| `ServicesSection.tsx` | ✅ Completo | 2 pilares (Automatización + SaaS) con Lucide |
| `ProcessSection.tsx` | ✅ Completo | 3 pasos + conector animado + Lucide |
| `UseCasesSection.tsx` | ✅ Completo | 4 casos before/after infográfico |
| `ComparisonSection.tsx` | ✅ Completo | Matriz 3 columnas con Lucide icons |
| `ContactFormSection.tsx` | ✅ Completo | Multi-step (3 pasos), react-hook-form, proxy /api/lead |
| `FaqSection.tsx` | ✅ Completo | Accordion smooth + 6 FAQs |
| `FinalCtaSection.tsx` | ✅ Completo | Lucide icons, fondo brand-900 |
| `FooterSection.tsx` | ✅ Completo | Nav + legal + CTA |

### Secciones extra (mejoras visuales post-MVP)

| Sección | Estado | Notas |
|---------|--------|-------|
| `StatsSection.tsx` | ✅ Completo | Count-up animado + Lucide |
| `ToolsSection.tsx` | ✅ Completo | Tarjetas con iconos de categoría |
| `TestimonialsSection.tsx` | ✅ Completo | Glassmorphism + logo strip |
| `PricingSection.tsx` | ✅ Completo | Toggle mensual/anual, gradient Growth card |
| `RoiCalculatorSection.tsx` | ✅ Completo | Calculadora interactiva ROI |

### Features funcionales

| Feature | Estado | Notas |
|---------|--------|-------|
| Formulario multi-paso (3 pasos) con validación | ✅ Completo | react-hook-form |
| Envío a Formspree via `/api/lead` (sin CORS) | ✅ Completo | Proxy Vercel serverless |
| Estado éxito / error visible al usuario | ✅ Completo | |
| Evento GA4 `form_submit` en conversión | ✅ Completo | Solo si `VITE_GA_ID` definido |
| WhatsApp flotante CTA | ✅ Completo | **⚠️ Número placeholder: `521XXXXXXXXXX` — REEMPLAZAR** |
| Responsive (mobile / tablet / desktop) | ✅ Completo | Breakpoints Tailwind |
| Menú hamburguesa mobile | ✅ Completo | |
| Scroll suave a anclas | ✅ Completo | `scroll-behavior: smooth` en CSS |
| SEO: title + meta description | ✅ Completo | |
| SEO: Open Graph (title, description, type) | ✅ Completo | |
| Aurora / animaciones background | ✅ Completo | |
| Build de producción (`dist/`) | ✅ Completo — dist/ existe | |
| Antispam / honeypot | ❌ Pendiente (P1 — W-008) | Backlog original |
| Privacidad / Términos (páginas reales) | ❌ Pendiente | Footer links van a `#` |
| Accesibilidad A11y (contraste, focus, labels) | ❌ Pendiente (P2 — W-016) | |

---

## ENTREGABLE 3 — Deploy y Producción

### Archivos de infraestructura en repo

| Archivo | Estado |
|---------|--------|
| `deploy/.env.production.example` | ✅ Completo |
| `deploy/docker-compose.yml` | ✅ Completo — Paperclip + PostgreSQL 16 + n8n 1.112.6 + Caddy |
| `deploy/Caddyfile` | ✅ Completo — SSL LE, paperclip + n8n + apex→www |
| `deploy/setup.sh` | ✅ Completo |
| `deploy/scripts/get-paperclip-ids.sh` | ✅ Completo |
| `deploy/n8n-workflows/formspree-to-paperclip.json` | ✅ Completo — validación HMAC + lectura submission |
| `deploy/RUNBOOK.md` | ✅ Completo |
| `jaagsolutions-web/DEPLOY-VERCEL.md` | ✅ Completo |

### Fase A — Preview web + Formspree (sin VPS)

| Item | Estado | Notas |
|------|--------|-------|
| Cuenta Formspree creada | ✅ Completo | |
| Form ID anotado | ✅ Completo | `VITE_FORMSPREE_ID` = `xpqbzolp` |
| Repo `JAAG2021/jaagsolutions-paperclip` (privado) | ✅ Existe | |
| **Importar proyecto en Vercel** | ❌ **PENDIENTE** | Root Directory = `jaagsolutions-web` |
| **Configurar `VITE_FORMSPREE_ID` en Vercel env vars** | ❌ **PENDIENTE** | = `xpqbzolp`, marcar Preview + Production |
| **Redeploy con variables configuradas** | ❌ **PENDIENTE** | VITE_* se inyectan en build |
| **Prueba E2E: formulario → Network → Formspree submissions** | ❌ **PENDIENTE** | |
| Configurar `VITE_GA_ID` en Vercel (opcional) | ⬜ Opcional | |
| Configurar `VITE_SITE_URL` en Vercel | ⬜ Opcional | Mejora SEO og:url |
| Configurar `VITE_OG_IMAGE_URL` en Vercel | ⬜ Opcional | Mejora share social |
| **Reemplazar número WhatsApp placeholder** | ❌ **PENDIENTE** | `App.tsx:37` — cambiar `521XXXXXXXXXX` |
| Dominio `www.jaagsolutions.com` → CNAME Vercel | ❌ Pendiente (post-DNS) | |

### Fase B — VPS + Automatización (después de Fase A)

| Item | Estado |
|------|--------|
| Contratar VPS con IP estable | ❌ Pendiente |
| Configurar DNS (apex + www coherente con VPS/Vercel) | ❌ Pendiente |
| Ejecutar `deploy/setup.sh` en VPS | ❌ Pendiente |
| Variables en `deploy/.env` (Paperclip, n8n, Formspree secret) | ❌ Pendiente |
| Correr seed Paperclip en producción | ❌ Pendiente |
| Obtener IDs con `get-paperclip-ids.sh` | ❌ Pendiente |
| Configurar webhook Formspree → n8n | ❌ Pendiente |
| Importar workflow n8n (`formspree-to-paperclip.json`) | ❌ Pendiente |
| Activar workflow n8n | ❌ Pendiente |
| Prueba E2E completa: formulario → Formspree → n8n → issue Paperclip | ❌ Pendiente |

---

## TAREAS BLOQUEANTES (PRÓXIMOS PASOS INMEDIATOS)

1. **Reemplazar número WhatsApp** en [`jaagsolutions-web/src/App.tsx:37`](../../../jaagsolutions-web/src/App.tsx) — cambiar `521XXXXXXXXXX` por número real.
2. **Vercel — importar proyecto** (Root Directory: `jaagsolutions-web`, rama `feature/jaagsolutions`).
3. **Vercel — configurar env vars** (`VITE_FORMSPREE_ID=xpqbzolp`) y hacer Redeploy.
4. **Prueba del formulario** en URL de Vercel → verificar submission en Formspree.
5. **Opcional:** configurar `VITE_GA_ID` para medir conversiones desde el primer día.

---

## TAREAS P1 / P2 DIFERIDAS (código)

| Tarea | Prioridad | Descripción |
|-------|-----------|-------------|
| W-008 Antispam honeypot | P1 | Campo oculto en formulario para filtrar bots |
| W-011 Eventos secundarios GA | P1 | Track clics CTA, scroll depth |
| W-016 Accesibilidad A11y | P2 | Contraste, focus visible, nav teclado |
| Páginas privacidad / términos | P1 | Links del footer actualmente van a `#` |

---

## REFERENCIA DE DOCUMENTOS

| Documento | Ubicación |
|-----------|-----------|
| Diseño spec principal | [`docs/superpowers/specs/2026-04-16-jaagsolutions-design.md`](./2026-04-16-jaagsolutions-design.md) |
| Plan implementación landing | [`docs/superpowers/plans/2026-04-16-jaagsolutions-web-landing.md`](../plans/2026-04-16-jaagsolutions-web-landing.md) |
| Plan implementación seed | [`docs/superpowers/plans/2026-04-16-jaagsolutions-paperclip-seed.md`](../plans/2026-04-16-jaagsolutions-paperclip-seed.md) |
| Checklist producción (Fase A/B) | [`docs/superpowers/specs/2026-04-30-jaagsolutions-produccion-checklist.md`](./2026-04-30-jaagsolutions-produccion-checklist.md) |
| Guía deploy Vercel | [`jaagsolutions-web/DEPLOY-VERCEL.md`](../../../jaagsolutions-web/DEPLOY-VERCEL.md) |
| Backlog web original | [`Proyect_JAAGSOLUTIONS/2026-04-15-jaagsolutions-backlog-web-mvp.md`](../../../Proyect_JAAGSOLUTIONS/2026-04-15-jaagsolutions-backlog-web-mvp.md) |
| Runbook VPS | [`deploy/RUNBOOK.md`](../../../deploy/RUNBOOK.md) |
