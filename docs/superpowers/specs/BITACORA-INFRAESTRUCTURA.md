# Bitácora de Infraestructura — JAAGSOLUTIONS

**Última actualización:** 2026-05-17
**Estado del proyecto:** Fase A + Fase B completas — Content Pipeline n8n + Telegram Approval E2E validados en producción (FB + IG + LinkedIn publicando con imagen nativa)

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

### Sesión 2026-05-09 — Configuración adaptador OpenAI/Codex para agente A4

**Objetivo:** Activar el agente A4 (Social & Content Lead) con API de OpenAI.

#### Fallas encontradas y soluciones aplicadas

---

**FALLA 1 — `nano` no disponible en VPS**
- **Síntoma:** `bash: nano: command not found`
- **Causa:** La imagen Docker minimalizada no incluye editores de texto.
- **Solución:** Editar archivos con Python heredoc o `echo >>`. Nunca usar `nano` en este VPS.
- **Comandos válidos para editar:**
  ```bash
  python3 << 'EOF'
  with open('/ruta/archivo', 'r') as f: content = f.read()
  content = content.replace('old', 'new')
  with open('/ruta/archivo', 'w') as f: f.write(content)
  EOF
  ```

---

**FALLA 2 — Nombre del contenedor incorrecto**
- **Síntoma:** `Error response from daemon: No such container: paperclip`
- **Causa:** Docker Compose nombra los contenedores como `deploy-<servicio>-1`, no como el nombre del servicio.
- **Solución:** Siempre verificar con:
  ```bash
  docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
  ```
- **Nombres correctos en producción:**
  - `deploy-paperclip-1`
  - `deploy-postgres-1`
  - `deploy-n8n-1`
  - `deploy-caddy-1`

---

**FALLA 3 — OPENAI_API_KEY no llega al contenedor**
- **Síntoma:** `docker exec deploy-paperclip-1 env | grep OPENAI_API_KEY` → vacío. Test de A4 fallaba aunque la clave estaba en `.env`.
- **Causa raíz:** Docker Compose usa `.env` para sustituir variables `${VAR}` en el YAML, **pero NO las inyecta automáticamente en los contenedores**. Cada variable que debe estar disponible dentro del contenedor tiene que estar listada explícitamente en la sección `environment:` del servicio.
- **Solución:** Agregar `OPENAI_API_KEY: ${OPENAI_API_KEY}` en `environment:` del servicio `paperclip` en `docker-compose.yml`.
- **⚠️ ADVERTENCIA — indentación crítica:** El archivo usa **6 espacios** para variables dentro de `environment:` y **4 espacios** para propiedades del servicio. Usar `sed` con `\n` puede poner la variable con 4 espacios (nivel de servicio), lo que genera:
  ```
  validating docker-compose.yml: services.paperclip additional properties 'VAR' not allowed
  ```
- **Método correcto para agregar variables al docker-compose.yml:**
  ```bash
  python3 << 'EOF'
  with open('/opt/jaagsolutions/repo/deploy/docker-compose.yml', 'r') as f:
      content = f.read()
  old = '      PAPERCLIP_DEPLOYMENT_EXPOSURE: ${PAPERCLIP_DEPLOYMENT_EXPOSURE}'
  new = old + '\n      OPENAI_API_KEY: ${OPENAI_API_KEY}'
  content = content.replace(old, new)
  with open('/opt/jaagsolutions/repo/deploy/docker-compose.yml', 'w') as f:
      f.write(content)
  EOF
  ```
- **Verificar que quedó bien antes de reiniciar:**
  ```bash
  sed -n '40,46p' /opt/jaagsolutions/repo/deploy/docker-compose.yml
  # OPENAI_API_KEY debe aparecer con 6 espacios, al mismo nivel que las otras vars
  ```
- **Reiniciar solo el contenedor afectado (sin bajar los demás):**
  ```bash
  cd /opt/jaagsolutions/repo/deploy && docker compose up -d --no-deps paperclip
  ```
- **Confirmar que la clave llegó:**
  ```bash
  docker exec deploy-paperclip-1 env | grep OPENAI_API_KEY
  ```

---

**FALLA 4 — Autenticación OAuth de Codex con cuenta equivocada**
- **Síntoma:** Test mostraba auth detectada pero error 401. Al correr `codex auth`, autenticó con cuenta personal `juanalvarengagalindo@gmail.com` en lugar de la cuenta del proyecto.
- **Causa raíz:** El adaptador `codex_local` tiene DOS modos de auth:
  1. **API mode** (correcto): si `OPENAI_API_KEY` está en el entorno, Codex lo usa directamente.
  2. **Subscription mode** (incorrecto para VPS): si no hay API key, lanza OAuth con callback a `localhost:1455` — imposible en VPS headless.
  - La autenticación OAuth además almacena un token en `CODEX_HOME/auth.json` que tiene **prioridad sobre `OPENAI_API_KEY`**, corrompiendo futuros intentos.
- **Solución:** Limpiar el auth OAuth corrupto:
  ```bash
  docker exec deploy-paperclip-1 find / -name "auth.json" -path "*/codex/*" 2>/dev/null
  # Si existe, eliminar:
  docker exec deploy-paperclip-1 rm -f <ruta>/auth.json
  ```
- **Regla:** En VPS headless **NUNCA** ejecutar `codex auth`. Siempre usar `OPENAI_API_KEY`.

---

**FALLA 5 — Codex rechaza ejecutarse: "Not inside a trusted directory"**
- **Síntoma:** `Not inside a trusted directory and --skip-git-repo-check was not specified.`
- **Causa:** El directorio de trabajo del contenedor es `/app`, que no es un repositorio git. Codex requiere ejecutarse dentro de un git repo o con el flag `--skip-git-repo-check`.
- **Solución permanente:** Crear un git repo en el volumen montado `/paperclip/workspace` (persiste entre reinicios del contenedor porque `/paperclip` es un volumen Docker):
  ```bash
  docker exec deploy-paperclip-1 sh -c '
    mkdir -p /paperclip/workspace &&
    git -C /paperclip/workspace init &&
    git -C /paperclip/workspace config user.email "agent@jaagsolutions.com" &&
    git -C /paperclip/workspace config user.name "Agent"
  '
  ```
