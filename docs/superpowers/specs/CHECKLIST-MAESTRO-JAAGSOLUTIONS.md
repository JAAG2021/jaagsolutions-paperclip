# Checklist Maestro — Proyecto JAAGSOLUTIONS
**Revisión:** 2026-05-20
**Rama:** `feature/jaagsolutions`
**Regla:** LEER ESTE ARCHIVO AL INICIO DE CADA SESIÓN antes de proponer cualquier tarea. Actualizar inmediatamente al completar cada item.

**DOCS-FIRST:** Antes de cualquier cambio en infraestructura o workflows, leer en orden:
1. Este checklist (estado actual + tareas pendientes)
2. `BITACORA-INFRAESTRUCTURA.md` (decisiones + 18+ gotchas históricos resueltos)
3. `deploy/RUNBOOK.md` (procesos validados, sección 1.bis para imports con credenciales)
4. `CONTENT_PIPELINE_SOURCE_OF_TRUTH.md` (fuente canonica del pipeline de contenido)
5. `2026-05-25-jaagsolutions-production-sync-design.md` (modelo operativo v2 para agentes + sincronizacion Paperclip)

---

## ACTUALIZACION OPERATIVA — 2026-06-15

- `compose-image.js` desplegado en contenedor con mapa `SVGICONS`: nodos periféricos del diagrama hub-and-spoke muestran iconos SVG reconocibles (IG, LI, FB, WA, TK, MAIL, GS, CAL, CRM) en lugar de abreviaciones de texto. Escala con `transform="translate(x,y) scale(nodeR/10)"`. Commit `ee6a9c0c5`.
- **Vertical seguros implementada:** columna `vertical TEXT NOT NULL DEFAULT 'jaagsolutions_core'` agregada a `content_plan` (aditiva, nada existente se rompe). Primer post piloto insertado para 2026-06-16 Martes 10:00 (`vertical='seguros_servicio'`, Concepto A — foto editorial corredor latino, oficina moderna, luz ámbar).
- Carril Martes/Jueves confirmado libre (0 filas en 8 fechas objetivo). Trigger `0 8 * * *` corre todos los días — Martes y Jueves funcionan sin cambios en workflow.
- SSH `authorized_keys`: llave `~/.ssh/jaagsolutions_vps` registrada en VPS. SCP desde Windows funciona via alias `jaagsolutions-vps`. Usar siempre `scp ... jaagsolutions-vps:~/archivo` (no IP directa).
- Sesión 2026-06-12: fixes `parse_mode`, `continueOnFail`, scene pool social_proof, composición diagrama (commits `0753cdd92`–`482e9a65f`).
- Sesión 2026-06-04: seed `content_plan` con posts de marketing automation Jun-Jul 2026 (commit `88bce38c1`).

**Próxima sesión — verificar:**
1. Post seguros 16-jun llegó a Telegram y fue aprobado/publicado
2. Cargar siguientes piezas del carril Martes (23-jun, 30-jun, 07-jul) en `content_plan`
3. Decidir cadencia Martes solo vs Martes+Jueves para seguros

---

## ACTUALIZACION OPERATIVA - 2026-05-25

Se corrige la desincronizacion entre Paperclip y la realidad productiva:

- `Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json` ahora refleja 5 agentes, 6 goals, 4 proyectos y 21 issues.
- Se agrega el proyecto `P4 - Content Automation Production Ops`.
- A4 `Social & Content Lead` queda obligado por capabilities a respetar el workflow `content_plan -> Content Generator -> Telegram Approval -> Meta + LinkedIn Publisher`.
- El pipeline de contenido queda reconocido como `done` con issue historico: `Pipeline automatizado de contenido - Meta + LinkedIn + Telegram approval`.
- Los issues vivos ahora son operativos: calendario editorial, health diario de n8n, sync semanal Paperclip, reporte semanal de contenido/leads, prevalidacion de `content_plan`, aprobacion humana Telegram y hardening 2026-05-20.
- La fuente operacional unica del calendario de contenido es PostgreSQL `content_plan`. No mantener agendas paralelas fuera de `content_plan`.
- El documento rector de esta sincronizacion es `docs/superpowers/specs/2026-05-25-jaagsolutions-production-sync-design.md`.

