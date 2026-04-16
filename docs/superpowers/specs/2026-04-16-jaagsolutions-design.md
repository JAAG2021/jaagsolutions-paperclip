# JAAGSOLUTIONS — Design Spec

**Fecha:** 2026-04-16  
**Estado:** Aprobado  
**Entregables:** 2 — Seed de Paperclip + Landing web  
**Orden de ejecucion:** Seed primero, luego web

---

## 1. Contexto

JAAGSOLUTIONS es una agencia de automatizacion de flujos empresariales para PYMEs. Necesita:

1. **Configuracion operativa en Paperclip** — company, goals, agentes, proyectos e issues del MVP de 30 dias cargados de forma declarativa y reproducible.
2. **Sitio web comercial** — landing one-page en React + Vite + TypeScript para captar leads B2B, desplegado en Vercel.

Los documentos fuente viven en `paperclip/Proyect_JAAGSOLUTIONS/`. Todo el contenido (copy, wireframe, blueprint, backlog) esta completamente especificado en esos archivos.

---

## 2. Enfoque elegido: Opcion A

- **Seed:** JSON declarativo + loader TypeScript idempotente
- **Web:** carpeta independiente `jaagsolutions-web/` en el root del monorepo, deploy a Vercel apuntando a esa subcarpeta

---

## 3. Entregable 1 — Seed de Paperclip

### 3.1 Archivos

| Archivo | Descripcion |
|---------|-------------|
| `Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json` | Datos declarativos completos de JAAGSOLUTIONS |
| `packages/db/src/seed-jaagsolutions.ts` | Loader TypeScript que lee el JSON y ejecuta upserts |
| `packages/db/package.json` | Script `seed:jaagsolutions` |
| `package.json` (root) | Script `db:seed:jaagsolutions` |

### 3.2 Estructura del JSON seed

```json
{
  "company": { ... },
  "agents": [ ... ],
  "goals": [ ... ],
  "projects": [ ... ],
  "issues": [ ... ]
}
```

#### Company
- `name`: "JAAGSOLUTIONS"
- `description`: "Agencia de automatizacion de flujos para terceros con operacion comercial y de entrega parcialmente automatizada."
- `status`: "active"
- `issuePrefix`: "JAAG"
- `budgetMonthlyCents`: 200000 (ajustable)

#### Agents (4)
| Key | Nombre | Rol | reportsTo | budgetMonthlyCents |
|-----|--------|-----|-----------|-------------------|
| A0 | CEO JAAGSOLUTIONS | ceo | — | 30000 |
| A1 | PM Delivery Lead | pm | A0 | 20000 |
| A2 | Automation Builder | engineer | A1 | 40000 |
| A3 | Growth Ops | marketing | A0 | 25000 |

Cada agente incluye `capabilities` texto y `adapterType: "process"` con `adapterConfig: {}` (configurable post-setup).

#### Goals (4)
| Key | Titulo | Nivel | Parent | Owner |
|-----|--------|-------|--------|-------|
| G0 | Lanzar operacion MVP rentable de automatizaciones en 30 dias | company | — | A0 |
| G1 | Entregar 1 caso de automatizacion de punta a punta con calidad | team | G0 | A1 |
| G2 | Implementar embudo minimo de captacion y seguimiento comercial | team | G0 | A3 |
| G3 | Establecer control operativo basico (aprobaciones + metricas) | team | G0 | A0 |

#### Projects (2)
| Key | Nombre | Goal | Lead |
|-----|--------|------|------|
| P1 | Client Delivery MVP | G1 | A1 |
| P2 | Demand Engine MVP | G2 | A3 |

#### Issues (8)
| ID | Titulo | Proyecto | Asignado | Prioridad |
|----|--------|----------|----------|-----------|
| I1 | Definir oferta MVP de servicio | P1 | A1 | high |
| I2 | Crear plantilla de discovery para cliente piloto | P1 | A1 | high |
| I3 | Disenar arquitectura del flujo piloto | P1 | A2 | high |
| I4 | Implementar y validar automatizacion piloto | P1 | A2 | high |
| I5 | Definir ICP y propuesta de valor | P2 | A3 | high |
| I6 | Crear activo de captacion + CTA a diagnostico | P2 | A3 | medium |
| I7 | Automatizar seguimiento de leads | P2 | A3 | medium |
| I8 | Configurar tablero semanal de control | P2 | A0 | high |

### 3.3 Loader (`seed-jaagsolutions.ts`)

- Lee `../../Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json` (ruta relativa desde `packages/db/src/`)
- Usa `DATABASE_URL` del entorno
- Orden de insercion: company → agents (respetando jerarquia reportsTo) → goals (G0 primero) → projects → issues
- Upserts por campo unico natural: company por `name`, agent por `(companyId, name)`, goal por `(companyId, title)`, project por `(companyId, name)`, issue por `(companyId, title)`
- Imprime al final: `✓ JAAGSOLUTIONS seed completo — X creados, Y actualizados`

### 3.4 Uso

El seed requiere que el embedded postgres de Paperclip este corriendo. Pasos:

```bash
# 1. Levantar Paperclip (inicia el embedded postgres en puerto 54329)
pnpm dev

# 2. En otra terminal, correr el seed
DATABASE_URL=postgresql://postgres@localhost:54329/paperclip pnpm db:seed:jaagsolutions
```

El loader intentara leer DATABASE_URL del entorno. Si Paperclip usa una configuracion de postgres diferente, ajustar la URL segun corresponda.

---

## 4. Entregable 2 — Landing Web

### 4.1 Ubicacion y stack