- **Verificar que Codex corre en ese directorio:**
  ```bash
  docker exec deploy-paperclip-1 sh -c 'cd /paperclip/workspace && echo "Respond with hello." | codex exec --json - 2>&1' | head -10
  # Debe responder con JSON incluyendo "text":"hello"
  ```

---

**FALLA 6 — Campo `cwd` no disponible en UI de Paperclip para el adaptador Codex**
- **Síntoma:** No hay campo "Working directory" en la configuración de A4 en la UI.
- **Causa:** El campo `cwd` del adaptador existe en el código pero no está expuesto en la interfaz.
- **Solución:** Crear un wrapper script en `/paperclip/workspace/codex-run.sh` y configurarlo como `Command` del adaptador:
  ```bash
  docker exec deploy-paperclip-1 sh -c 'cat > /paperclip/workspace/codex-run.sh << '"'"'EOF'"'"'
  #!/bin/sh
  cd /paperclip/workspace
  exec codex "$@"
  EOF
  chmod +x /paperclip/workspace/codex-run.sh'
  ```
- **En Paperclip UI:** A4 → Configuration → Adapter → campo **Command** → `/paperclip/workspace/codex-run.sh`
- **Nota:** Al usar comando custom, el test de Paperclip muestra "Skipped hello probe because command is not 'codex'" — esto es normal y esperado. El resultado es **Passed**.

---

#### Estado final (2026-05-09)

| Componente | Estado |
|-----------|--------|
| `OPENAI_API_KEY` en contenedor | ✅ Inyectada via docker-compose.yml |
| `/paperclip/workspace` git repo | ✅ Inicializado, persiste en volumen |
| `/paperclip/workspace/codex-run.sh` | ✅ Wrapper script creado |
| A4 adapter Command | ✅ `/paperclip/workspace/codex-run.sh` |
| A4 adapter Model | ✅ `gpt-5-mini` |
| Test environment A4 | ✅ Passed |
| A4 listo para recibir issues | ✅ Sí |

#### Si la falla reaparece después de un reinicio del contenedor

El volumen `/paperclip` persiste, por lo que el workspace y el wrapper script sobreviven. Sin embargo, si el contenedor es **recreado desde cero** (build nuevo), verificar:

```bash
# 1. Confirmar que el workspace existe
docker exec deploy-paperclip-1 ls /paperclip/workspace/.git

# 2. Confirmar que el script existe
docker exec deploy-paperclip-1 ls -la /paperclip/workspace/codex-run.sh

# 3. Si no existen, recrear (ver FALLA 5 y 6 arriba)

# 4. Confirmar que OPENAI_API_KEY llega
docker exec deploy-paperclip-1 env | grep OPENAI_API_KEY
```

---

### Sesión 2026-05-10 — Fix apply_patch + Brand & Content MVP Mes 1

#### Problema raíz: A4 no podía escribir archivos con apply_patch

A4 generaba los patches como texto en el chat en lugar de aplicarlos. Causas identificadas y resueltas:

**FALLA 7 — `/paperclip/.codex/config.toml` sin permisos de lectura**
- **Síntoma:** A4 ejecutaba tareas pero ignoraba la configuración de Codex.
- **Causa:** Archivo con permisos `root:root -rw-------` — el proceso node no podía leerlo.
- **Solución:**
  ```bash
  docker exec -u root deploy-paperclip-1 chown node:node /paperclip/.codex/config.toml
  docker exec -u root deploy-paperclip-1 chmod 644 /paperclip/.codex/config.toml
  ```

**FALLA 8 — `/paperclip/workspace` owned by root**
- **Síntoma:** apply_patch fallaba silenciosamente — A4 no podía escribir en el workspace.
- **Causa:** El directorio era `root:root`, el proceso Codex corre como `node`.
- **Solución:**
  ```bash
  docker exec -u root deploy-paperclip-1 chown -R node:node /paperclip/workspace
  ```

**FALLA 9 — `--approval-mode` no existe en esta versión de Codex**
- **Síntoma:** `adapter_failed - error: unexpected argument '--approval-mode' found`
- **Causa:** El flag correcto es `--dangerously-bypass-approvals-and-sandbox`, no `--approval-mode`.
- **Solución:** Actualizar `codex-run.sh` con el flag correcto.

#### Fix definitivo — codex-run.sh con bypass

```bash
docker exec -u root deploy-paperclip-1 bash -c 'cat > /paperclip/workspace/codex-run.sh << '"'"'EOF'"'"'
#!/bin/sh
cd /paperclip/workspace
exec codex --dangerously-bypass-approvals-and-sandbox "$@"
EOF
chmod +x /paperclip/workspace/codex-run.sh'
```

**Verificar:**
```bash
docker exec deploy-paperclip-1 cat /paperclip/workspace/codex-run.sh
# Debe mostrar: exec codex --dangerously-bypass-approvals-and-sandbox "$@"
```

#### Estado final A4 (2026-05-10)

| Componente | Estado |
|-----------|--------|
| `/paperclip/workspace` propietario | ✅ `node:node` |
| `/paperclip/.codex/config.toml` permisos | ✅ `node:node 644` |
| `codex-run.sh` con bypass | ✅ `--dangerously-bypass-approvals-and-sandbox` |
| apply_patch funcional | ✅ Verificado — A4 escribe archivos directamente |

**⚠️ ADVERTENCIA:** NUNCA ejecutar `codex auth` en el VPS — genera OAuth que anula OPENAI_API_KEY.

#### Brand & Content MVP — artefactos generados por A4

| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| Blog post 1 | `/opt/jaagsolutions/repo/docs/content/blog/2026-05-12-automatizar-pyme.md` | Creado manualmente via SSH (apply_patch aún no estaba fijo) |
| CSV Buffer | `/paperclip/workspace/content_plan_mes1_buffer.csv` | 4 semanas, 3 canales, regla 70/30, pilares exactos |
| Handoff Buffer | `/paperclip/workspace/handoff_buffer_import.md` | Instrucciones importación + spec documentada |

#### Issues completados (Brand & Content MVP)

| Issue | Título | Done |
|-------|--------|------|
| `c1e1c24a` | Definir estrategia de contenido y calendario editorial — Mes 1 | ✅ 2026-05-10 |
| `4ada1270` | Configurar perfiles LinkedIn e Instagram de JAAGSOLUTIONS | ✅ 2026-05-10 |