**Regla nueva:** antes de crear tareas de contenido, revisar si el trabajo debe entrar como registro en `content_plan`, como issue de P4 o como incidente en `BITACORA-INFRAESTRUCTURA.md`. No duplicar issues de setup ya cerrados.

## PROTOCOLO DE SESIÓN

**Al iniciar conversación:** Claude lee este archivo primero. No propone tareas ya completadas.  
**Al completar una tarea:** Actualizar este checklist en el mismo commit o inmediatamente después.  
**El usuario confirma manualmente:** Marcar con ✅ + fecha cualquier acción hecha fuera del código (Cloudflare, DNS, cuentas, etc.).  
**CRÍTICO:** Leer también [`BITACORA-INFRAESTRUCTURA.md`](./BITACORA-INFRAESTRUCTURA.md) antes de cualquier cambio de infraestructura.

---

## ✅ ESTADO ACTUAL — CIERRE 2026-05-20

**Pipeline E2E en producción con posts reales.** Posts May 18 (`ef340765`, casos_de_uso), May 20 (`9f513b84`, behind_the_scenes) y May 21 (`9dd90ed3`, educacion) publicados via pipeline completo. El post May 20 falló primero por OCR (`status=error`), se reintentó con prompt visual más seguro, llegó a Telegram, fue aprobado y quedó publicado en las tres redes. Auditoria 2026-05-25: `content_plan` no tenia filas futuras `pending`; toda agenda nueva debe insertarse en `content_plan`.

**Cambios desplegados sesión 2026-05-18 (commits):**

- `c7f5f923` — fix(n8n): pillarMap alineado con valores DB (`casos_de_uso`, `prueba_social`, `behind_the_scenes`)
- `73469488` — fix(n8n): negative_prompt Ideogram extendido para suprimir brand text/signage

**Cambios desplegados sesión 2026-05-17 (commits):**

- `2dd41281` — Fase 1: diversidad de imágenes (Auditor con 32 escenas, Ideogram seed + style_type, V_2)
- Cadenas previas: telegram-approval secuencial FB → IG → LinkedIn, multipart binary FB, LinkedIn Asset Upload nativo, IG container 5s wait, compose-image.js sin labels parásitos, ASPECT_3_4 unificado.

**Workflow IDs activos en n8n (no cambiar — webhooks dependen de ellos):**

- Content Generator: `diB9nJOsjSzYbujt`
- Telegram Approval → Publisher: `EAfkZIDiZ1KqTPmJ`
- Formspree Lead → Paperclip Issue: `wGBj1gkmy1JoBfGP`

**Próxima sesión — leer en orden:**

1. Este checklist (sección "PIPELINE AUTOMATIZADO DE CONTENIDO" + "Pendientes Fase 2")
2. `BITACORA-INFRAESTRUCTURA.md` → sesión 2026-05-17 (FALLAS 22–30 + reglas operativas reforzadas)
3. `deploy/RUNBOOK.md` → para cualquier comando operativo
4. `feedback-reset-post-prueba.md` (memoria) — siempre resetear post antes de Execute Workflow

**Comando de reset standard (memorizar):**

```bash
docker exec deploy-postgres-1 sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "UPDATE content_plan SET status='\''pending'\'', image_url=NULL, retry_count=0, error_log=NULL WHERE id='\''<POST_ID>'\'';"' && rm -f /opt/jaagsolutions/content/<POST_ID>.jpg
```

---

---

## RESUMEN EJECUTIVO — 2026-05-17

