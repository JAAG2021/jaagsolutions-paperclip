# JAAGSOLUTIONS - Backlog Web MVP

Backlog tecnico para construir y lanzar la landing web MVP de JAAGSOLUTIONS con enfoque en conversion B2B.

## 1) Objetivo del backlog

- Entregar una web funcional, clara y orientada a captacion de leads.
- Implementar contenido, formulario, analitica y SEO base.
- Salir a produccion con una version estable y medible.

## 2) Priorizacion

- **P0:** obligatorio para lanzamiento
- **P1:** recomendado para primera iteracion post-lanzamiento
- **P2:** mejoras de optimizacion y escalado

## 2.1) Decisiones de despliegue (fijadas)

- **Hosting:** [Vercel](https://vercel.com/) — deploy por Git, previews por rama/PR, adecuado para React + Vite.
- **Stack de referencia:** React + Vite + TypeScript (landing one-page segun wireframe y copy del repo).
- **Nota:** Conectar el repositorio del sitio a Vercel; usar build `npm run build` / `pnpm build` segun el gestor elegido en el proyecto web.

## 3) Sprint 1 - Fundacion y contenido (P0)

## Tarea W-001 (P0) - Crear estructura base de la landing
**Descripcion:** Implementar la pagina one-page con secciones definidas en wireframe.  
**Dependencias:** ninguna  
**Criterio de aceptacion:** todas las secciones renderizan sin errores.

## Tarea W-002 (P0) - Implementar navegacion por anclas
**Descripcion:** Crear menu con links a secciones (`#inicio`, `#servicios`, etc.).  
**Dependencias:** W-001  
**Criterio de aceptacion:** el scroll navega correctamente a cada seccion en desktop y mobile.

## Tarea W-003 (P0) - Integrar copy final
**Descripcion:** Cargar textos de `2026-04-15-jaagsolutions-copy-web-final.md`.  
**Dependencias:** W-001  
**Criterio de aceptacion:** contenido completo visible y consistente con el documento fuente.

## Tarea W-004 (P0) - Crear componentes reutilizables de seccion
**Descripcion:** Construir componentes base (SectionHeader, Card, CTA, FAQ item, etc.).  
**Dependencias:** W-001  
**Criterio de aceptacion:** se reduce duplicacion de markup y se mantiene consistencia visual.

## Tarea W-005 (P0) - Responsive base
**Descripcion:** Ajustar layout para mobile/tablet/desktop en todas las secciones.  
**Dependencias:** W-001, W-003  
**Criterio de aceptacion:** no hay desbordes ni superposiciones en breakpoints definidos.

## 4) Sprint 2 - Conversion y confianza (P0/P1)

## Tarea W-006 (P0) - Implementar formulario de contacto
**Descripcion:** Formulario con campos definidos y validacion de obligatorios.  
**Dependencias:** W-001, W-003  
**Criterio de aceptacion:** el usuario puede enviar solicitud y recibe confirmacion de exito/error.

## Tarea W-007 (P0) - Conectar formulario a destino comercial
**Descripcion:** Integrar con correo/CRM/webhook para recibir leads en canal operativo.  
**Dependencias:** W-006  
**Criterio de aceptacion:** cada envio llega al destino configurado con datos completos.

## Tarea W-008 (P1) - Proteccion antispam basica
**Descripcion:** Agregar validacion antispam (honeypot o captcha ligero).  
**Dependencias:** W-006  
**Criterio de aceptacion:** se reduce envio automatico no deseado sin afectar conversion legitima.

## Tarea W-009 (P1) - Seccion FAQ en accordion
**Descripcion:** Implementar componente de preguntas frecuentes expandible.  
**Dependencias:** W-003  
**Criterio de aceptacion:** FAQ funciona correctamente y mejora claridad de objeciones comunes.

## 5) Sprint 3 - Medicion y visibilidad (P0/P1)

## Tarea W-010 (P0) - Instrumentar evento de conversion
**Descripcion:** Medir envio de formulario como evento principal.  
**Dependencias:** W-006, W-007  
**Criterio de aceptacion:** evento visible en herramienta de analitica definida.

## Tarea W-011 (P1) - Instrumentar eventos secundarios
**Descripcion:** Track de clics en CTA principales y scroll depth por seccion.  
**Dependencias:** W-010  
**Criterio de aceptacion:** dashboard basico de embudo disponible.

## Tarea W-012 (P0) - SEO on-page base
**Descripcion:** Configurar title, meta description, headings y estructura semantica.  
**Dependencias:** W-003  
**Criterio de aceptacion:** pagina indexable con metadatos correctos.

## Tarea W-013 (P1) - Open Graph y preview social
**Descripcion:** Definir OG title, OG description y OG image.  
**Dependencias:** W-012  
**Criterio de aceptacion:** enlaces compartidos muestran preview correcto.

## 6) Sprint 4 - Rendimiento y salida (P0/P2)

## Tarea W-014 (P0) - Optimizar rendimiento basico
**Descripcion:** Comprimir recursos, lazy-load de imagenes y limpieza de JS/CSS innecesario.  
**Dependencias:** W-001 a W-013  
**Criterio de aceptacion:** carga rapida en mobile y sin bloqueos relevantes.

## Tarea W-015 (P0) - QA funcional integral
**Descripcion:** Pruebas end-to-end de navegacion, formulario, anclas y CTAs.  
**Dependencias:** W-001 a W-014  
**Criterio de aceptacion:** flujo completo validado sin errores criticos.

## Tarea W-016 (P2) - Accesibilidad inicial (A11y)
**Descripcion:** Revisar contraste, labels, focus y navegacion por teclado.  
**Dependencias:** W-015  
**Criterio de aceptacion:** cumplimiento basico de accesibilidad en componentes principales.

## Tarea W-017 (P0) - Preparar release de lanzamiento
**Descripcion:** Checklist final, deploy y verificacion post-release.  
**Dependencias:** W-015  
**Criterio de aceptacion:** web publica operativa y captando leads.

## 7) Definicion de listo para lanzamiento (Go-Live)

Se puede lanzar cuando:
- [ ] Todas las tareas P0 completadas
- [ ] Formulario conectado y probado en entorno real
- [ ] Evento de conversion visible en analitica
- [ ] SEO base configurado
- [ ] QA funcional sin errores bloqueantes
- [ ] CTA principal visible en Hero, comparativa y cierre

## 8) Riesgos y mitigacion

## Riesgo 1 - Formulario no entrega leads
- **Mitigacion:** pruebas con multiples correos y fallback de contacto alterno.

## Riesgo 2 - Baja conversion inicial
- **Mitigacion:** testear variaciones de Hero, CTA y orden de secciones.

## Riesgo 3 - Sitio lento en mobile
- **Mitigacion:** reducir peso de imagenes, minimizar scripts y revisar render blocking.

## 9) KPIs del MVP web

- Tasa de conversion de formulario
- Clics en CTA primario
- Tiempo promedio en pagina
- Scroll hasta seccion de contacto
- Leads calificados por semana

## 10) Recomendacion operativa post-lanzamiento (30 dias)

Semana 1:
- Monitoreo diario de envios y errores
- Ajustes de copy en Hero/CTA segun feedback

Semana 2:
- Analisis de conversion por seccion
- Ajuste de FAQ y objeciones comerciales

Semana 3:
- Publicacion de primer caso de uso con resultado
- Ajuste de comparativa Automatizacion vs SaaS

Semana 4:
- Retro del embudo completo
- Plan de iteracion v2 (nuevas secciones o mejoras visuales)