#### Perfiles sociales

| Canal | Estado |
|-------|--------|
| LinkedIn | ✅ Creado (`jaagsolutions@gmail.com`) |
| Instagram | ✅ Creado (`jaagsolutions@gmail.com`) |
| Facebook Business | ⏳ Pendiente |

#### Reconciliation loop — comportamiento esperado

Después de cada turno de A4, Paperclip detecta que no hay ejecución viva y bloquea el issue automáticamente. **Esto es normal.** Para continuar: mover el issue a In Progress manualmente y responder. No es un error.

---

### Sesión 2026-05-11 — Contenido Semana 1 + Pipeline diseño

#### Logros

**Perfiles sociales completados:**
- Facebook Business Page creada con `jaagsolutions@gmail.com`
- Meta Business Suite portfolio "Jaagsolutions" configurado
- Facebook Page + @jaagsolutions Instagram conectados al portfolio
- Buffer abandonado (loading issues) → reemplazado por Meta Business Suite + LinkedIn native

**Contenido Semana 1:**
- A4 generó `linkedin_first8_schedule.csv` — 8 posts LinkedIn con copy completo, fechas (mayo 18 → jun 11), horarios America/New_York, hashtags, CTAs y briefs de imagen
- Issue `c8de442` marcado Done
- LinkedIn Post #1 publicado manualmente en cuenta personal Juan A. Alvarenga (Lun 11 mayo)
  - Página JAAGSOLUTIONS etiquetada correctamente (link azul activo)
- 3 imágenes generadas con Ideogram (prompts en español con texto incluido)
- 3 posts programados en Meta Business Suite Planificador (FB + Instagram simultáneo):

| Post | Fecha | Hora |
|------|-------|------|
| Infografía "¿Cuántas horas?" | Mar 12 mayo | 10:00 AM |
| Antes/Después "4h → 20 min" | Jue 14 mayo | 4:00 PM |
| Somos JAAGSOLUTIONS | Vie 15 mayo | 11:00 AM |

**Pipeline automatizado diseñado:**

Flujo definido para automatizar 100% la publicación de contenido con un solo paso manual (aprobación de imagen):

```
A4 CSV → n8n → Ideogram API (imagen) → Google Vision OCR (validación)
→ Telegram bot (aprobación humana) → Meta Graph API + LinkedIn API
```

APIs requeridas: Ideogram, Google Vision, Telegram Bot, Meta Graph API, LinkedIn API.

#### Decisiones tomadas

| Decisión | Alternativa descartada | Motivo |
|----------|----------------------|--------|
| Ideogram para imágenes | Canva manual | Generación automática con texto incluido |
| Meta Business Suite scheduler | Buffer | Buffer no cargaba; MBS es nativo y gratuito |
| Cuenta personal LinkedIn | Página empresa | Mayor alcance orgánico en etapa inicial |
| Pipeline n8n completo | Publicación manual siempre | Agencia de automatización no puede operar manualmente |

#### Pendiente próxima sesión — PRIORIDAD

1. Crear issue en Paperclip para A2: **"Pipeline automatizado de contenido — Meta + LinkedIn + Telegram approval"**
2. Configurar Telegram bot para checkpoint de aprobación
3. Obtener credenciales: Ideogram API key, Meta Graph API token, LinkedIn API app
4. Construir workflow n8n en etapas (empezar por Ideogram → Telegram, luego Meta API, luego LinkedIn API)
5. Programar posts LinkedIn 2-8 del CSV en LinkedIn native scheduler (18 mayo → 11 junio)
6. Generar imágenes + copy para Meta Semana 2 (19, 21, 22 mayo)

---

### Sesión 2026-05-12 — Content Pipeline n8n en producción + fix masivo de credenciales

**Objetivo:** Activar los workflows `content-generator` y `telegram-approval` en VPS, debuggear todos los errores que aparecen al ejecutar el flujo completo (cron → generación imagen → Vision OCR → Telegram → callback → Postgres → publicación).

#### Fallas encontradas y soluciones aplicadas

---

**FALLA 10 — `callback_data` con separador incorrecto en "Parsear callback"**
- **Síntoma:** `Problem in node 'Parsear callback' rechazar:UUID [line 13]` o `callback_data inválido: rechazar_UUID`.
- **Causa:** El nodo "Telegram — enviar para aprobación" en `content-generator.json` genera `callback_data` con `aprobar_<UUID>` (separador `_`). En el código del nodo "Parsear callback" se intentó cambiar el split a `:` o se confundió el separador.
- **Solución:** Usar `data.split('_')` y reconstruir el `post_id` con `parts.slice(1).join('_')` (porque los UUIDs contienen guiones pero no `_`).
- **Regla:** Cualquier cambio en `callback_data` debe coincidir entre el nodo que envía y el que recibe.

---

**FALLA 11 — Preview de evaluación de n8n guardado dentro del código del Code node**
- **Síntoma:** `SyntaxError: Unexpected character '→' [line 8]`
- **Causa:** Al guardar el código del Code node, n8n incluyó la línea de preview (`→ 0927ed25-...`) como parte del JavaScript. El símbolo `→` es solo informativo en el editor pero se guardó como texto.
- **Solución:** Borrar todo lo que aparece después del cierre de la expresión válida en cada línea. Verificar siempre que el código fuente del Code node no incluya símbolos `→`.

---

**FALLA 12 — Credenciales hardcoded a ID `"1"` que no existe en la instancia n8n**
- **Síntoma:** `Credential with ID "1" does not exist for type "postgres"` en cada nodo Postgres.
- **Causa raíz:** Los workflows JSON tenían bloques `credentials` con `"id": "1"` y `"name": "PostgreSQL JAAGSOLUTIONS"`. El ID `"1"` venía del entorno donde se creó el workflow originalmente (otra instancia de n8n). En la instancia productiva del VPS, la credencial de Postgres tiene ID `3WAwEY7SXDBTW16f` y nombre `Postgres account`.
- **Síntoma confuso:** Aunque el usuario re-seleccionaba la credencial correcta en la UI, al ejecutar el workflow seguía apareciendo el error porque las executions guardan el ID que estaba en el JSON al momento de ejecutar, y los cambios manuales no siempre persisten en la versión importada.
- **Solución de raíz:**
  1. Obtener el ID real de la credencial:
     ```bash
     docker exec deploy-n8n-1 n8n export:credentials --all --pretty --output=/tmp/creds.json
     docker exec deploy-n8n-1 cat /tmp/creds.json
     ```
  2. Agregar bloque `credentials` explícito a **cada nodo Postgres** del JSON:
     ```json
     "credentials": {
       "postgres": {
         "id": "3WAwEY7SXDBTW16f",
         "name": "Postgres account"
       }
     }
     ```
  3. Archivar los workflows viejos en n8n UI (n8n moderno reemplazó Delete por Archive).
  4. Re-importar los workflows con el ID correcto baked-in:
     ```bash
     docker exec deploy-n8n-1 n8n import:workflow --input=/tmp/<workflow>.json
     ```
