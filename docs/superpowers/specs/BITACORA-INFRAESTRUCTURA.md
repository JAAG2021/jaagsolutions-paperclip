# Bitácora de Infraestructura — JAAGSOLUTIONS

**Última actualización:** 2026-05-08  
**Estado del proyecto:** Fase A + Fase B completas — producción activa

> **LEER ANTES DE CUALQUIER CAMBIO DE INFRAESTRUCTURA.**  
> Este documento describe el estado real, decisiones tomadas y advertencias críticas del proyecto. Evita duplicar trabajo y romper lo que ya funciona.

---

## 1. ARQUITECTURA GENERAL

```
Usuario
  │
  ├─► jaagsolutions.com (o www.jaagsolutions.com)
  │         │
  │         ▼
  │   Cloudflare CDN / DNS (zona: jaagsolutions.com, plan Free)
  │         │
  │         ▼
  │   Cloudflare Pages (proyecto: jaagsolutions-paperclip)
  │         │  Build: npm install && npm run build
  │         │  Root dir: jaagsolutions-web/
  │         │  Branch: feature/jaagsolutions
  │         │
  │         ├─► CF Pages Function: functions/api/lead.js
  │         │         │  (proxy anti-CORS + anti-spam)
  │         │         ▼
  │         │   Formspree API (form ID: xpqbzolp)
  │         │         │
  │         │         ▼
  │         │   jaagsolutions@gmail.com (notificaciones de leads)
  │         │
  │         └─► Static assets (React SPA + PDF lead magnet)
  │
  └─► contacto@jaagsolutions.com
            │
            ▼
      Cloudflare Email Routing (free)
            │
            ▼
      jaagsolutions@gmail.com
```

### Fase B (activa — Google Cloud VPS)

```
CF Function /api/lead.js
  │  fire-and-forget (context.waitUntil)
  ▼
n8n (VPS Google Cloud — https://n8n.jaagsolutions.com)
  │  webhook: /webhook/formspree-lead
  │  validación: x-paperclip-webhook-token (safeEqual XOR)
  ▼
Paperclip (crea issue automáticamente → Growth Ops A3)
  URL: https://paperclip.jaagsolutions.com
  Company ID: 113d415c-9970-413f-b0d8-f7a6217caf67
```

---

## 2. CUENTAS Y CREDENCIALES

| Servicio | Cuenta | Notas |
|---------|--------|-------|
| Cloudflare | `inverjaag@gmail.com` | Zona `jaagsolutions.com` + Pages `jaagsolutions-paperclip` |
| Formspree | `inverjaag@gmail.com` | Form ID `xpqbzolp` — notificaciones a `jaagsolutions@gmail.com` |
| GitHub (repo landing) | `JAAG2021` | `JAAG2021/jaagsolutions-paperclip` (privado) — branch `feature/jaagsolutions` |
| Hostinger (dominio) | cuenta propia | `jaagsolutions.com` — $10.46/año — nameservers apuntan a Cloudflare |
| Google Cloud | cuenta propia | 90 días free trial (desde 2026-05-06) — VM `jaagsolutions-vps` e2-medium IP `34.41.171.138` |
| Gmail notificaciones | `jaagsolutions@gmail.com` | Recibe leads de Formspree + emails de `contacto@jaagsolutions.com` |
| Gmail admin | `inverjaag@gmail.com` | Cuenta maestra Cloudflare/Formspree |

---

## 3. CLOUDFLARE — CONFIGURACIÓN DETALLADA

### Zona `jaagsolutions.com`

| Registro DNS | Tipo | Nombre | Contenido | Notas |
|-------------|------|--------|-----------|-------|
| Apex | CNAME | `@` | `jaagsolutions-paperclip.pages.dev` | CF Pages Custom Domain |
| WWW | CNAME | `www` | `jaagsolutions-paperclip.pages.dev` | CF Pages Custom Domain |
| App / VPS | A | `app` | `34.41.171.138` | DNS only — Paperclip + n8n |
| MX (email routing) | MX | `@` | `route1.mx.cloudflare.net` | Auto-creado por Email Routing |
| TXT (email routing) | TXT | `@` | `v=spf1 include:_spf.mx.cloudflare.net ~all` | Auto-creado |

