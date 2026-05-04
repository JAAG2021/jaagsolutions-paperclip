# Checklist Maestro — Proyecto JAAGSOLUTIONS
**Revisión:** 2026-05-04  
**Rama:** `feature/jaagsolutions`  
**Regla:** LEER ESTE ARCHIVO AL INICIO DE CADA SESIÓN antes de proponer cualquier tarea. Actualizar inmediatamente al completar cada item.

---

## PROTOCOLO DE SESIÓN

**Al iniciar conversación:** Claude lee este archivo primero. No propone tareas ya completadas.  
**Al completar una tarea:** Actualizar este checklist en el mismo commit o inmediatamente después.  
**El usuario confirma manualmente:** Marcar con ✅ + fecha cualquier acción hecha fuera del código (Cloudflare, DNS, cuentas, etc.).

---

## RESUMEN EJECUTIVO — 2026-05-04

| Entregable | Estado | % Completo |
|-----------|--------|-----------|
| Seed Paperclip | Código listo, ejecución en prod pendiente (Fase B) | 80% |
| Landing Web (código) | **Completo** — formulario 4 pasos + PDF + antispam + A11y + legales | 100% |
| Landing Web (deploy) | **LIVE** — `jaagsolutions-paperclip.pages.dev` — E2E confirmado ✅ | 100% |
| Infraestructura VPS / n8n | Docs listos, provisión pendiente (Fase B) | 30% |

---

## PRÓXIMOS PASOS — ordenados por prioridad

### Inmediatos (código)
1. **[W-011]** Eventos secundarios GA4 — track clics CTA, scroll depth (P1)

### Acciones manuales (tú)
2. **[TÚ]** Dominio `www.jaagsolutions.com` → Custom Domain en Cloudflare Pages
3. **[TÚ]** Desactivar **Formshield** en Formspree (Settings → toggle off) para evitar spam falso positivo, ya que el honeypot `_hp` cubre la protección desde el servidor

### Futuro — Fase B (requiere VPS)
4. Contratar VPS con IP estable
5. DNS apex + www apuntando a VPS / Cloudflare
6. Ejecutar `deploy/setup.sh` + variables `.env`
7. Correr seed Paperclip en producción
8. Configurar webhook Formspree → n8n + importar workflow
9. Prueba E2E completa: formulario → Formspree → n8n → issue Paperclip

### Escalabilidad futura (post-Fase B)
- **Formulario Paso 4:** conectar `diagnostico_express` con agente IA (Claude/GPT via n8n) para generar propuesta de automatización personalizada y enviarla por email al cliente automáticamente
- **PDF Lead Magnet:** evolucionar de PDF estático a PDF dinámico generado con datos del formulario (nombre, empresa, `dolor_proceso` → flujo sugerido específico al negocio)

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
- [ ] **PENDIENTE (Fase B):** Correr el seed con Paperclip activo en producción y verificar:
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
| `functions/api/lead.js` (Cloudflare Pages Function — proxy Formspree) | ✅ Completo — forwarding Origin header anti-spam |
| `api/lead.js` (legacy Vercel — referencia) | ✅ Completo |
| `DEPLOY-CLOUDFLARE.md` | ✅ Completo |
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
| `ContactFormSection.tsx` | ✅ Completo | **4 pasos** — paso 4 opcional diagnóstico express |
| `FaqSection.tsx` | ✅ Completo | Accordion smooth + 6 FAQs |
| `FinalCtaSection.tsx` | ✅ Completo | fondo brand-900 |
| `FooterSection.tsx` | ✅ Completo | Nav + modales legales |
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
| Eventos secundarios GA4 (CTA clics, scroll depth) | ❌ Pendiente — P1 | W-011 |
| WhatsApp flotante — 2 botones | ✅ Completo | Venezuela `+58 04143151406` / Chile `+56 964862862` |
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

### Fase A — Live en Cloudflare Pages ✅

| Item | Estado | Notas |
|------|--------|-------|
| Cuenta Formspree creada | ✅ Completo | Form ID `xpqbzolp` |
| Repo `JAAG2021/jaagsolutions-paperclip` (privado) | ✅ Existe | |
| Proyecto Cloudflare Pages `jaagsolutions-paperclip` | ✅ Completo (2026-05-04) | Build: `npm install && npm run build` |
| `VITE_FORMSPREE_ID=xpqbzolp` en Cloudflare env vars | ✅ Completo | |
| Deploy exitoso | ✅ Completo (2026-05-04) | `https://jaagsolutions-paperclip.pages.dev` |
| Prueba E2E formulario → Formspree submissions | ✅ Confirmado (2026-05-04) | Llegó a Inbox (con Origin fix) |
| Dominio `www.jaagsolutions.com` → Custom Domain Cloudflare | ❌ Pendiente | Acción manual — post-DNS |
| Desactivar Formshield en Formspree | ❌ Pendiente | Para evitar falsos positivos — honeypot ya protege |
| Configurar `VITE_GA_ID` en Cloudflare | ⬜ Opcional | |
| Configurar `VITE_SITE_URL` en Cloudflare | ⬜ Opcional | Mejora og:url SEO |

### Fase B — VPS + Automatización

| Item | Estado |
|------|--------|
| Contratar VPS con IP estable | ❌ Pendiente |
| Configurar DNS (apex + www) | ❌ Pendiente |
| Ejecutar `deploy/setup.sh` en VPS | ❌ Pendiente |
| Variables en `deploy/.env` | ❌ Pendiente |
| Correr seed Paperclip en producción | ❌ Pendiente |
| Obtener IDs con `get-paperclip-ids.sh` | ❌ Pendiente |
| Configurar webhook Formspree → n8n | ❌ Pendiente |
| Importar workflow n8n (`formspree-to-paperclip.json`) | ❌ Pendiente |
| Activar workflow n8n | ❌ Pendiente |
| Prueba E2E completa: formulario → Formspree → n8n → issue Paperclip | ❌ Pendiente |

---

## TAREAS P1 DIFERIDAS (código)

| Tarea | Prioridad | Descripción |
|-------|-----------|-------------|
| W-011 Eventos secundarios GA4 | **P1 — PRÓXIMO** | Track clics CTA, scroll depth 25/50/75/100% |

---

## REFERENCIA DE DOCUMENTOS

| Documento | Ubicación |
|-----------|-----------|
| Diseño spec principal | [`docs/superpowers/specs/2026-04-16-jaagsolutions-design.md`](./2026-04-16-jaagsolutions-design.md) |
| Plan implementación landing | [`docs/superpowers/plans/2026-04-16-jaagsolutions-web-landing.md`](../plans/2026-04-16-jaagsolutions-web-landing.md) |
| Plan implementación seed | [`docs/superpowers/plans/2026-04-16-jaagsolutions-paperclip-seed.md`](../plans/2026-04-16-jaagsolutions-paperclip-seed.md) |
| Checklist producción (Fase A/B) | [`docs/superpowers/specs/2026-04-30-jaagsolutions-produccion-checklist.md`](./2026-04-30-jaagsolutions-produccion-checklist.md) |
| Runbook VPS | [`deploy/RUNBOOK.md`](../../../deploy/RUNBOOK.md) |