- **Regla crítica:** Cuando un workflow se exporta de una instancia y se importa a otra, los IDs de credenciales **no son portables**. Hay que reescribir el bloque `credentials` con el ID de la instancia destino.

---

**FALLA 13 — Columna `image_path` no existe (era `image_url`)**
- **Síntoma:** Query falla porque el schema usa `image_url` pero el código intentaba escribir a `image_path`.
- **Causa:** Inconsistencia entre el plan original (que mencionaba `image_path`) y el schema final (`image_url`).
- **Solución:** Renombrar todas las referencias en `content-generator.json`:
  - Code node "Guardar imagen en disco" devuelve `image_url` (no `image_path`)
  - SQL "UPDATE content_plan SET image_url = ..." (no `image_path`)
- **Regla:** El schema (`deploy/sql/content-plan-schema.sql`) es la fuente de verdad. Cualquier query o expresión que mencione un nombre de columna debe coincidir.

---

**FALLA 14 — Referencias a nodos previos con `$('NodoX').first().json.X` apuntando al nodo incorrecto**
- **Síntoma:** Validación de OCR fallaba porque `Validar OCR` intentaba leer `postData` de un nodo que no contenía esos campos.
- **Causa:** El Code node "Validar OCR" hacía `$('Calcular aspect_ratio').first().json` cuando los datos del post estaban en `$('Guardar imagen en disco').first().json` (que es el nodo inmediatamente anterior con los campos completos).
- **Solución:** Actualizar las referencias a los nodos correctos en cada Code node. Verificar con el editor de n8n que las pestañas "Input" muestren los datos esperados.

---

**FALLA 15 — `NODE_FUNCTION_ALLOW_BUILTIN` no estaba en el repo**
- **Síntoma:** `require('fs')` en Code nodes fallaba con `Cannot find module 'fs'`.
- **Causa:** n8n por defecto NO permite usar built-ins de Node desde Code nodes por seguridad. Para habilitarlos hay que setear `NODE_FUNCTION_ALLOW_BUILTIN: "fs,path"` en el environment del servicio n8n.
- **Solución:** Agregar la variable en `deploy/docker-compose.yml` en la sección `environment` del servicio `n8n`, después de `GENERIC_TIMEZONE`. NO duplicar en la sección "Content Pipeline" (es config general, no específica del pipeline).
- **Reinicio necesario:**
  ```bash
  cd /opt/jaagsolutions/repo/deploy && docker compose --env-file .env up -d n8n
  ```

---

**FALLA 16 — `git pull` en VPS falla por cambios locales en `docker-compose.yml`**
- **Síntoma:** `error: Your local changes to the following files would be overwritten by merge: deploy/docker-compose.yml. Please commit your changes or stash them before you merge. Aborting`.
- **Causa:** El VPS tenía cambios locales (`NODE_FUNCTION_ALLOW_BUILTIN` agregado manualmente + `OPENAI_API_KEY` agregado en sesión 2026-05-09). El repo también incluía `NODE_FUNCTION_ALLOW_BUILTIN` en el último commit.
- **Solución:**
  1. `git stash push deploy/docker-compose.yml -m "local-openai-key"`
  2. `git pull`
  3. `git stash pop` (resuelve el merge — generalmente sin conflicto si las líneas son idénticas, pero deja duplicado lógico)
  4. Verificar duplicados con `grep -n "NODE_FUNCTION_ALLOW_BUILTIN" deploy/docker-compose.yml`
  5. Si aparece duplicado, borrar con `sed -i '<LINE>d' deploy/docker-compose.yml`
- **Regla:** Antes de hacer `git pull` en el VPS, ejecutar `git diff <archivo>` para entender qué hay localmente. Si hay cambios locales válidos, hacer `stash` primero. Si los cambios locales ya están en el repo (de un commit anterior), descartar con `git checkout -- <archivo>`.

---

**FALLA 17 — `nano` ahora sí está instalado pero `Ctrl+W` cierra la pestaña del navegador**
- **Síntoma:** En sesión 2026-05-09 se reportó que `nano` no existía. En 2026-05-12 sí existe. PERO al usar `Ctrl+W` (que en nano significa "Where Is / Search"), el navegador interpreta el atajo como "cerrar pestaña" y mata la sesión SSH.
- **Solución:** Navegar en nano con **flechas, Page Up/Down y Home/End** únicamente. Para buscar usar `grep -n` desde la terminal antes de abrir el archivo, así sabes en qué línea ir. Para guardar y salir: `Ctrl+O` → `Enter` → `Ctrl+X`.

---

**FALLA 18 — En n8n moderno reemplazaron Delete por Archive**
- **Síntoma:** No aparece opción "Delete" en el menú de un workflow. Solo: Open, Share, Duplicate, Archive.
- **Causa:** n8n 1.112.6 cambió el flujo a soft-delete (Archive). Los archivados pueden ser borrados desde la vista de Archivados, pero para nuestros propósitos (re-importar workflow con mismos webhook paths) Archive es suficiente porque libera la ruta del webhook.
- **Solución:** Usar Archive antes de re-importar. Alternativa CLI:
  ```bash
  docker exec deploy-n8n-1 n8n list:workflow
  docker exec deploy-n8n-1 n8n delete:workflow --id=<ID>
  ```

---

#### Proceso validado — Actualizar un workflow n8n con cambios de credenciales

