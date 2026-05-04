# Deploy en Cloudflare Pages — jaagsolutions-web

Hosting gratuito con soporte de repositorios privados, sin restricciones de colaboradores.  
Reemplaza el deploy en Vercel (referencia legacy en `DEPLOY-VERCEL.md`).

---

## Variables de entorno necesarias

| Variable | Valor | Obligatoria |
|----------|-------|-------------|
| `VITE_FORMSPREE_ID` | `xpqbzolp` | Sí — sin ella el formulario no envía |
| `VITE_GA_ID` | `G-XXXXXXXXXX` | No — solo si usás Google Analytics |
| `VITE_SITE_URL` | `https://www.jaagsolutions.com` | Recomendada para SEO og:url |
| `VITE_OG_IMAGE_URL` | URL absoluta de la imagen OG | No |

---

## Paso 1 — Crear el proyecto en Cloudflare Pages

1. Ir a [pages.cloudflare.com](https://pages.cloudflare.com) e iniciar sesión (o crear cuenta gratuita).
2. Click en **"Create a project"** → **"Connect to Git"**.
3. Conectar GitHub y autorizar acceso al repo `JAAG2021/jaagsolutions-paperclip`.
4. Seleccionar el repositorio y click **"Begin setup"**.

---

## Paso 2 — Configurar el build

| Parámetro | Valor |
|-----------|-------|
| **Project name** | `jaagsolutions-web` |
| **Production branch** | `feature/jaagsolutions` |
| **Root directory** | `jaagsolutions-web` |
| **Framework preset** | Vite |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |

> **Root directory** es el campo clave: le dice a Cloudflare que el código está en la subcarpeta `jaagsolutions-web/`, no en la raíz del monorepo.

---

## Paso 3 — Variables de entorno

Antes de hacer el primer deploy, agregar las variables en la misma pantalla de configuración:

1. Expandir **"Environment variables (advanced)"**.
2. Agregar:
   - `VITE_FORMSPREE_ID` = `xpqbzolp`
3. Agregar opcionales si están disponibles (`VITE_GA_ID`, `VITE_SITE_URL`).
4. Click **"Save and Deploy"**.

---

## Paso 4 — Esperar el build (~2 min)

Cloudflare ejecuta:
```
npm install
npm run build   # tsc && vite build → dist/
```

Si el build es verde, el sitio queda disponible en:
```
https://jaagsolutions-web.pages.dev
```

---

## Paso 5 — Verificar el formulario

1. Abrir la URL del deployment.
2. Navegar a la sección **Contacto** y completar los 3 pasos del formulario.
3. Submit → verificar en [formspree.io](https://formspree.io) → **Submissions** que aparece la entrada.
4. En DevTools → Network: el POST debe ir a `/api/lead` con status 200.

---

## Paso 6 — Dominio personalizado (cuando esté disponible)

1. En Cloudflare Pages → proyecto → **Custom Domains**.
2. Click **"Set up a custom domain"** → ingresar `www.jaagsolutions.com`.
3. Cloudflare guía la configuración DNS automáticamente (CNAME a `jaagsolutions-web.pages.dev`).

> Si el dominio también está en Cloudflare DNS, la integración es instantánea.

---

## Auto-deploy

Cada `git push` a `feature/jaagsolutions` desencadena un deploy automático.  
El repositorio puede permanecer **privado** en GitHub — Cloudflare Pages lo soporta en el plan gratuito.

---

## Arquitectura de la función serverless

El formulario de contacto envía a `POST /api/lead` (mismo origen → sin CORS).  
La función en `functions/api/lead.js` actúa como proxy hacia Formspree desde el servidor de Cloudflare.

```
Navegador → POST /api/lead → Cloudflare Worker → Formspree → email de notificación
```

Esta función usa la **Web API estándar** (Cloudflare Workers runtime), no Node.js.  
La función legacy para Vercel sigue en `api/lead.js` como referencia.

---

## Checklist pre-lanzamiento

- [ ] Build verde en Cloudflare Pages
- [ ] `VITE_FORMSPREE_ID` configurado en Variables de entorno
- [ ] Formulario probado en URL de Cloudflare (`*.pages.dev`)
- [ ] Submission visible en panel Formspree
- [ ] Dominio `www.jaagsolutions.com` configurado (cuando esté disponible)
