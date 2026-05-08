# Checklist Maestro — Proyecto JAAGSOLUTIONS
**Revisión:** 2026-05-08  
**Rama:** `feature/jaagsolutions`  
**Regla:** LEER ESTE ARCHIVO AL INICIO DE CADA SESIÓN antes de proponer cualquier tarea. Actualizar inmediatamente al completar cada item.

---

## PROTOCOLO DE SESIÓN

**Al iniciar conversación:** Claude lee este archivo primero. No propone tareas ya completadas.  
**Al completar una tarea:** Actualizar este checklist en el mismo commit o inmediatamente después.  
**El usuario confirma manualmente:** Marcar con ✅ + fecha cualquier acción hecha fuera del código (Cloudflare, DNS, cuentas, etc.).  
**CRÍTICO:** Leer también [`BITACORA-INFRAESTRUCTURA.md`](./BITACORA-INFRAESTRUCTURA.md) antes de cualquier cambio de infraestructura.

---

## RESUMEN EJECUTIVO — 2026-05-08

| Entregable | Estado | % Completo |
|-----------|--------|-----------|
| Seed Paperclip | **Completo** — 5 agentes, 5 goals, 3 proyectos, 13 issues en producción ✅ (2026-05-07) | 100% |
| Landing Web (código) | **Completo** — formulario 4 pasos + PDF + antispam + A11y + legales + email contacto | 100% |
| Landing Web (deploy) | **LIVE** — `jaagsolutions.com` + SSL + GA4 activo ✅ (2026-05-07) | 100% |
| Dominio + DNS | **Completo** — Hostinger → Cloudflare NS + Custom Domains activos ✅ | 100% |
| Email corporativo | **Completo** — routing `contacto@jaagsolutions.com` → Gmail ✅ | 100% |
| Infraestructura VPS / n8n | **Completo** — VPS + Docker + n8n + workflow activo + E2E verificado ✅ (2026-05-06) | 100% |
| Agente Marketing (A4) | **Completo** — Social & Content Lead creado con G4/P3/5 issues ✅ (2026-05-07) | 100% |
| Auditoría seguridad + bugs | **Completo** — 2 críticos + 4 importantes + 4 menores corregidos ✅ (2026-05-07) | 100% |

---

## PRÓXIMOS PASOS — ordenados por prioridad

### Activar sync automático de workflows n8n (una sola vez)

El deploy de workflows n8n es ahora **automático via GitHub Actions** (`sync-n8n.yml`).
Requiere configuración única de secrets en el repo y API key en n8n:

1. [ ] Generar API key en n8n UI: **Settings → n8n API → Create API key**
2. [ ] Agregar `N8N_API_KEY=<clave>` en `deploy/.env` del VPS
3. [ ] En repo `JAAG2021/jaagsolutions-paperclip` → **Settings → Secrets → Actions**:
   - `JAAGSOLUTIONS_N8N_URL` = `https://n8n.jaagsolutions.com`
   - `JAAGSOLUTIONS_N8N_API_KEY` = `<la clave>`
4. [ ] Para aplicar el JSON actualizado **ahora** (mientras configuras los secrets):

   ```bash
   # En VPS:
   cd /opt/jaagsolutions/repo && git pull origin feature/jaagsolutions
   N8N_API_KEY=<tu_clave> bash deploy/scripts/sync-n8n-workflows.sh
   ```

Una vez configurados los secrets, **cualquier push que toque `deploy/n8n-workflows/*.json` actualiza n8n automáticamente**.

### Opcionales

- **Configurar API key Anthropic en Paperclip** → habilita ejecución autónoma de agentes (`Settings → AI Provider`)
- **Fase escalabilidad:** conectar `diagnostico_express` con agente IA (Claude via n8n) para propuesta personalizada por email
- **PDF dinámico:** evolucionar lead magnet de estático a generado con datos del formulario

---

## ENTREGABLE 1 — Seed de Paperclip

### Archivos en repo

| Archivo | Estado |
|---------|--------|
| `Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json` | ✅ Completo — company, 5 agentes (A0–A4), 5 goals, 3 proyectos, 13 issues |
| `packages/db/src/seed-jaagsolutions.ts` | ✅ Completo — loader idempotente con upserts |
| `packages/db/package.json` → script `seed:jaagsolutions` | ✅ Completo |
| `package.json` (root) → script `db:seed:jaagsolutions` | ✅ Completo |