1. **En máquina local:** editar JSON con el bloque `credentials` apuntando al ID correcto (NO al nombre — el ID es lo que n8n usa internamente).
2. **Commit + push** al repo.
3. **En VPS:**
   - `cd /opt/jaagsolutions/repo && git pull` (resolver conflictos si los hay — ver FALLA 16).
   - Strip `tags` del JSON con Python (los tags rompen import — gotcha histórico).
   - `docker cp /tmp/<workflow>.json deploy-n8n-1:/tmp/<workflow>.json`
4. **En n8n UI:** Archivar el workflow viejo para liberar el webhook path (FALLA 18).
5. **En VPS:** `docker exec deploy-n8n-1 n8n import:workflow --input=/tmp/<workflow>.json`
6. **En n8n UI:** activar el nuevo workflow (toggle verde). Verificar abriendo un nodo que dependa de credenciales — debe mostrar el nombre correcto **sin tocar nada**.
7. **Prueba E2E:** disparar el flujo (en este caso, botón Rechazar en Telegram). Verificar execution exitosa.

#### Estado final Content Pipeline (2026-05-12)

| Componente | Estado |
|-----------|--------|
| `deploy/sql/content-plan-schema.sql` | ✅ Aplicado en producción |
| `deploy/n8n-workflows/content-generator.json` | ✅ Importado y activo |
| `deploy/n8n-workflows/telegram-approval.json` | ✅ Importado y activo |
| Credencial Postgres en nodos | ✅ ID `3WAwEY7SXDBTW16f` hardcoded en JSON |
| `NODE_FUNCTION_ALLOW_BUILTIN` | ✅ En `docker-compose.yml` |
| Flujo Telegram "Rechazar" | ✅ Verificado E2E (execution ID#65 Succeeded en 1.428s) |
| Flujo Telegram "Aprobar" | ⏳ Pendiente — falta credenciales Meta/LinkedIn para test completo |
| Cron 8 AM diario | ⏳ Probar con trigger manual primero |
| Calidad imágenes Stability AI | ⚠️ Problema detectado — imágenes generadas no son acordes al `image_prompt` |

#### Problemas abiertos detectados — para evaluación

1. **Imagen sin relación al prompt:** Stability AI v2beta core genera imágenes con texto irrelevante o sin relación a la temática del post. Hay que evaluar si el problema es el motor (cambio a Ideogram), el prompt (auditor de prompt + filtros), o ambos.
2. **Rechazo no regenera inmediatamente:** El flujo actual marca `status = pending` + `retry_count + 1` y espera al próximo cron (8 AM siguiente día). Para no perder publicaciones programadas, debería regenerar inmediatamente al rechazar.

Ambos pendientes están documentados en sección separada para definir el approach antes de implementar.

---

### Sesión 2026-05-12 (continuación) — Auditor + SplitInBatches + Google Vision fixes

Continuación del deploy y testing del Content Pipeline. Se detectaron y corrigieron 3 nuevas fallas.

---

**FALLA 19 — SplitInBatches v3: output index 0 = "done", index 1 = "loop"**
- **Síntoma:** El workflow ejecutaba `Procesar 1 post a la vez` y todos los nodos posteriores mostraban "Node executed successfully" en el toast pero sin output — execution se detenía silenciosamente.
- **Causa raíz:** `SplitInBatches` en typeVersion 3 tiene **dos salidas**: index 0 = "done" (se ejecuta una vez al terminar todos los batches) e index 1 = "loop" (se ejecuta por cada batch). El workflow original conectaba todo al index 0 (done), así que solo se ejecutaba cuando ya no había items — momento en que no había nada que procesar.
- **Solución aplicada (commit `ec858d9c`):**
  1. Cambiar la conexión de `Procesar 1 post a la vez` de `main#0` a `main#1` en el JSON.
  2. Agregar loopback desde los 3 nodos terminales (`Guardar telegram_msg_id`, `retry_count++`, `status = error`) de vuelta al input de `Procesar 1 post a la vez` index 0.
- **Verificación:** Después del fix, todos los nodos del pipeline se iluminan en verde en secuencia.
- **Regla:** En n8n, SplitInBatches v3 siempre conectar los nodos de procesamiento al output **index 1 (loop)**. Los nodos finales de cada iteración deben hacer loopback al input 0 del SplitInBatches.

---

**FALLA 20 — jsonBody con saltos de línea literales en strings JavaScript**
- **Síntoma:** Error "invalid syntax" en el nodo "Auditor de prompt (OpenAI)" al ejecutar el workflow.
- **Causa raíz:** El campo `jsonBody` del nodo HTTP Request contenía strings de una sola línea con caracteres de salto de línea real (byte `0x0A`) dentro de comillas simples `'...'`. JavaScript no permite saltos de línea literales dentro de strings en comillas simples o dobles — solo en template literals (`` `...` ``).
- **Error confundido con:** El campo mostraba "Bearer undefined" en la preview de la UI, lo que llevó a investigar `$env.OPENAI_API_KEY`. Pero ese error es solo cosmético: el navegador no tiene acceso a las variables de entorno del servidor n8n. En runtime sí funciona.
- **Solución aplicada (commit `2264c315`):** Reemplazar los 5 saltos de línea literales con el escape `\n` (barra invertida + n) en la expresión `jsonBody`:
  ```
  '\\nFormato: ' + ... + '\\nPilar: ' + ...
  ```
- **Verificación:** Confirmar con `docker exec deploy-n8n-1 env | grep OPENAI_API_KEY` que la variable existe en el contenedor. Si existe, el "Bearer undefined" en la UI es cosmético. Si el nodo falla en runtime con 401, ahí sí es problema real.
- **Regla:** En n8n expression fields, usar `\n` (escape) nunca saltos de línea reales en string literals.

---

**FALLA 21 — `$json.image_base64` undefined después de nodo Postgres**
- **Síntoma:** Google Vision OCR falla con `Bad request — Request must specify image and features`. El JSON preview del nodo muestra `{"requests":[{"image":{},"features":[...]}]}` — `image` es objeto vacío.
- **Causa raíz:** El nodo "Guardar image_path" es un `postgres executeQuery` que hace `UPDATE content_plan SET image_url = ...`. En n8n, cuando un nodo executeQuery termina, **su output reemplaza completamente el stream de datos con el resultado del query** (ej. `[{ success: true }]`). Los campos que venían del nodo anterior (`image_base64`, `id`, `copy_text`, etc.) desaparecen.
  - El nodo "Guardar imagen en disco" (Code node) sí produce `image_base64` en su output.
  - Pero después de pasar por el Postgres node, `$json` ya no contiene `image_base64`.
- **Solución aplicada (commit `f5215681`):** En el `jsonBody` del nodo "Google Vision — OCR", referenciar el nodo upstream directamente:
  ```js
  $('Guardar imagen en disco').item.json.image_base64
  ```
  en lugar de `$json.image_base64`.
- **⚠️ PENDIENTE AL 2026-05-12:** El commit `f5215681` **NO está pusheado** al remote `jaag2021`. El VPS no lo tiene. Al comenzar la próxima sesión, este commit debe ser pusheado PRIMERO antes de hacer cualquier `git pull` en el VPS.
  ```bash
  # En máquina local:
  git push jaag2021 feature/jaagsolutions
  # En VPS:
  cd /opt/jaagsolutions/repo && git pull
  ```
- **Regla general:** Después de cualquier nodo Postgres `executeQuery`, `$json` es el resultado del query, NO los datos previos del pipeline. Para acceder a datos de un nodo anterior, usar `$('Nombre del nodo').item.json.campo`.

---

**Estado del test post al 2026-05-12 (fin de sesión):**
```
id:          4a9a24b4-bb79-4a64-908b-7af12caf2d21
status:      pending
retry_count: 0
format:      imagen_copy
platform:    instagram
```
El post está listo para el próximo test E2E una vez deployado el commit `f5215681`.

---

#### Regla operativa establecida — DOCS FIRST

**Cualquier cambio en infraestructura debe ir precedido de:**
1. Leer `docs/superpowers/specs/BITACORA-INFRAESTRUCTURA.md` (este archivo) — historial de gotchas
2. Leer `deploy/RUNBOOK.md` — procesos validados
3. Leer `docs/superpowers/specs/CHECKLIST-MAESTRO-JAAGSOLUTIONS.md` — estado actual
4. Para cambios en n8n: leer también `deploy/n8n-workflows/*.json` y `deploy/scripts/sync-n8n-workflows.sh`

**Esto evita repetir errores ya resueltos** (ej. tags en JSON, credenciales hardcoded, indentación de docker-compose.yml, etc.).

---

### Sesión 2026-05-17 — Telegram Approval E2E + Fase 1 diversidad de imágenes

Sesión enfocada en completar el pipeline E2E (generación → aprobación → publicación FB + IG + LinkedIn) y abordar la calidad visual del output (imágenes repetitivas, labels parásitos, fallas de publicación por plataforma). Resultado: pipeline 100% funcional, post de prueba publicado correctamente en las 3 redes con copy + hashtags concatenados.

---

**FALLA 22 — IG nunca se publicaba aunque FB y workflow se completaban "verdes"**

- **Síntoma:** Al aprobar en Telegram, FB se publicaba pero IG no. n8n marcaba `status=published` y enviaba el mensaje "✅ Publicado" en Telegram, así que parecía todo OK, pero IG no recibía nada.
- **Causa raíz:** n8n ejecuta fan-out **depth-first (secuencial)**, no en paralelo. La rama de FB tenía un nodo Paperclip al final (`Paperclip — log en JAAG-5`) que fallaba con 404 (variable `PAPERCLIP_JAAG5_ISSUE_ID` vacía). El error mataba la ejecución de toda la rama, y como la rama de IG estaba **después** en el orden de ejecución, nunca se llegaba a ejecutar.
- **Solución aplicada:** Eliminar el nodo Paperclip y reestructurar la cadena como **secuencial encadenada** (FB → IG → LinkedIn) en lugar de fan-out paralelo. Agregar `continueOnFail: true` a cada nodo de publicación para que el fallo de uno no rompa los siguientes.
- **Regla:** En n8n, asumir siempre ejecución depth-first sequential en fan-outs. Si una rama es no crítica (logging, métricas), va al final o con `continueOnFail`. Nunca poner un nodo que puede fallar antes de otra rama crítica que esperas que se ejecute.

---

**FALLA 23 — FB 500 "Please reduce data" intermitente con `url` field**

- **Síntoma:** Meta Graph API `/photos` rechazaba el upload con 500 cuando se le pasaba `url=https://content.jaagsolutions.com/<id>.jpg`. Pasaba ~30% de las veces, sin patrón claro.
- **Causa raíz:** El endpoint de URL fetch de Meta tiene rate limits internos y a veces no logra descargar imágenes del dominio en el tiempo permitido. No es debugable desde nuestro lado.
- **Solución aplicada:** Cambiar a multipart binary upload. Añadir nodo `readBinaryFile` que lee `/opt/jaagsolutions/content/<id>.jpg`, y en `Meta FB — subir foto` usar `parameterType: "formBinaryData"` + `name: "source"` + `inputDataFieldName: "data"`.
- **Regla:** Para subir imágenes a Meta APIs (FB photos, IG container), preferir multipart binary (`source`) sobre URL fetch cuando se controla el filesystem. Más confiable y desbloquea casos donde la URL no es pública aún.

---

**FALLA 24 — IG `Media ID is not available` (error code 9007) al publicar container**

- **Síntoma:** `/media_publish` retornaba 400 con código 9007 "Media ID is not available" inmediatamente después de crear el container con `/media`.
- **Causa raíz:** Race condition. Meta necesita ~3–5 segundos para procesar internamente la imagen del container antes de permitir publicarlo. n8n hace el segundo request demasiado rápido (sub-segundo).
- **Solución aplicada:** Insertar Code node `Esperar IG container` entre crear container y publicar:

  ```js
  await new Promise(r => setTimeout(r, 5000));
  return $input.all();
  ```

- **Regla:** Para flujos asíncronos en Meta Graph API (container → publish), insertar wait ≥5s. No confiar en que el primer response signifique "listo para publicar".

---

**FALLA 25 — LinkedIn `ILLEGAL_ARGUMENT: Request body could not be converted`**

- **Síntoma:** LinkedIn UGC `/v2/ugcPosts` rechazaba el body con 400 cuando se pasaba `shareMediaCategory: 'IMAGE'` + `media[0].media = <https URL del JPG>`. El post se creaba pero solo con el texto, sin imagen embebida.
- **Causa raíz:** LinkedIn no acepta URLs externas en `media.media`. Requiere subir el binario primero al CDN de LinkedIn vía el flujo de **Asset Upload**, que produce un `urn:li:digitalmediaAsset:...` que sí se acepta.
- **Solución aplicada:** Implementar el flujo de 3 pasos:
  1. `POST /v2/assets?action=registerUpload` con `recipes: ['urn:li:digitalmediaRecipe:feedshare-image']` → devuelve `value.asset` (URN) + `value.uploadMechanism.../uploadUrl`.
  2. `PUT <uploadUrl>` con el binario JPG (Content-Type: image/jpeg).
  3. `POST /v2/ugcPosts` con `media[0].media = <asset URN del paso 1>`.
- **Regla:** En LinkedIn, todas las imágenes nativas (no link preview) requieren Asset Upload. URLs directas solo funcionan como link preview, no como `shareMediaCategory: IMAGE`.

---

**FALLA 26 — Ideogram rechaza `ASPECT_4_5` con "not one of [...]"**

- **Síntoma:** Bad Request al llamar `/generate` con `aspect_ratio: 'ASPECT_4_5'`. Ideogram listaba valores válidos pero `ASPECT_4_5` no estaba.
- **Causa raíz:** Ideogram solo soporta valores discretos del enum: `ASPECT_1_1`, `ASPECT_3_4`, `ASPECT_9_16`, `ASPECT_16_9`, etc. `4:5` (0.80) no es soportado.
- **Solución aplicada:**
  1. En `Calcular aspect_ratio` (content-generator.json): todos los formatos portrait → `ASPECT_3_4`.
  2. En `compose-image.js`: agregar entrada `ASPECT_3_4: { w: 1080, h: 1350 }` al `DIMS` map, mantener `ASPECT_4_5: { w: 1080, h: 1350 }` como alias backward-compat. Sharp resize con `fit: 'cover'` y `position: 'top'` para croppear desde el bottom los ~90px sobrantes — esa zona inferior es la zona calma reservada por el Auditor para el overlay, así que no se pierde sujeto.
- **Regla:** Las claves del map `DIMS` en compose-image.js deben coincidir 1:1 con los valores que produce `Calcular aspect_ratio`. Salida final en disco siempre 4:5 (1080×1350) para cross-post IG/FB/LinkedIn — Ideogram genera 3:4 y Sharp ajusta.

---

**FALLA 27 — Imágenes con labels "INSTAGRAM" + fecha baked-in**

- **Síntoma:** Las imágenes generadas mostraban en la esquina superior derecha el nombre de la plataforma ("INSTAGRAM") y la fecha programada, baked dentro de la imagen JPG final.
- **Causa raíz:** `compose-image.js` componía un overlay SVG que incluía 2 `<text>` elements con `platform.toUpperCase()` y `formatDate(scheduled_date)`. Estaba pensado como debug visual de los primeros tests, pero para producción no debe aparecer.
- **Solución aplicada:** Eliminar los 2 `<text>` elements del SVG en compose-image.js. Mantener solo: logo JAAG·SOLUTIONS top-left, copy + hashtags en bottom overlay, URL del sitio bottom-right.
- **Regla:** Las imágenes en producción no deben contener metadata visual (plataforma, fecha, debug info). Cualquier overlay textual debe ser branding o copy intencional.

---

**FALLA 28 — Container n8n necesita rebuild cuando cambia `compose-image.js`**

- **Síntoma:** Después de editar `compose-image.js` y hacer `docker compose up -d`, los cambios no se reflejaban en el output.
- **Causa raíz:** El Dockerfile.n8n incluye `COPY n8n-scripts/ /opt/n8n-scripts/` en build-time. Un `docker compose up -d` recrea el contenedor pero no rebuilda la imagen. Los cambios en archivos COPY'd al image solo se aplican con `docker compose build n8n` antes del `up`.
- **Solución:** Workflow correcto cuando cambia `compose-image.js`:

  ```bash
  cd /opt/jaagsolutions/repo/deploy
  docker compose build n8n
  docker compose up -d n8n
  ```

- **Regla:** Cambios en `n8n-scripts/*` requieren `docker compose build n8n`. Cambios en `n8n-workflows/*.json` solo requieren re-import vía API. Cambios en `.env` solo requieren `docker compose up -d`.

---

**FALLA 29 — `n8n import:workflow` falla con `SQLITE_CONSTRAINT: NOT NULL constraint failed: workflows_tags.tagId`**

- **Síntoma:** Importar un workflow JSON con tags definidos rompe el import si los tags no existen previamente en la DB.
- **Causa raíz:** La tabla `workflows_tags` tiene FK constraint a `tag_entity.id`. Si el tag referenciado por nombre en el JSON no existe, falla.
- **Solución aplicada:** Antes de importar, strip `tags` del JSON:

  ```python
  import json
  with open(path) as f: w = json.load(f)
  w.pop('tags', None)
  with open(path_clean, 'w') as f: json.dump(w, f)
  ```

- **Regla:** Workflow JSON para import vía CLI siempre debe llevar `tags=[]` o no tener la key `tags`. Si se necesitan tags, crearlos en la DB primero o aplicarlos vía UI después del import.

---

**FALLA 30 — `sqlite3` writes from outside the container hit "attempt to write a readonly database"**

- **Síntoma:** Intentar hacer un transplant SQL (UPDATE workflow_entity SET nodes=..., DELETE duplicate) directamente sobre `/opt/jaagsolutions/n8n-data/database.sqlite` desde el host falla con SQLITE readonly.
- **Causa raíz:** El archivo es owned by `ubuntu:ubuntu`. El usuario SSH (`jaagsolutions`) no tiene write permission. sudo requiere TTY (no disponible vía SSH no interactivo). Además n8n tiene la DB locked por sus propias conexiones.
- **Solución aplicada (recomendada):** Usar la REST API de n8n para hacer el transplant. Endpoints:
  - `GET /api/v1/workflows/<NEW_ID>` → nodes + connections
  - `PUT /api/v1/workflows/<ACTIVE_ID>` con body `{name, nodes, connections, settings, staticData:null}` → conserva el ID activo (no rompe webhooks)
  - `DELETE /api/v1/workflows/<NEW_ID>` → limpia duplicado
  - `POST /api/v1/workflows/<ACTIVE_ID>/activate` → activa
- **API key location:** `deploy/.env` del VPS → `N8N_API_KEY=...` (JWT firmado por n8n).
- **Regla:** Para modificar workflows activos preservando el webhook ID, usar SIEMPRE la REST API, nunca sqlite3 directo. El "transplant pattern" via API es: GET new → PUT active con sus nodes/connections → DELETE new → POST activate.

---

#### Cambios estructurales de Fase 1 — Diversidad de imágenes

Se aprobó e implementó la Fase 1 del plan de variedad visual (Propuestas 1, 2 y 7 del análisis previo). Objetivo: evitar que todas las imágenes salgan con el mismo "señor latino con laptop en oficina".

**Propuesta 1 — Biblioteca de escenas (Code node `Preparar prompt Auditor`):**

Nuevo Code node insertado entre `Calcular aspect_ratio` y `Auditor de prompt (OpenAI)`. Contiene biblioteca de 8 variantes de escena por pilar (32 total):

- `educacion` / `experto` / `conocimiento`: 8 escenas (oficina con dashboards, café soleado, sala de juntas, IT manager en server room, etc.)
- `social_proof` / `casos` / `testimonial`: 8 escenas (equipo colaborando, handshake, video call, celebración, etc.)
- `produccion` / `behind_scenes` / `proceso` / `herramienta`: 8 escenas (macro teclado, abstract data streams, floating UI panels, flat-lay, etc.)
- `promesa` / `vision` / `aspiracion`: 8 escenas (rooftop golden hour, glass atrium, aerial dawn city, harbor dusk, etc.)

Selección aleatoria por ejecución. El system prompt del Auditor se construye dinámicamente con la escena seleccionada como "BASE SCENE — use this as your creative starting point and enrich it".

**Propuesta 2 — Seed aleatorio + style_type rotativo en Ideogram:**

En el `jsonBody` del nodo Ideogram:

- `seed: Math.floor(Math.random() * 2147483647)` — un valor random distinto por ejecución (no determinístico).
- `style_type` ponderado: `REALISTIC` 50% / `GENERAL` 33% / `3D_RENDER` 17%, vía `(['REALISTIC','REALISTIC','REALISTIC','GENERAL','GENERAL','3D_RENDER'])[Math.floor(Math.random()*6)]`.

**Propuesta 7 — Modelo Ideogram V_2_TURBO → V_2:**

V_2 tiene mejor calidad y consistencia de composición que V_2_TURBO. Mismo precio, ~50% más lento (~10s vs ~5s) — aceptable para generación nocturna.

**Commit:** `2dd41281` — `feat(content-gen): Fase 1 — diversidad de imágenes (Propuestas 1+2+7)`.

---

#### Validación E2E final (2026-05-17 15:30 COL)

Post de prueba `4a9a24b4-bb79-4a64-908b-7af12caf2d21`:

- `copy_text`: "Test auditor de prompt — imagen debe mostrar composición visual profesional"
- `hashtags`: `#automatizacion #pymes #productividad #transformaciondigital #ia`

Resultado tras click ✅ Aprobar en Telegram:

| Plataforma | Imagen | Copy | Hashtags | Concatenación |
|---|---|---|---|---|
| Facebook | ✅ nativa, JAAG·SOLUTIONS overlay, sin labels parásitos, 4:5 | ✅ | ✅ los 5 hashtags | ✅ línea en blanco entre copy y hashtags |
| Instagram | ✅ misma imagen | ✅ | ✅ hashtags como links azules clickeables | ✅ |
| LinkedIn | ✅ **imagen embebida nativa** (Asset Upload OK) | ✅ | ✅ hashtags como links azules | ✅ |

DB final: `status=published`. Workflow completó toda la cadena (LinkedIn register upload → PUT binario → ugcPosts con asset URN → status=published → "✅ Publicado" en Telegram).

---

#### Pendientes para Fase 2 (sesión separada)

1. **A4 debe poblar `hashtags` en `content_plan`** — actualmente el agente Paperclip A4 genera posts con copy + image_prompt pero el campo `hashtags` viene NULL. Requiere actualizar el spec/prompt de A4 para que genere 3–5 hashtags relevantes por pillar y los inserte en la columna correcta.
2. **OCR post-generación con Google Vision (Fix #7 deferred)** — validar que la imagen generada no contenga texto baked-in antes de enviar a Telegram. Si OCR detecta texto, regenerar automáticamente (hasta 3 intentos).
3. **Variety enforcement DB-side** — agregar tracking de temas/escenas usadas en los últimos 14 días para evitar repeticiones cercanas. Tabla `content_history` o columna `last_scene_variant` en `content_plan`.
4. **A4 enriched image_prompt** — incluir en el spec del agente A4 instrucciones más ricas para `image_prompt` (no solo "Professional accounting services for small business" sino contexto de pilar + audiencia + emoción).

---

#### Reglas operativas reforzadas en esta sesión

- **Reset post antes de Execute:** SIEMPRE validar con `SELECT id, status, image_url FROM content_plan WHERE id='...'` y resetear (`UPDATE status='pending', image_url=NULL, retry_count=0, error_log=NULL` + `rm -f /opt/jaagsolutions/content/<id>.jpg`) ANTES de pedir al usuario que ejecute. Si quedó en `generating` o `review` por una corrida anterior, el workflow no lo procesa.
- **Transplant via API, no sqlite3:** Para actualizar workflows manteniendo webhook IDs, usar REST API de n8n (`PUT /workflows/<id>` + `DELETE /workflows/<dup>` + `POST /workflows/<id>/activate`). Nunca tocar `database.sqlite` directamente.
- **Strip tags antes de import:** `wf.pop('tags', None)` en Python antes de pasar el JSON al `n8n import:workflow`.
- **SSH authorized_keys quedó vacío una vez** (causa desconocida 13:56 del 2026-05-17); el script de recuperación: reagregar manualmente `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAWHZ4/huqnWIpsZui02YvKTRcFgke+i9dys9AoE7szP jaagsolutions-vps` al archivo `/home/jaagsolutions/.ssh/authorized_keys` desde la consola serial de Google Cloud.


