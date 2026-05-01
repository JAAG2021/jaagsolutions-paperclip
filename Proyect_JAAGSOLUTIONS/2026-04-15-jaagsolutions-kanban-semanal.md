# JAAGSOLUTIONS - Kanban semanal (MVP web)



Tablero operativo simple para ejecutar el lanzamiento web en 2 semanas.



## Codigo e implementacion (sincronizado 2026-04-30)



- **Rama Git:** `feature/jaagsolutions` (no esta en `master`; el worktree principal apunta a este HEAD).

- **Worktree:** `paperclip/.worktrees/jaagsolutions/` (mismo contenido que la rama).

- **Landing:** `jaagsolutions-web/` dentro de ese worktree — React + Vite + TS + Tailwind.

- **Build verificado:** `cd jaagsolutions-web` y `pnpm install --ignore-workspace` + `pnpm run build` (el monorepo padre suele pisar tipos si se usa solo `pnpm install` desde la carpeta del sitio).

- **Paperclip seed:** `jaagsolutions-seed.json` + `packages/db/src/seed-jaagsolutions.ts` en el mismo worktree.



## Instrucciones de uso



- Mueve cada tarea entre columnas: `Pendiente -> En progreso -> Hecho`

- Actualiza una vez al dia (inicio o cierre de jornada)

- Mantener foco en tareas P0 hasta Go-Live



---



## Pendiente



- [ ] W-007 Conexion de formulario a canal comercial — **configurar** `VITE_FORMSPREE_ID` en Vercel (sin ID el envio no llega a Formspree; el flujo UI sigue).

- [ ] W-010 Evento de conversion (form submit) — **configurar** `VITE_GA_ID` y cargar script gtag en `index.html` o equivalente (el evento `form_submit` ya esta en codigo).

- [ ] W-014 Optimizacion de rendimiento basica — revision formal (peso, lazy images, Lighthouse).

- [ ] W-015 QA funcional integral — checklist manual / pruebas E2E.

- [ ] W-017 Release de lanzamiento — deploy Vercel + smoke test prod.

- [ ] WhatsApp flotante: sustituir `521XXXXXXXXXX` en `App.tsx` por numero real.



### Pendiente (iteracion posterior)



- [ ] W-008 Antispam basico

- [ ] W-011 Eventos secundarios (CTA, scroll)

- [ ] W-013 Open Graph y social preview — faltaria **og:image** (title/description/type ya estan en `index.html`)

- [ ] W-016 Accesibilidad inicial (A11y)



---



## En progreso



- [ ] (Mover aqui tareas activas de hoy)



---



## Hecho



- [x] W-001 Estructura base de landing — `App.tsx` + secciones (Hero, Stats, Tools, Benefits, Servicios, Proceso, Casos, Testimonios, Pricing, Comparativa, Contacto, FAQ, CTA final, Footer).

- [x] W-002 Navegacion por anclas — `TopNav.tsx` (`#inicio`, `#servicios`, `#proceso`, `#casos`, `#contacto`).

- [x] W-003 Integrar copy final — contenido aplicado en secciones (validar diff vs `2026-04-15-jaagsolutions-copy-web-final.md` antes de release).

- [x] W-004 Componentes reutilizables base — `SectionHeader`, `Card`, `CTAButton`, `FaqItem`, hooks.

- [x] W-005 Responsive base — layout Tailwind responsive en componentes.

- [x] W-006 Formulario de contacto — `ContactFormSection.tsx` + `react-hook-form`.

- [x] W-009 FAQ en accordion — `FaqItem` / `FaqSection` en worktree.

- [x] W-012 SEO on-page base — `title` y `meta description` en `index.html`.

- [x] Build de produccion local — `pnpm run build` OK (2026-04-30) con `pnpm install --ignore-workspace` en `jaagsolutions-web`.



---



## Bloqueadores



- [ ] (Registrar bloqueadores con fecha y accion)



---



## Evidencia diaria



## Dia 1

- Resultado:

- Evidencia:

- Siguiente paso:



## Dia 2

- Resultado:

- Evidencia:

- Siguiente paso:



## Dia 3

- Resultado:

- Evidencia:

- Siguiente paso:



## Dia 4

- Resultado:

- Evidencia:

- Siguiente paso:



## Dia 5

- Resultado:

- Evidencia:

- Siguiente paso:



## Dia 6

- Resultado:

- Evidencia:

- Siguiente paso:



## Dia 7

- Resultado:

- Evidencia:

- Siguiente paso:



## Dia 8

- Resultado:

- Evidencia:

- Siguiente paso:



## Dia 9

- Resultado:

- Evidencia:

- Siguiente paso:



## Dia 10

- Resultado:

- Evidencia:

- Siguiente paso:



---



## Checklist de Go-Live



- [ ] Landing publica

- [ ] Formulario funcionando (con Formspree ID y prueba real de lead)

- [ ] Evento de conversion activo (GA + prueba de evento)

- [x] SEO base aplicado (ampliar con og:image antes de compartir en redes)

- [ ] QA sin errores criticos

- [x] CTA principal visible en secciones clave (Hero / nav / comparativa / cierre)