| Entregable | Estado | % Completo |
|-----------|--------|-----------|
| Seed Paperclip | **Completo + sincronizado v2** — 5 agentes, 6 goals, 4 proyectos, 21 issues en producción/sync pendiente de aplicar si Paperclip no fue re-seedeado ✅ (2026-05-25) | 100% |
| Landing Web (código) | **Completo** — formulario 4 pasos + PDF + antispam + A11y + legales + email contacto | 100% |
| Landing Web (deploy) | **LIVE** — `jaagsolutions.com` + SSL + GA4 activo ✅ (2026-05-07) | 100% |
| Dominio + DNS | **Completo** — Hostinger → Cloudflare NS + Custom Domains activos ✅ | 100% |
| Email corporativo | **Completo** — routing `contacto@jaagsolutions.com` → Gmail ✅ | 100% |
| Infraestructura VPS / n8n | **Completo** — VPS + Docker + n8n + workflow activo + E2E verificado ✅ (2026-05-06) | 100% |
| Agente Marketing (A4) | **Completo + reforzado** — Social & Content Lead creado y actualizado con mandato obligatorio de workflow de contenido ✅ (2026-05-25) | 100% |
| Auditoría seguridad + bugs | **Completo** — 2 críticos + 4 importantes + 4 menores corregidos ✅ (2026-05-07) | 100% |
| A4 apply_patch fix | **Completo** — `codex-run.sh` con `--dangerously-bypass-approvals-and-sandbox` ✅ (2026-05-10) | 100% |
| Estrategia contenido Mes 1 | **Completo** — estrategia + blog + pauta editorial generados por A4 ✅ (2026-05-10) | 100% |
| Perfiles sociales | **Completo** — LinkedIn ✅ Instagram ✅ Facebook Business ✅ (2026-05-11) | 100% |
| Meta Semana 1 programada | **Completo** — 3 posts FB+IG programados en Meta Business Suite ✅ (2026-05-11) | 100% |
| Pipeline automatizado contenido | **LIVE E2E** — Content Generator (Ideogram V_2 + Auditor con 32 escenas + seed/style_type aleatorio + compose-image 4:5) → Telegram approval → publicación FB + IG + LinkedIn con imagen nativa + copy + hashtags concatenados. Validado 2026-05-17. | 100% |
| Diversidad visual (Fase 1) | **Completo** — Code node `Preparar prompt Auditor` con 32 variantes, Ideogram seed + style_type rotativo, modelo V_2. Commit `2dd41281` ✅ | 100% |
| pillarMap DB alignment | **Completo** — aliases `casos_de_uso`, `prueba_social`, `behind_the_scenes` añadidos al pillarMap. Commit `c7f5f923` ✅ (2026-05-18) | 100% |
| negative_prompt Ideogram | **Completo** — extendido con brand names, store signs, product labels, background text, environmental signage, fake brand text, decorative lettering. Commit `73469488` ✅ (2026-05-18) | 100% |
| Semana 2 Meta (May 18-21) | **Completo con observacion** — posts May 18, May 20 y May 21 publicados. Auditoria 2026-05-25 detecto duplicado May 21 y ausencia de filas futuras en `content_plan`. | 100% |

---

## BRAND & CONTENT MVP — Estado (2026-05-11)

### Issues completados

| Issue | Título | Estado |
|-------|--------|--------|
| `c1e1c24a` | Definir estrategia de contenido y calendario editorial — Mes 1 | ✅ Done (2026-05-10) |
| `4ada1270` | Configurar perfiles LinkedIn e Instagram de JAAGSOLUTIONS | ✅ Done (2026-05-10) |
| `c8de442` | Producir primeras 8 piezas de contenido LinkedIn | ✅ Done (2026-05-11) |

### Artefactos generados por A4

| Archivo | Ubicación | Estado |
|---------|-----------|--------|
| Estrategia + spec Mes 1 | `docs/superpowers/specs/2026-05-10-brand-content-mes1-estrategia-design.md` | ✅ Completo |
| Fuente canonica pipeline contenido | `docs/superpowers/specs/CONTENT_PIPELINE_SOURCE_OF_TRUTH.md` | ✅ Canonico |
| Blog post 1 | `/opt/jaagsolutions/repo/docs/content/blog/2026-05-12-automatizar-pyme.md` (VPS) | ✅ Completo |

