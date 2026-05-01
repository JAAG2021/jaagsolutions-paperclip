# Deploy en Vercel — jaagsolutions-web

## Preview real del formulario (Vercel + Formspree, sin VPS)

Objetivo: que el formulario de contacto envíe datos reales a Formspree desde un deployment en `*.vercel.app` mientras el VPS (Paperclip/n8n) queda para después. **No hace falta** webhook ni dominio propio en esta fase.

**Implementación:** el navegador envía el lead a **`POST /api/lead`** (mismo origen, sin CORS). Esa función en `api/lead.js` reenvía el JSON a `https://formspree.io/f/{VITE_FORMSPREE_ID}` desde el servidor de Vercel. En local, `vite dev` incluye un proxy equivalente en `vite.config.ts`.

### 1. Formspree

1. Creá cuenta en [formspree.io](https://formspree.io) y un **nuevo formulario**.
2. En la configuración del formulario, anotá el **Form ID**: es el valor de la URL `https://formspree.io/f/{FORMSPREE_ID}` (también suele mostrarse en el panel como endpoint).
3. **No configures todavía** el webhook a n8n (eso va con el VPS; ver `deploy/RUNBOOK.md`).
4. Opcional: comprobá límites del plan (envíos/mes) y, si Formspree ofrece restricción por dominio, permití el dominio `*.vercel.app` o tu URL de preview concreta.

### 2. Vercel

1. **Add New… → Project** e importá el monorepo donde vive esta carpeta. Repo canónico JAAGSOLUTIONS (**privado**): [github.com/JAAG2021/jaagsolutions-paperclip](https://github.com/JAAG2021/jaagsolutions-paperclip). Conectá GitHub y autorizá a Vercel a ese repo (Projects → Git → reconnect si hace falta).
2. **Root Directory:** `jaagsolutions-web` (no el repo entero).
3. **Production Branch / ramas:** si el trabajo está en `feature/jaagsolutions`, usá esa rama para Preview o cambiá la rama de producción del proyecto en Vercel para que el deploy no intente solo `main` sin tu código.
4. Build: dejá lo que detecte o lo que ya define `vercel.json` (`pnpm run build`, `dist`, `pnpm install --ignore-workspace`).
5. **Settings → Environment Variables:**
   - `VITE_FORMSPREE_ID` = el ID del paso 1.
   - Marcá al menos **Preview** (y **Production** si querés que main también envíe). Vite inyecta estas variables en **build time**; sin `VITE_FORMSPREE_ID` en el entorno del deployment, el bundle no llamará a Formspree en producción (ver consola del navegador).
   - Opcional para preview: `VITE_SITE_URL` = `https://TU-PROYECTO.vercel.app` (la URL estable del proyecto o la que uses para pruebas) para metadatos coherentes.
6. **Redeploy** el último deployment (o empujá un commit) para que el build pille las variables.

### 3. Prueba

1. Abrí la URL del deployment (Preview o Production).
2. Completá el formulario de contacto (3 pasos) y enviá.
3. En DevTools → **Network**, verificá **`POST` a `/api/lead`** con **200** (o el código que devuelva Formspree vía proxy). No debería aparecer CORS bloqueando el envío.
4. En el panel de Formspree, confirmá la **submission** nueva y el email de notificación si lo activaste.

### Qué dejás para después

- VPS, DNS `paperclip` / `n8n`, Caddy, workflow n8n y webhook desde Formspree.

---

Checklist rápido antes de producción:

- [ ] Proyecto importado en Vercel con **Root Directory** = `jaagsolutions-web`
- [ ] Variables de entorno definidas (Production; opcionalmente Preview)
- [ ] Build verde (`pnpm run build` local ya validado con `pnpm install --ignore-workspace`)
- [ ] Dominio `www` en CNAME a `cname.vercel-dns.com` cuando corresponda
- [ ] En Formspree: webhook apuntando a n8n **después** de activar el workflow (ver `deploy/RUNBOOK.md`)

## Variables de entorno

| Variable | Descripción | Obligatoriedad |
|----------|-------------|----------------|
| `VITE_FORMSPREE_ID` | ID del formulario (`https://formspree.io/f/{ID}`) | Obligatoria para envío real de leads |
| `VITE_GA_ID` | Measurement ID GA4 (`G-…`) | Opcional; sin ella no hay `gtag` |
| `VITE_SITE_URL` | URL pública sin `/` final (ej. `https://www.jaagsolutions.com`) | Recomendada para SEO / og:url |
| `VITE_OG_IMAGE_URL` | URL absoluta de imagen Open Graph | Opcional |

## Pasos en Vercel

1. **New Project** → conectar el repositorio Git.
2. **Root Directory:** `jaagsolutions-web`
3. Framework: Vite (suelen detectarlo; `vercel.json` ya define `buildCommand`, `outputDirectory`, `installCommand`).
4. **Settings → Environment Variables:** añadir las variables anteriores.
5. **Deploy.** El sitio queda en `*.vercel.app` hasta asociar dominio custom.
6. **Settings → Domains:** añadir `www.jaagsolutions.com` (y redirección apex según tu DNS).

## DNS (referencia)

- **www** → CNAME `cname.vercel-dns.com`
- **@** (apex) suele ir a Vercel según su asistente o a tu VPS si usás el apex sólo para redirección (en `deploy/Caddyfile` el apex redirige a `www` cuando apunta al VPS; coordiná con tu diseño DNS).

## Verificación post-deploy

- [ ] El formulario de contacto envía sin error de red (ver Network tab → Formspree).
- [ ] GA: evento `form_submit` si configuraste `VITE_GA_ID`.
