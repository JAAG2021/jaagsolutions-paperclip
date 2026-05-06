# Bitácora de Infraestructura — JAAGSOLUTIONS

**Última actualización:** 2026-05-05  
**Estado del proyecto:** Fase A completa — Fase B pendiente

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

### Fase B (pendiente — Google Cloud VPS)

```
Formspree webhook
  │
  ▼
n8n (VPS Google Cloud)
  │
  ├─► Paperclip (crea issue automáticamente)
  └─► Email de bienvenida al lead
```

---

## 2. CUENTAS Y CREDENCIALES

| Servicio | Cuenta | Notas |
|---------|--------|-------|
| Cloudflare | `inverjaag@gmail.com` | Zona `jaagsolutions.com` + Pages `jaagsolutions-paperclip` |
| Formspree | `inverjaag@gmail.com` | Form ID `xpqbzolp` — notificaciones a `jaagsolutions@gmail.com` |
| GitHub (repo landing) | `JAAG2021` | `JAAG2021/jaagsolutions-paperclip` (privado) — branch `feature/jaagsolutions` |
| Hostinger (dominio) | cuenta propia | `jaagsolutions.com` — $10.46/año — nameservers apuntan a Cloudflare |
| Google Cloud | cuenta propia | 90 días free trial — para VPS Fase B |
| Gmail notificaciones | `jaagsolutions@gmail.com` | Recibe leads de Formspree + emails de `contacto@jaagsolutions.com` |
| Gmail admin | `inverjaag@gmail.com` | Cuenta maestra Cloudflare/Formspree |

---

## 3. CLOUDFLARE — CONFIGURACIÓN DETALLADA

### Zona `jaagsolutions.com`

| Registro DNS | Tipo | Nombre | Contenido | Notas |
|-------------|------|--------|-----------|-------|
| Apex | CNAME | `@` | `jaagsolutions-paperclip.pages.dev` | CF Pages Custom Domain |
| WWW | CNAME | `www` | `jaagsolutions-paperclip.pages.dev` | CF Pages Custom Domain |
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
| `VITE_GA_ID` | *(vacío — pendiente)* | Production |
| `VITE_SITE_URL` | *(vacío — opcional)* | Production |

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
| Monorepo Paperclip | `Genesis-fenix/paperclip` (privado) | Código fuente principal — rama `feature/jaagsolutions` tiene todo |
| Repo landing (deploy) | `JAAG2021/jaagsolutions-paperclip` (privado) | Conectado a Cloudflare Pages — recibe push de la landing |

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
- ❌ NO conectar el repo `Genesis-fenix/paperclip` directamente a CF Pages — es el monorepo, no la landing

### Formspree
- ❌ NO activar Formshield — causa falsos positivos con el proxy
- ❌ NO cambiar el Form ID `xpqbzolp` en el código sin actualizar la variable de entorno en Cloudflare

### Código
- ❌ NO instalar dependencias en `jaagsolutions-web/` que requieran Node.js nativo — CF Pages usa el runtime de Cloudflare
- ❌ NO usar `react-router` — la landing es SPA de una sola página, los modales legales usan estado local

---

## 10. FASE B — PLAN DE IMPLEMENTACIÓN (VPS)

### Recursos disponibles
- **Google Cloud** — free trial 90 días activo (desde ~2026-05-05)
- **Scripts de deploy** — todos listos en `deploy/`

### Pasos en orden

1. **Crear VM en Google Cloud Console**
   - Tipo: `e2-medium` (2 vCPU, 4 GB RAM)
   - OS: Ubuntu 22.04 LTS
   - Disco: 20 GB SSD
   - Firewall: HTTP (80) + HTTPS (443) + SSH (22) habilitados
   - Anotar la IP externa asignada

2. **Agregar registro DNS en Cloudflare**
   - Cloudflare → `jaagsolutions.com` → DNS → Add record
   - Tipo: A / Nombre: `app` / Contenido: `<IP_VM>` / Proxy: OFF (DNS only)
   - Resultado: `app.jaagsolutions.com` → VM

3. **Configurar el servidor**
   ```bash
   ssh user@<IP_VM>
   # Copiar deploy/ al servidor
   scp -r deploy/ user@<IP_VM>:~/
   # Ejecutar setup
   bash ~/deploy/setup.sh
   ```

4. **Completar variables de entorno**
   ```bash
   cp deploy/.env.production.example deploy/.env
   nano deploy/.env  # completar todos los valores
   ```

5. **Correr seed y obtener IDs**
   ```bash
   pnpm db:seed:jaagsolutions
   bash deploy/scripts/get-paperclip-ids.sh > ids.txt
   # Usar los IDs en el workflow de n8n
   ```

6. **Configurar n8n**
   - Importar `deploy/n8n-workflows/formspree-to-paperclip.json`
   - Configurar webhook en Formspree → Settings → Webhooks → `https://app.jaagsolutions.com/webhook/...`
   - Activar workflow

7. **Prueba E2E**
   - Llenar formulario en `jaagsolutions.com`
   - Verificar: Formspree recibe → n8n procesa → issue creado en Paperclip

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