### Criterios de aceptación

- [x] Archivo JSON con estructura completa (company/agents/goals/projects/issues)
- [x] Loader TypeScript con upserts idempotentes
- [x] Script `pnpm db:seed:jaagsolutions` configurado
- [x] ✅ Company JAAGSOLUTIONS visible en UI de Paperclip (2026-05-07)
- [x] ✅ 5 agentes con jerarquía correcta (CEO → PM → Engineer; CEO → Growth Ops → Social Lead)
- [x] ✅ 5 goals con parentId correcto
- [x] ✅ 3 proyectos con lead asignado (P1 Delivery, P2 Demand Engine, P3 Brand & Content)
- [x] ✅ 13 issues distribuidos correctamente
- [x] ✅ Script idempotente verificado (segunda ejecución: 0 creados, actualizados)

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
| `functions/api/lead.js` (Cloudflare Pages Function — proxy Formspree) | ✅ Completo — forwarding Origin header anti-spam |
| `DEPLOY-CLOUDFLARE.md` | ✅ Completo |
| `src/index.css` (Aurora animations + Tailwind layers) | ✅ Completo |
| Lazy loading (`AppBelowFold.tsx`) para reducir JS inicial | ✅ Completo |
| `hooks/useCountUp.ts` (animación numérica + reduced-motion) | ✅ Completo |
| `hooks/useScrollReveal.ts` (animación entrada por scroll) | ✅ Completo |
| `hooks/analytics.ts` (wrapper gtag — renombrado de useAnalytics.ts en auditoría) | ✅ Completo |
| `hooks/useScrollDepth.ts` (scroll depth 25/50/75/100%) | ✅ Completo |

### Componentes base

| Componente | Estado |
|-----------|--------|
| `components/SectionHeader.tsx` | ✅ Completo |
| `components/CTAButton.tsx` (primario/secundario/texto + GA4 tracking) | ✅ Completo |
| `components/Card.tsx` | ✅ Completo |
| `components/FaqItem.tsx` (accordion smooth + ChevronDown) | ✅ Completo |
| `components/AutomationFlowDiagram.tsx` | ✅ Completo |
| `components/HeroAutomationHubIllustration.tsx` | ✅ Completo |
| `components/LegalModal.tsx` | ✅ Completo — Escape key, backdrop click, scroll lock, aria-modal |
| `components/PrivacyPolicyContent.tsx` | ✅ Completo — VE/CL, Formspree, GA opcional |
| `components/TermsContent.tsx` | ✅ Completo — jurisdicción dual VE/CL |

### Secciones

| Sección | Estado | Notas |
|---------|--------|-------|
| `TopNav.tsx` | ✅ Completo | Sticky, hamburguesa mobile, anclas, aria-label |
| `HeroSection.tsx` | ✅ Completo | Orbs animados, aurora bg, aria-labelledby |
| `BenefitsSection.tsx` | ✅ Completo | 4 cards con Lucide icons |
| `ServicesSection.tsx` | ✅ Completo | 2 pilares con Lucide |
| `ProcessSection.tsx` | ✅ Completo | 3 pasos + conector animado |
| `UseCasesSection.tsx` | ✅ Completo | 4 casos before/after |
| `ComparisonSection.tsx` | ✅ Completo | Matriz 3 columnas |
| `ContactFormSection.tsx` | ✅ Completo | **4 pasos** — paso 4 opcional diagnóstico express + email contacto visible |
| `FaqSection.tsx` | ✅ Completo | Accordion smooth + 6 FAQs |
| `FinalCtaSection.tsx` | ✅ Completo | fondo brand-900 |
| `FooterSection.tsx` | ✅ Completo | Nav + modales legales + email contacto visible |
| `StatsSection.tsx` | ✅ Completo | Count-up animado |
| `ToolsSection.tsx` | ✅ Completo | Tarjetas por categoría |
| `TestimonialsSection.tsx` | ✅ Completo | Glassmorphism + logo strip |
| `PricingSection.tsx` | ✅ Completo | Toggle mensual/anual |
| `RoiCalculatorSection.tsx` | ✅ Completo | Calculadora ROI interactiva |

