# JAAGSOLUTIONS — Diseño de Producción (Opción C)
**Fecha:** 2026-04-30  
**Estado:** Aprobado

---

## 1. Objetivo

Desplegar JAAGSOLUTIONS en producción con el flujo completo integrado:

- Sitio web en Vercel (frontend estático)
- Paperclip + n8n + PostgreSQL en VPS (Hetzner CX22, Ubuntu 22.04)
- Puente automático: lead en formulario web → issue en Paperclip → A3 Growth Ops acciona

---

## 2. Arquitectura

### 2.1 Capas

```
[Web — Vercel]  →  [Formspree]  →  [n8n — VPS]  →  [Paperclip — VPS]
                                                          ↓
                                                   A3 Growth Ops
                                                          ↓
                                              A1 PM / A2 Builder (si convierte)
```

### 2.2 Componentes y responsabilidades

| Componente | Tecnología | Responsabilidad |
|---|---|---|
| `jaagsolutions-web` | React + Vite, Vercel | UI pública, SEO, formulario de captación |
| Formspree | SaaS (tier free) | Backend del formulario, notificación email, webhook saliente |
| n8n | Self-hosted en VPS | Motor de automatización: recibe webhook, transforma datos, llama API Paperclip |
| Paperclip | Self-hosted en VPS | Control plane de agentes: company, goals, issues, presupuestos |
| PostgreSQL | Docker (VPS) | Persistencia de Paperclip |
| Caddy | Docker (VPS) | Reverse proxy, SSL automático vía Let's Encrypt |

### 2.3 Dominios esperados

| Subdominio | Apunta a |
|---|---|
| `www.jaagsolutions.com` | Vercel |
| `paperclip.jaagsolutions.com` | VPS :3100 vía Caddy |
| `n8n.jaagsolutions.com` | VPS :5678 vía Caddy |

---

## 3. Flujo de lead — de punta a punta

1. Visitante completa el formulario de 3 pasos en la web (`ContactFormSection`)
2. React hace POST a `https://formspree.io/f/{FORMSPREE_ID}` con payload JSON
3. Formspree guarda la entrada, envía email de notificación y dispara webhook POST a `https://n8n.jaagsolutions.com/webhook/formspree-lead`
4. n8n recibe el payload, extrae campos (`nombre`, `email`, `empresa`, `dolor_proceso`, `presupuesto`, `timeline`, `whatsapp`)
5. n8n construye el body del issue y llama `POST /api/issues` en Paperclip con:
   - `title`: `Lead: {nombre} — {empresa}`
   - `description`: resumen formateado de todos los campos
   - `assigneeKey`: A3 (Growth Ops)
   - `projectKey`: P2 (Demand Engine MVP)
   - `goalKey`: G2
   - `priority`: `high` si `timeline === "inmediato"`, sino `medium`
   - `status`: `backlog`
6. Paperclip crea el issue y A3 lo recibe en su bandeja
7. A3 califica el lead y ejecuta seguimiento según Issue I7 ("Automatizar seguimiento de leads")

---

## 4. Archivos a crear

### 4.1 Infraestructura VPS

| Archivo | Propósito |
|---|---|
| `deploy/docker-compose.yml` | Paperclip + PostgreSQL + n8n + Caddy |
| `deploy/.env.production.example` | Todas las vars con documentación inline |
| `deploy/Caddyfile` | Configuración de dominios y reverse proxy |
| `deploy/setup.sh` | Script de bootstrap: instala Docker, clona repo, levanta servicios |

### 4.2 Automatización n8n

| Archivo | Propósito |
|---|---|
| `deploy/n8n-workflows/formspree-to-paperclip.json` | Workflow n8n exportado, importable con un click |

### 4.3 Seed de empresa

| Archivo | Estado |
|---|---|
| `Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json` | ✅ Existe — listo para importar vía CLI o UI |

### 4.4 Web (Vercel)

| Variable | Descripción |
|---|---|
| `VITE_FORMSPREE_ID` | ID de Formspree — **pendiente** |
| `VITE_GA_ID` | Google Analytics 4 ID — **pendiente** |
| `VITE_SITE_URL` | `https://www.jaagsolutions.com` — **pendiente** (necesita dominio) |

---

## 5. Infraestructura recomendada

### VPS
- **Proveedor:** Hetzner Cloud
- **Tipo:** CX22 (2 vCPU AMD, 4 GB RAM, 40 GB SSD)
- **Precio:** ~€4.51/mes
- **OS:** Ubuntu 22.04 LTS
- **Región:** Ashburn (US East) o Helsinki (EU) según audiencia target

### Por qué Hetzner CX22
- Mejor ratio precio/performance del mercado para cargas de este tipo
- 4 GB RAM es suficiente para Paperclip + PostgreSQL + n8n simultáneos
- Networking incluido (20 TB/mes)

---

## 6. Seguridad mínima

- Paperclip detrás de Caddy con HTTPS obligatorio
- n8n con autenticación básica activada (usuario + contraseña en `.env`)
- Webhook de n8n con token secreto validado en header `X-Formspree-Signature`
- PostgreSQL no expuesto al exterior (solo accesible desde la red Docker interna)
- Firewall VPS: solo puertos 22, 80, 443 abiertos

---

## 7. Gobernanza de agentes (seed)

Definida en `jaagsolutions-seed.json`:

| Agente | Rol | Presupuesto/mes |
|---|---|---|
| A0 CEO JAAGSOLUTIONS | Estrategia, aprobaciones críticas | $300 |
| A1 PM Delivery Lead | Roadmap, coordinación entrega | $200 |
| A2 Automation Builder | Implementación de flujos | $400 |
| A3 Growth Ops | Captación, leads, seguimiento | $250 |

**Aprobación humana obligatoria para:** cambios en producción de cliente, rotación de credenciales, envío de propuesta económica final.

---

## 8. Pendientes externos (no bloqueantes para preparar archivos)

| Acción | Tiempo estimado | Costo |
|---|---|---|
| Contratar Hetzner CX22 | 10 min | ~€4.51/mes |
| Comprar dominio `jaagsolutions.com` | 10 min | ~$12/año |
| Crear cuenta Formspree y obtener ID | 5 min | Gratis (100 leads/mes) |
| Crear propiedad Google Analytics 4 | 5 min | Gratis |

---

## 9. Criterio de "en producción"

Se considera el sistema en producción cuando:

- [ ] Web deployada en Vercel con las 3 variables de entorno configuradas
- [ ] VPS con Docker Compose levantado y servicios healthy
- [ ] Paperclip accesible en `paperclip.jaagsolutions.com` con HTTPS
- [ ] Company JAAGSOLUTIONS importada desde seed (agentes, goals, issues)
- [ ] n8n workflow activo y webhook URL registrado en Formspree
- [ ] Test end-to-end: formulario web → issue creado en Paperclip → visible en A3
- [ ] Ritual semanal de revisión agendado (CEO + tablero)