### Perfiles sociales

| Canal | Estado | Cuenta |
|-------|--------|--------|
| LinkedIn | ✅ Creado | `jaagsolutions@gmail.com` |
| Instagram | ✅ Creado | `jaagsolutions@gmail.com` |
| Facebook Business | ✅ Creado + conectado a Meta Business Suite | `jaagsolutions@gmail.com` |

### Estrategia de publicación (activa)

| Canal | Herramienta | Frecuencia |
|-------|-------------|------------|
| LinkedIn | Native scheduler + cuenta personal Juan A. | Lunes/Jueves |
| Instagram | Meta Business Suite Planificador | Mar/Jue/Vie |
| Facebook | Meta Business Suite Planificador (republica IG) | Mar/Jue/Vie |

### Contenido programado Semana 1 (Meta)

| Post | Fecha | Hora | Plataforma |
|------|-------|------|------------|
| Infografía "¿Cuántas horas?" | Mar 12 mayo | 10:00 AM | FB + IG |
| Antes/Después "4h → 20 min" | Jue 14 mayo | 4:00 PM | FB + IG |
| Somos JAAGSOLUTIONS | Vie 15 mayo | 11:00 AM | FB + IG |

### Regla de agenda de contenido

`content_plan` es la unica agenda operacional. Si una publicacion no existe en `content_plan`, no esta agendada para el pipeline.

### Contenido programado Semana 2 (Meta — pipeline automatizado)

| Post | Fecha | Hora | Pilar DB | Status | ID content_plan |
| ------ | ------- | ------ | ---------- | -------- | ----------------- |
| Casos de Uso — "De 3h a 18 min: facturación automática" | Mar 18 mayo | 11:00 | `casos_de_uso` | ✅ published | `ef340765-704a-41a7-8793-8b992ba59830` |
| Behind-the-Scenes — "Así luce un workflow antes de llegar al cliente" | Mier 20 mayo | 08:00 | `behind_the_scenes` | ✅ published | `9f513b84-0f10-4715-a9e3-5b85a968070a` |
| Educación — "Automatizar no es para grandes. Es para los que crecen." | Jue 21 mayo | 11:00 | `educacion` | ✅ published | `9dd90ed3-ea31-4f0d-a9dc-cdb77a1202b1` |

### Próximos pasos Brand & Content

1. [x] ~~**PRIORIDAD MÁXIMA** — Implementar pipeline automatizado de contenido~~ ✅ LIVE 2026-05-17
2. [ ] Cargar proximas publicaciones directamente en `content_plan` con `status=pending`
3. [x] ~~Generar imágenes + copy para Semana 2 Meta (18, 20, 21 mayo)~~ ✅ Insertados + publicados 2026-05-18/20/21
4. [ ] Configurar adaptador Codex para A3 (Growth Ops) — mismo proceso que A4
5. [ ] Desplegar hardening content pipeline 2026-05-20: alerta OCR confiable, fallback visual seguro, monitor post-cron 08:15 y CTA/link en captions. Patch local en `content-generator.json` + `telegram-approval.json`; falta importar en n8n producción y validar.
6. [ ] Agregar alerta si `content_plan` no tiene publicaciones futuras `pending` en los proximos 14 dias.

---

## PIPELINE AUTOMATIZADO DE CONTENIDO — Diseño histórico (implementado)

**Agente responsable:** A2 (Automation Builder)  
**Herramienta:** n8n  
**Estado:** ✅ Implementado y operativo desde 2026-05-17. Mantener esta sección como referencia histórica; el estado real vive en "Estado actual", "Semana 2 Meta" y `BITACORA-INFRAESTRUCTURA.md`.

### Flujo objetivo