**ADVERTENCIA:** No editar manualmente los registros DNS de `@` y `www` — son gestionados por Cloudflare Pages Custom Domains. Si se rompen, hay que ir a Workers & Pages → jaagsolutions-paperclip → Custom Domains y reactivar.

### Nameservers en Hostinger (no cambiar)

```
kellen.ns.cloudflare.com
magnolia.ns.cloudflare.com
```

### Cloudflare Pages — proyecto `jaagsolutions-paperclip`

| Parámetro | Valor |
|-----------|-------|
| GitHub repo | `JAAG2021/jaagsolutions-paperclip` |
| Branch de producción | `feature/jaagsolutions` |
| Root directory | `jaagsolutions-web` |
| Build command | `npm install && npm run build` |
| Output directory | `dist` |
| Custom domains | `jaagsolutions.com`, `www.jaagsolutions.com` |

**Variables de entorno en Cloudflare Pages (Settings → Environment Variables):**

| Variable | Valor | Entorno |
|----------|-------|---------|
| `VITE_FORMSPREE_ID` | `xpqbzolp` | Production |
| `VITE_GA_ID` | `G-K92KJ1FRMH` | Production |
| `VITE_SITE_URL` | `https://jaagsolutions.com` | Production |

### Cloudflare Email Routing

| Regla | Origen | Destino |
|-------|--------|---------|
| Custom address | `contacto@jaagsolutions.com` | `jaagsolutions@gmail.com` |

---

## 4. FORMSPREE — CONFIGURACIÓN

| Parámetro | Valor |
|-----------|-------|
| Form ID | `xpqbzolp` |
| Endpoint | `https://formspree.io/f/xpqbzolp` |
| Cuenta | `inverjaag@gmail.com` |
| Email notificaciones | `jaagsolutions@gmail.com` (Workflow → Actions → Email) |
| Formshield | **Desactivado** — el honeypot `_hp` cubre la protección |
| CAPTCHA | Desactivado |
| Mensual submissions | 50 (plan free) — 2/50 usados al 2026-05-05 |

**Por qué se usa un proxy (CF Function) en lugar de llamar Formspree directo:**  
Formspree requiere que el header `Origin` coincida con el dominio del formulario. Llamar desde el browser funciona, pero si se hace server-side sin `Origin`, Formshield lo marca como spam. El archivo `functions/api/lead.js` reenvía el `Origin` del browser a Formspree resolviendo este problema.

---

## 5. REPOSITORIO — ESTRUCTURA Y FLUJO DE DEPLOY

### Repos involucrados

| Repo | URL | Propósito |
|------|-----|-----------|
| Monorepo Paperclip | `Genesis-fenix/paperclip` (privado) | Framework base — rama `feature/jaagsolutions` contiene todo el proyecto JAAGSOLUTIONS |
| Repo deploy JAAGSOLUTIONS | `JAAG2021/jaagsolutions-paperclip` (privado) | Conectado a Cloudflare Pages — `feature/jaagsolutions` hace tracking aquí — GitHub Actions corren aquí |

### Cómo hacer deploy de cambios en la landing

**MÉTODO CORRECTO** (el `git subtree push` es muy lento — 2306 commits):