### Features funcionales

| Feature | Estado | Notas |
|---------|--------|-------|
| Formulario 4 pasos con validación | ✅ Completo | Pasos 1–3 obligatorios, paso 4 opcional |
| Paso 4 — Diagnóstico express (texto libre) | ✅ Completo (2026-05-04) | Botones "Omitir y enviar" / "Enviar con diagnóstico" — **escala a IA personalizada en Fase B** |
| Envío a Formspree via `/api/lead` (sin CORS) | ✅ Completo | CF Function con Origin forwarding anti-spam |
| Estado éxito con botón "Enviar otra consulta" | ✅ Completo | Reset sin recargar página |
| PDF Lead Magnet — descarga inmediata post-submit | ✅ Completo (2026-05-04) | `public/5-flujos-clave-pymes.html` — **escala a PDF dinámico personalizado en Fase B** |
| Antispam honeypot `_hp` | ✅ Completo | Form + CF Function |
| Accesibilidad A11y (WCAG 2.1 AA) | ✅ Completo | aria-label, aria-expanded, aria-controls, useId |
| Privacidad / Términos (modales) | ✅ Completo | Desde footer, sin react-router |
| Evento GA4 `form_submit` | ✅ Completo | Solo si `VITE_GA_ID` definido |
| Eventos secundarios GA4 (CTA clics, scroll depth) | ✅ Completo (2026-05-04) | W-011 — `cta_click` + `scroll_depth` 25/50/75/100% |
| WhatsApp flotante — 2 botones | ✅ Completo | Venezuela `+58 04143151406` / Chile `+56 964862862` |
| Email `contacto@jaagsolutions.com` visible en UI | ✅ Completo (2026-05-05) | Footer + sección Contacto |
| Responsive (mobile / tablet / desktop) | ✅ Completo | |
| SEO: title + meta description + Open Graph | ✅ Completo | |
| Aurora / animaciones background | ✅ Completo | |

---

## ENTREGABLE 3 — Deploy y Producción

### Archivos de infraestructura en repo

| Archivo | Estado |
|---------|--------|
| `deploy/.env.production.example` | ✅ Completo |
| `deploy/docker-compose.yml` | ✅ Completo — Paperclip + PostgreSQL 16 + n8n 1.112.6 + Caddy |
| `deploy/Caddyfile` | ✅ Completo |
| `deploy/setup.sh` | ✅ Completo |
| `deploy/scripts/get-paperclip-ids.sh` | ✅ Completo |
| `deploy/n8n-workflows/formspree-to-paperclip.json` | ✅ Completo |
| `deploy/RUNBOOK.md` | ✅ Completo |
| `jaagsolutions-web/DEPLOY-CLOUDFLARE.md` | ✅ Completo |
| `docs/superpowers/specs/BITACORA-INFRAESTRUCTURA.md` | ✅ Completo (2026-05-05) |

### Fase A — Live en `jaagsolutions.com` ✅ COMPLETO