```
A4 inserta registros en content_plan (copy + prompts de imagen)
            ↓
n8n llama Ideogram API → genera imagen
            ↓
n8n llama Google Vision API (OCR)
→ extrae texto de la imagen
→ valida contra el contenido esperado de `content_plan`
→ si errores → regenera automáticamente (máx 3 intentos)
            ↓
n8n envía imagen + copy a Telegram (bot)
"Revisa este post para [fecha]. ¿Aprobamos?"
[✅ Aprobar] [❌ Regenerar]
            ↓
Juan aprueba desde móvil (único paso manual)
            ↓
n8n programa en Meta Graph API (FB + IG)
n8n programa en LinkedIn API
            ↓
Post publicado automáticamente en fecha/hora
```

### APIs requeridas

| Servicio | Uso | Costo aproximado |
|---------|-----|-----------------|
| Ideogram API | Generación de imágenes con texto | ~$0.08/imagen |
| Google Vision API | OCR validación texto en imagen | Free tier 1000/mes |
| Telegram Bot API | Checkpoint aprobación | Gratis |
| Meta Graph API | Programar FB + Instagram | Gratis |
| LinkedIn API | Programar posts | Gratis (con app registrada) |

### Issue histórico de A2

> **Título:** "Pipeline automatizado de contenido — Meta + LinkedIn + Telegram approval"
>
> **Descripción:** Construir workflow n8n que: lea `content_plan` → genere imágenes vía Ideogram API → valide texto con OCR (Google Vision) → envíe checkpoint de aprobación vía Telegram bot → publique en Meta Graph API + LinkedIn API según `scheduled_date` y `scheduled_time`. Un solo paso manual: aprobación de imagen en Telegram.

---

## PRÓXIMOS PASOS — ordenados por prioridad

### Actualizar workflows n8n

**Proceso validado actual:** import manual por CLI desde el VPS. La REST API de n8n sigue bloqueada por `N8N_BASIC_AUTH_ACTIVE=true` y devuelve 401; no confiar en `sync-n8n.yml` hasta resolver ese punto en una sesión separada.

Para aplicar el JSON actualizado:

```bash
# En máquina local:
cd paperclip/.worktrees/jaagsolutions
git add deploy/n8n-workflows/ docs/superpowers/specs/
git commit -m "fix(n8n): harden content pipeline recovery"
git push jaag2021 feature/jaagsolutions

# En VPS:
cd /opt/jaagsolutions/repo
git pull origin feature/jaagsolutions
# Seguir deploy/RUNBOOK.md sección 1.bis para importar workflows con credenciales.
```

### Opcionales

- **Configurar API key Anthropic en Paperclip** → habilita ejecución autónoma de agentes (`Settings → AI Provider`)
- **Fase escalabilidad:** conectar `diagnostico_express` con agente IA (Claude via n8n) para propuesta personalizada por email
- **PDF dinámico:** evolucionar lead magnet de estático a generado con datos del formulario

---

## ENTREGABLE 1 — Seed de Paperclip

### Archivos en repo

| Archivo | Estado |
|---------|--------|
| `Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json` | ✅ Completo — company, 5 agentes (A0–A4), 6 goals, 4 proyectos, 21 issues |
| `packages/db/src/seed-jaagsolutions.ts` | ✅ Completo — loader idempotente con upserts |
| `packages/db/package.json` → script `seed:jaagsolutions` | ✅ Completo |
| `package.json` (root) → script `db:seed:jaagsolutions` | ✅ Completo |

### Criterios de aceptación

- [x] Archivo JSON con estructura completa (company/agents/goals/projects/issues)
- [x] Loader TypeScript con upserts idempotentes
- [x] Script `pnpm db:seed:jaagsolutions` configurado
- [x] ✅ Company JAAGSOLUTIONS visible en UI de Paperclip (2026-05-07)
- [x] ✅ 5 agentes con jerarquía correcta (CEO → PM → Engineer; CEO → Growth Ops → Social Lead)
- [x] ✅ 6 goals con parentId correcto
- [x] ✅ 4 proyectos con lead asignado (P1 Delivery, P2 Demand Engine, P3 Brand & Content, P4 Content Automation Production Ops)
- [x] ✅ 21 issues distribuidos correctamente
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

## PIPELINE AUTOMATIZADO DE CONTENIDO — Fase 2 (pendiente)