```
paperclip/
└── jaagsolutions-web/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── index.html
    ├── public/
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── components/
        │   ├── SectionHeader.tsx
        │   ├── Card.tsx
        │   ├── CTAButton.tsx
        │   └── FaqItem.tsx
        └── sections/
            ├── TopNav.tsx
            ├── HeroSection.tsx
            ├── BenefitsSection.tsx
            ├── ServicesSection.tsx
            ├── ProcessSection.tsx
            ├── UseCasesSection.tsx
            ├── ComparisonSection.tsx
            ├── ContactFormSection.tsx
            ├── FaqSection.tsx
            ├── FinalCtaSection.tsx
            └── FooterSection.tsx
```

**Dependencias runtime:**
- `react` + `react-dom`
- `react-hook-form` — validacion del formulario
- `@formspree/react` — submit del formulario sin backend

**Dev:**
- `vite`, `@vitejs/plugin-react`, `typescript`, `tailwindcss`, `autoprefixer`, `postcss`

### 4.2 Secciones (orden de render)

| # | Componente | Ancla | CTA presente |
|---|-----------|-------|--------------|
| 1 | TopNav | — | `Solicitar diagnostico` |
| 2 | HeroSection | `#inicio` | Primario + Secundario |
| 3 | BenefitsSection | `#beneficios` | — |
| 4 | ServicesSection | `#servicios` | `Hablar con un especialista` |
| 5 | ProcessSection | `#proceso` | `Conocer nuestro metodo` |
| 6 | UseCasesSection | `#casos` | `Ver flujos para mi empresa` |
| 7 | ComparisonSection | `#comparativa` | `Solicitar diagnostico` |
| 8 | ContactFormSection | `#contacto` | Submit principal |
| 9 | FaqSection | `#faq` | — |
| 10 | FinalCtaSection | — | `Hablar con un especialista` |
| 11 | FooterSection | — | `Solicitar diagnostico` |

### 4.3 Formulario

Campos: nombre completo, empresa, cargo, email corporativo, WhatsApp, sector, rango de inversion, descripcion del proceso (textarea).

- Validacion con `react-hook-form`: nombre, empresa, email y descripcion son obligatorios
- Submit a Formspree via `VITE_FORMSPREE_ID`
- Estado de exito: "Gracias. Recibimos tu solicitud y te contactaremos en breve."
- Estado de error: "Ocurrio un problema al enviar. Intenta nuevamente o escribenos por WhatsApp."

### 4.4 Analytics

```ts
// Solo si VITE_GA_ID está definido
if (import.meta.env.VITE_GA_ID) {
  gtag('event', 'form_submit', { event_category: 'conversion' })
}
```

No bloquea si no se define la variable.

### 4.5 SEO

Configurado en `index.html`:
- `<title>`: JAAGSOLUTIONS | Automatizacion y SaaS para PYMEs
- `<meta name="description">`: Optimizamos procesos empresariales con Automatizacion y desarrollo SaaS. Reduce costos, acelera operaciones y escala tu negocio con JAAGSOLUTIONS.
- OG tags: title, description, type

### 4.6 Responsive

Breakpoints Tailwind:
- Mobile: 1 columna, menu hamburguesa
- Tablet (`md`): 2 columnas en grids
- Desktop (`lg`): layouts completos segun wireframe

### 4.7 Workspace y Deploy en Vercel

`jaagsolutions-web/` NO es parte del workspace de pnpm del monorepo (no se agrega a `pnpm-workspace.yaml`). Tiene su propio `package.json` y se gestiona de forma independiente. Comandos locales:

```bash
cd jaagsolutions-web
pnpm install
pnpm dev      # desarrollo local
pnpm build    # build de produccion → dist/
```

Deploy en Vercel:

| Parametro | Valor |
|-----------|-------|
| Root directory | `jaagsolutions-web` |
| Build command | `pnpm build` |
| Output directory | `dist` |
| Node version | 20 |

Variables de entorno necesarias:
- `VITE_FORMSPREE_ID` — ID del form en Formspree
- `VITE_GA_ID` — ID de Google Analytics (opcional)

---

## 5. Criterios de aceptacion

### Seed
- [ ] `pnpm db:seed:jaagsolutions` corre sin errores con Paperclip activo
- [ ] La company JAAGSOLUTIONS aparece en la UI de Paperclip
- [ ] 4 agentes con jerarquia correcta visibles
- [ ] 4 goals con parentId correcto
- [ ] 2 proyectos con lead asignado
- [ ] 8 issues distribuidos correctamente
- [ ] Correr el script dos veces no duplica datos

### Web
- [ ] Todas las secciones renderizan sin errores
- [ ] Navegacion por anclas funciona en desktop y mobile
- [ ] Formulario valida obligatorios y envia a Formspree
- [ ] Confirmacion de exito/error visible al usuario
- [ ] Layout responsive sin desbordes en mobile
- [ ] SEO base implementado (title, meta, OG)
- [ ] Deploy en Vercel exitoso

---

## 6. Fuentes de referencia

Todos los datos provienen de los documentos en `Proyect_JAAGSOLUTIONS/`:

- `2026-04-15-jaagsolutions-blueprint.md` — estructura de company, goals, agentes
- `2026-04-15-jaagsolutions-mvp-30-dias.md` — backlog de 8 issues, KPIs
- `2026-04-15-jaagsolutions-copy-web-final.md` — copy completo de la landing
- `2026-04-15-jaagsolutions-wireframe-contenido.md` — estructura UI y componentes
- `2026-04-15-jaagsolutions-backlog-web-mvp.md` — tareas P0/P1/P2
- `2026-04-15-jaagsolutions-despliegue-paso-a-paso.md` — guia de despliegue Paperclip