| Item | Estado | Notas |
|------|--------|-------|
| Cuenta Formspree creada | ✅ Completo | Form ID `xpqbzolp` — cuenta `inverjaag@gmail.com` |
| Repo `JAAG2021/jaagsolutions-paperclip` (privado) | ✅ Existe | Branch `feature/jaagsolutions` → despliega en CF Pages |
| Proyecto Cloudflare Pages `jaagsolutions-paperclip` | ✅ Completo (2026-05-04) | Build: `npm install && npm run build` / Root: `jaagsolutions-web` |
| `VITE_FORMSPREE_ID=xpqbzolp` en Cloudflare env vars | ✅ Completo | |
| Deploy exitoso | ✅ Completo (2026-05-04) | `https://jaagsolutions-paperclip.pages.dev` |
| Prueba E2E formulario → Formspree submissions | ✅ Confirmado (2026-05-04) | Llegó a Inbox (con Origin fix) |
| Dominio `jaagsolutions.com` registrado | ✅ Completo (2026-05-05) | Registrar: Hostinger — $10.46/año |
| Nameservers Hostinger → Cloudflare | ✅ Completo (2026-05-05) | `kellen.ns.cloudflare.com` + `magnolia.ns.cloudflare.com` |
| `jaagsolutions.com` zona activa en Cloudflare | ✅ Completo (2026-05-05) | Plan Free |
| `www.jaagsolutions.com` → Custom Domain CF Pages | ✅ Completo (2026-05-05) | SSL habilitado |
| `jaagsolutions.com` (apex) → Custom Domain CF Pages | ✅ Completo (2026-05-05) | SSL habilitado |
| Formspree notificaciones → `jaagsolutions@gmail.com` | ✅ Completo (2026-05-05) | Workflow → Actions → Email |
| Cloudflare Email Routing activado | ✅ Completo (2026-05-05) | `contacto@jaagsolutions.com` → `jaagsolutions@gmail.com` |
| Formshield en Formspree | ✅ Ya estaba desactivado (confirmado 2026-05-04) | Honeypot `_hp` cubre protección |
| Configurar `VITE_GA_ID` en Cloudflare | ✅ Completo (2026-05-07) | GA4 Property `G-K92KJ1FRMH` — cuenta `inverjaag@gmail.com` |
| Configurar `VITE_SITE_URL` en Cloudflare | ✅ Completo (2026-05-07) | Valor: `https://jaagsolutions.com` |

### Fase B — VPS + Automatización

| Item | Estado |
|------|--------|
| VPS Google Cloud (90 días free trial disponible) | ✅ Completo (2026-05-06) — VM `jaagsolutions-vps` e2-medium Ubuntu 22.04 LTS — IP externa `34.41.171.138` |
| Subdominio `app.jaagsolutions.com` → IP VM (Cloudflare DNS) | ✅ Completo (2026-05-06) — registro A `app` → `34.41.171.138` DNS only |
| Ejecutar `deploy/setup.sh` en VPS | ✅ Completo (2026-05-06) — Docker 29.4.2 + 4 contenedores healthy |
| Variables en `deploy/.env` | ✅ Completo (2026-05-06) — secretos generados con openssl, FORMSPREE_FORM_HASHID=xpqbzolp |
| Correr seed Paperclip en producción | ✅ Completo (2026-05-06) — 17 creados, 2 actualizados. Company ID: `113d415c-9970-413f-b0d8-f7a6217caf67` |
| Obtener IDs con `get-paperclip-ids.sh` | ✅ Completo (2026-05-06) — Company, A3 Agent, P2 Project, G2 Goal IDs obtenidos y en `.env` |
| Configurar webhook Formspree → n8n | ✅ Completo (2026-05-06) — Formspree webhook requiere plan Premium; bypass via CF Function (`functions/api/lead.js`) que postea directamente a n8n con `x-paperclip-webhook-token` |
| Importar workflow n8n (`formspree-to-paperclip.json`) | ✅ Completo (2026-05-06) — importado desde `/opt/jaagsolutions/repo/deploy/n8n-workflows/` |
| Activar workflow n8n | ✅ Completo (2026-05-06) — workflow activo en `https://n8n.jaagsolutions.com` |
| Prueba E2E completa: formulario → Formspree → n8n → issue Paperclip | ✅ Completo (2026-05-06) — issue JAAG-2 creado en Paperclip asignado a Growth Ops (A3) |

---

## REFERENCIA DE DOCUMENTOS

| Documento | Ubicación |
|-----------|-----------|
| **Bitácora de infraestructura** | [`docs/superpowers/specs/BITACORA-INFRAESTRUCTURA.md`](./BITACORA-INFRAESTRUCTURA.md) |
| Diseño spec principal | [`docs/superpowers/specs/2026-04-16-jaagsolutions-design.md`](./2026-04-16-jaagsolutions-design.md) |
| Plan implementación landing | [`docs/superpowers/plans/2026-04-16-jaagsolutions-web-landing.md`](../plans/2026-04-16-jaagsolutions-web-landing.md) |
| Plan implementación seed | [`docs/superpowers/plans/2026-04-16-jaagsolutions-paperclip-seed.md`](../plans/2026-04-16-jaagsolutions-paperclip-seed.md) |
| Runbook VPS | [`deploy/RUNBOOK.md`](../../../deploy/RUNBOOK.md) |