```bash
# 1. Hacer los cambios en el worktree
cd paperclip/.worktrees/jaagsolutions
# ... editar archivos en jaagsolutions-web/ ...
git add jaagsolutions-web/src/...
git commit -m "feat: descripción"

# 2. Clonar el repo de deploy en temp
git clone https://github.com/JAAG2021/jaagsolutions-paperclip.git /tmp/jaag-deploy
cd /tmp/jaag-deploy  # ya tiene branch feature/jaagsolutions por defecto

# 3. Copiar los archivos modificados
cp ../jaagsolutions-web/src/... src/...

# 4. Commit y push
git add src/...
git commit -m "feat: descripción"
git push origin feature/jaagsolutions

# 5. Cloudflare Pages detecta el push y despliega automáticamente (~2 min)
```

**POR QUÉ NO usar `git subtree push`:**  
El monorepo tiene 2306+ commits. `git subtree push` los procesa todos en el primer run, tardando 10-20 minutos. Solo es viable en CI con cache. Usar el método de clone directo para sesiones manuales.

### Estructura de `jaagsolutions-web/`

```
jaagsolutions-web/
├── functions/
│   └── api/
│       └── lead.js          ← CF Pages Function (proxy Formspree)
├── public/
│   ├── 5-flujos-clave-pymes.html  ← PDF Lead Magnet estático
│   ├── favicon.svg
│   └── og-share.png
├── src/
│   ├── App.tsx              ← Root: TopNav + Hero + lazy(AppBelowFold) + Footer + WhatsApp
│   ├── AppBelowFold.tsx     ← Lazy: todas las secciones below the fold
│   ├── components/          ← Componentes reutilizables
│   ├── hooks/               ← useAnalytics, useScrollDepth, useCountUp, useScrollReveal
│   └── sections/            ← Una sección por archivo
├── index.html               ← SEO base + OG tags + gtag script condicional
├── package.json             ← standalone (NO es workspace de pnpm)
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

**ADVERTENCIA CRÍTICA — pnpm workspace:**  
`jaagsolutions-web/` es un proyecto **standalone npm**, NO forma parte del workspace pnpm del monorepo. Si Cloudflare detecta el `pnpm-lock.yaml` de la raíz y usa pnpm, no instalará las dependencias de `jaagsolutions-web` y el build fallará. Por eso el Build Command es `npm install && npm run build` (fuerza npm).

---

## 6. ANTISPAM — CÓMO FUNCIONA

El formulario usa dos capas de protección:

1. **Honeypot `_hp`** — campo oculto en el HTML. Si un bot lo rellena, la CF Function devuelve 200 OK falso y descarta el envío silenciosamente.
2. **Origin forwarding** — la CF Function reenvía el header `Origin` del browser a Formspree, evitando que Formshield lo detecte como envío server-side (que sería spam).

**NO activar Formshield** — ya está desactivado. Si se activa, generará falsos positivos porque el proxy no tiene una IP de browser.

---

## 7. EMAIL — FLUJO COMPLETO

```
Lead llena formulario en jaagsolutions.com
  │
  ▼
CF Function /api/lead.js (proxy)
  │  reenvía Origin header
  ▼
Formspree (form xpqbzolp)
  │  notificación automática
  ▼
jaagsolutions@gmail.com  ← recibe el lead

Cliente escribe a contacto@jaagsolutions.com
  │
  ▼
Cloudflare Email Routing (free)
  │
  ▼