**Estado Fase 1:** ✅ Completo (2026-05-17) — generación + aprobación + publicación E2E funcionando, diversidad visual aplicada.

**Fase 2 — tareas en backlog:**

- [x] **A4 debe poblar `hashtags` en `content_plan`** — ✅ Completado 2026-05-17: spec de A4 actualizado con tabla de hashtags por pilar, seed re-corrido vía `docker cp` (ver FALLA 31 en BITACORA), backfill SQL ejecutado (`UPDATE 1`). A4 ahora tiene capabilities actualizadas en Paperclip y todos los posts existentes tienen hashtags poblados.
- [x] **OCR post-generación (Fix #7 deferred)** — ✅ Completado 2026-05-17: nodo HTTP de Ideogram reemplazado por Code node `Ideogram + OCR — 3 intentos` (Google Vision TEXT_DETECTION, fail-open). Rama de error agrega `status=error` en DB; la notificación Telegram de errores OCR quedó identificada como bug separado (ver pendiente `Telegram OCR error`). Workflow transplantado a producción (23 nodos). E2E verificado: imagen llegó a Telegram con `status=review`, sin texto baked-in. Commit `f7cd5f34`.
- [x] **Calidad visual — evitar uncanny valley en personajes** — ✅ Completado + verificado E2E 2026-05-18. (A) `negative_prompt` del Code node `Ideogram + OCR — 3 intentos` actualizado vía REST API + commit `ad24f030`. (B) Spec A4 con sección `COMPOSICION VISUAL` + formato obligatorio 3 bloques para `copy_text` (HEADLINE ≤60 chars / CUERPO / CTA). (C) `compose-image.js`: imagen solo muestra headline (strip defensivo `/#\S+/g` — commit `c58c67be`), hashtags solo en caption. E2E verificado: imagen limpia, headline sin hashtags, caption con hashtags clickeables.
- [ ] **Variety enforcement DB-side** — crear tabla `content_history` o columna `last_scene_variant` en `content_plan` para evitar repetir la misma escena en ventana de 14 días. Hoy la selección es random pura, sin memoria.
- [ ] **A4 enriched image_prompt** — actualizar el spec del agente A4 para que genere `image_prompt` más rico: contexto de pilar + audiencia objetivo + emoción + sujeto sugerido (no solo "Professional accounting services for small business").
- [ ] **Aspect ratio por plataforma** — hoy todos los formatos portrait usan ASPECT_3_4 (1080×1350). Para LinkedIn estricto podría preferirse 1:1, para reels 9:16. Diferir hasta que A4 genere posts específicos por plataforma.
- [ ] **Sync-n8n-workflows.sh PUT path bug** — el script de sync vía GitHub Actions tiene un bug en el path del PUT al API. Diferido — hoy se usa transplant manual vía REST API.
- [ ] **Limpiar test post fabricado** — `4a9a24b4-bb79-4a64-908b-7af12caf2d21` quedó publicado en FB/IG/LinkedIn como contenido de test. Si se quiere se puede eliminar de las redes (no urgente — el copy aclara que es test).

---

## REFERENCIA DE DOCUMENTOS

| Documento | Ubicación |
|-----------|-----------|
| **Bitácora de infraestructura** | [`docs/superpowers/specs/BITACORA-INFRAESTRUCTURA.md`](./BITACORA-INFRAESTRUCTURA.md) |
| Diseño spec principal | [`docs/superpowers/specs/2026-04-16-jaagsolutions-design.md`](./2026-04-16-jaagsolutions-design.md) |
| Plan implementación landing | [`docs/superpowers/plans/2026-04-16-jaagsolutions-web-landing.md`](../plans/2026-04-16-jaagsolutions-web-landing.md) |
| Plan implementación seed | [`docs/superpowers/plans/2026-04-16-jaagsolutions-paperclip-seed.md`](../plans/2026-04-16-jaagsolutions-paperclip-seed.md) |
| Runbook VPS | [`deploy/RUNBOOK.md`](../../../deploy/RUNBOOK.md) |