jaagsolutions@gmail.com  ← recibe el email
```

**Email corporativo de pago NO contratado** — Hostinger ofrece email por $0.39/mes. No está contratado. El reenvío gratuito de Cloudflare cubre las necesidades actuales.

---

## 8. DOMINIO — HISTORIAL DE DECISIONES

| Decisión | Alternativa descartada | Motivo |
|----------|----------------------|--------|
| Dominio independiente `jaagsolutions.com` | Compartir `inverjaag.com` | Marca separada, imagen profesional independiente |
| Registrar en Hostinger | Cloudflare Registrar | Hostinger ya tenía la cuenta y ofrecía buen precio |
| Nameservers → Cloudflare | DNS Hostinger con CNAME | Cloudflare gestiona todo: CDN, SSL, Email Routing, Pages |
| Email Routing Cloudflare (free) | Email corporativo Hostinger ($0.39/mes) | Reduce costos en etapa inicial |
| Gmail `jaagsolutions@gmail.com` | Email corporativo | Etapa inicial — suficiente para recibir leads |

---

## 9. ADVERTENCIAS CRÍTICAS — QUÉ NO HACER

### DNS
- ❌ NO cambiar nameservers de Hostinger — apuntan a Cloudflare y son la base de todo
- ❌ NO editar manualmente registros A/CNAME de `@` y `www` en Cloudflare — los gestiona CF Pages Custom Domains
- ❌ NO agregar registros MX propios — Email Routing los gestiona automáticamente

### Cloudflare Pages
- ❌ NO cambiar el Root Directory de `jaagsolutions-web` — el build fallará
- ❌ NO cambiar el Build Command de `npm install && npm run build` — si se quita el `npm install`, Cloudflare usa pnpm del monorepo y falla
- ❌ NO conectar el repo `Genesis-fenix/paperclip` directamente a CF Pages — es el monorepo base, no la landing

### Formspree
- ❌ NO activar Formshield — causa falsos positivos con el proxy
- ❌ NO cambiar el Form ID `xpqbzolp` en el código sin actualizar la variable de entorno en Cloudflare

### Código
- ❌ NO instalar dependencias en `jaagsolutions-web/` que requieran Node.js nativo — CF Pages usa el runtime de Cloudflare
- ❌ NO usar `react-router` — la landing es SPA de una sola página, los modales legales usan estado local

---

## 10. VPS — INFRAESTRUCTURA FASE B (ACTIVA)

### Estado actual ✅ Completo (2026-05-06)

| Componente | URL | Estado |
|-----------|-----|--------|
| VPS Google Cloud | IP `34.41.171.138` | e2-medium Ubuntu 22.04, Docker 29.4.2 |
| Paperclip | `https://paperclip.jaagsolutions.com` | 5 agentes, 5 goals, 3 proyectos, 13 issues |
| n8n | `https://n8n.jaagsolutions.com` | Workflow activo — Formspree Lead → Issue |
| Caddy | reverse proxy interno | SSL automático via Let's Encrypt |
| PostgreSQL | interno (puerto no expuesto) | Datos Paperclip |

### IDs Paperclip producción

| Recurso | ID |
|---------|-----|
| Company JAAGSOLUTIONS | `113d415c-9970-413f-b0d8-f7a6217caf67` |
| Agente A3 (Growth Ops) | `fd1aaf10-d7a4-4d86-97a6-0a00f736e217` |
| Proyecto P2 (Demand Engine) | `56e5f62f-ee8e-4555-9e85-27057574752d` |
| Goal G2 | `b2197151-59d5-4f16-b4d3-4223c18da417` |

### ⚠️ Pendiente: Reimportar workflow n8n

El JSON `deploy/n8n-workflows/formspree-to-paperclip.json` fue actualizado en repo (auditoría 2026-05-07) con:

- `safeEqual()` — validación de token constant-time (anti timing-attack)
- Campo `diagnostico_express` — captura del paso 4 del formulario

**El workflow en producción aún tiene la versión anterior.** Para actualizar:

```bash
# En VPS:
cd /opt/jaagsolutions/repo && git pull origin feature/jaagsolutions
# En UI n8n (https://n8n.jaagsolutions.com):
# Desactivar → Import from File → reactivar
```

### Ruta del repo en VPS

```text
/opt/jaagsolutions/repo/    ← monorepo (branch feature/jaagsolutions)
/opt/jaagsolutions/paperclip-data/  ← datos Paperclip (volumen Docker)
```

**ADVERTENCIA:** El directorio `paperclip-data` debe tener `chown -R 1000:1000`. Si Paperclip falla con EACCES, ejecutar:

```bash
sudo chown -R 1000:1000 /opt/jaagsolutions/paperclip-data
sudo docker restart deploy-paperclip-1
```

---

## 11. HISTORIAL DE SESIONES

### Sesión 2026-04-16
- Diseño spec principal de landing
- Plan de implementación landing y seed

### Sesión 2026-04-30 / 2026-05-04
- Scaffold completo de `jaagsolutions-web/`
- Todos los componentes y secciones implementados
- CF Function proxy Formspree (fix anti-spam Origin header)
- Paso 4 opcional "Diagnóstico express" en formulario
- PDF Lead Magnet estático (`5-flujos-clave-pymes.html`)
- W-011: eventos GA4 secundarios (cta_click + scroll_depth)
- Deploy exitoso en `jaagsolutions-paperclip.pages.dev`
- E2E formulario → Formspree → Gmail confirmado

### Sesión 2026-05-05
- Dominio `jaagsolutions.com` registrado en Hostinger
- Nameservers cambiados a Cloudflare
- `jaagsolutions.com` + `www.jaagsolutions.com` → Custom Domains en CF Pages (SSL activo)
- Formspree notificaciones → `jaagsolutions@gmail.com`
- Cloudflare Email Routing: `contacto@jaagsolutions.com` → `jaagsolutions@gmail.com`
- Email `contacto@jaagsolutions.com` visible en footer y sección Contacto
- Bitácora de infraestructura creada (este documento)

### Sesión 2026-05-06 — Fase B completa

- VM `jaagsolutions-vps` e2-medium Ubuntu 22.04 creada en Google Cloud (IP `34.41.171.138`)
- DNS: registro A `app` → IP VPS (DNS only)
- `deploy/setup.sh` ejecutado — Docker 29.4.2, 4 contenedores healthy (Paperclip, PostgreSQL, n8n, Caddy)
- Seed ejecutado en producción: Company JAAGSOLUTIONS + 4 agentes + 4 goals + 2 proyectos + 8 issues
- IDs obtenidos con `get-paperclip-ids.sh` — hardcodeados en workflow n8n (process.env no disponible en sandbox)
- Workflow n8n importado y activado: `Formspree Lead → Paperclip Issue`
- Bypass Formspree webhook Premium: CF Function postea directo a n8n con `context.waitUntil()` fire-and-forget
- E2E completo verificado: formulario → CF Function → n8n → issue JAAG-2 en Paperclip (asignado a Growth Ops)
- Fix EACCES Paperclip: `sudo chown -R 1000:1000 /opt/jaagsolutions/paperclip-data`
- Fix git ownership: `git config --global --add safe.directory /opt/jaagsolutions/repo`

### Sesión 2026-05-07 — Auditoría, GA4 y Agente A4

- **GA4:** Property `G-K92KJ1FRMH` creada → `VITE_GA_ID` y `VITE_SITE_URL` configurados en Cloudflare Pages
- **Auditoría completa:** 2 críticos + 4 importantes + 4 menores identificados y corregidos en un commit
  - C-1: `safeEqual()` XOR constant-time en webhook (anti timing-attack)
  - C-2: `diagnostico_express` capturado en n8n (campo más valioso del formulario)
  - I-1..I-4: CF Function body guard, ContactForm no rethrow, hook analytics rename, legacy Vercel eliminado
  - M-1..M-4: analytics.ts renombrado, CSP header, progressbar ARIA, noindex en PDF
- **Agente A4 Social & Content Lead:** creado en seed con G4 goal, P3 Brand & Content MVP, 5 issues
  - Budget: $200/mes, reporta a Growth Ops (A3)
  - Seed re-ejecutado vía `docker cp` → 8 creados, 19 actualizados
  - Dashboard confirmado: 5 agentes, 4 proyectos, Social & Content Lead activo
- **Pendiente:** Reimportar workflow n8n con JSON actualizado (safeEqual + diagnostico_express)
