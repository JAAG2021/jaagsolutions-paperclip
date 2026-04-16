# JAAGSOLUTIONS - Despliegue paso a paso (de cero a operando)

Guia practica para desplegar Paperclip, configurar JAAGSOLUTIONS y arrancar operaciones.

## 1) Objetivo de este documento

Al finalizar esta guia debes tener:
- Paperclip ejecutandose localmente
- La company `JAAGSOLUTIONS` creada
- Goals, agentes, proyectos e issues del MVP cargados
- Reglas minimas de operacion y aprobacion activas
- Primer ciclo semanal de trabajo en marcha

## 2) Prerrequisitos

## 2.1 Software
- Node.js 20+
- pnpm 9+
- Git

## 2.2 Verificacion rapida

```bash
node -v
pnpm -v
git --version
```

## 3) Levantar Paperclip local

Desde la raiz del repo:

```bash
pnpm install
pnpm dev
```

Notas:
- Si `DATABASE_URL` no esta definido, Paperclip usa PostgreSQL embebido automaticamente.
- La app normalmente queda disponible en `http://localhost:3100`.
- Si 3100 esta ocupado, Paperclip puede usar otro puerto disponible.

## 4) Validar que el entorno esta sano

Con el servidor arriba, prueba:

```bash
curl http://localhost:3100/api/health
```

Si responde OK, continua.

## 5) Crear JAAGSOLUTIONS en la UI

1. Entra a la UI de Paperclip.
2. Ve a crear una nueva company.
3. Carga los datos base:
   - Name: `JAAGSOLUTIONS`
   - Description: agencia de automatizacion para terceros
   - Status: `active`

Referencia: usa `doc/plans/2026-04-15-jaagsolutions-mvp-30-dias.md` y `doc/plans/2026-04-15-jaagsolutions-blueprint.md`.

## 6) Cargar goals del MVP

Crea estos goals en orden:

1. `G0` (company): Lanzar operacion MVP rentable de automatizaciones en 30 dias
2. `G1` (team, parent G0): Entregar 1 caso de automatizacion de punta a punta con calidad
3. `G2` (team, parent G0): Implementar embudo minimo de captacion y seguimiento comercial
4. `G3` (team, parent G0): Establecer control operativo basico (aprobaciones + metricas)

## 7) Crear agentes (org chart minimo)

Crea estos 4 agentes y su jerarquia:

1. `A0` CEO JAAGSOLUTIONS (root)
2. `A1` PM Delivery Lead (reports_to A0)
3. `A2` Automation Builder (reports_to A1)
4. `A3` Growth Ops (reports_to A0)

Recomendacion:
- Mantener descripciones de capacidades cortas y accionables.
- Evitar prompts largos al inicio; iterar tras la semana 1.

## 8) Crear proyectos

1. `P1 - Client Delivery MVP` (goal G1, lead A1)
2. `P2 - Demand Engine MVP` (goal G2, lead A3)

## 9) Crear backlog inicial (8 issues)

Carga los 8 issues del documento MVP:
- I1 a I4 en `P1` (delivery)
- I5 a I8 en `P2` (marketing/comercial/control)

Prioridad sugerida:
- Alta: I1, I2, I3, I4, I5, I8
- Media: I6, I7

## 10) Configurar reglas minimas de gobernanza

Define que requieren aprobacion humana:
- Cambios en produccion del cliente
- Uso o rotacion de credenciales
- Envio de propuesta economica final

Define "Done" minimo por issue:
- Resultado funcional verificado
- Evidencia adjunta (captura/log/resumen)
- Nota de handoff o siguiente paso

## 11) Configurar presupuesto y control de costos

En la configuracion de agentes/company:
- Define presupuesto mensual inicial por agente
- Activa alertas para umbrales de gasto
- Configura hard-stop donde sea posible

Sugerencia inicial (ajustable):
- CEO/PM: bajo-medio
- Builder: medio-alto
- Growth: medio

## 12) Arranque operativo - Semana 1 (obligatorio)

Checklist de ejecucion:
- [ ] Oferta MVP definida (I1)
- [ ] Plantilla de discovery cerrada (I2)
- [ ] ICP inicial definido (I5)
- [ ] Tablero semanal creado (I8)

Salida minima semana 1:
- Oferta clara
- Guion de discovery utilizable
- Nicho inicial definido
- Seguimiento semanal activo

## 13) Ritual operativo recomendado

## Diario (15-20 min)
- Revisar issues bloqueados/en progreso
- Confirmar siguiente accion por issue activo
- Registrar riesgos y decisiones

## Semanal (45-60 min)
- Revisar KPI minimos:
  - leads nuevos
  - reuniones de diagnostico
  - propuestas enviadas
  - avance del piloto
  - margen estimado
- Repriorizar backlog (maximo 2 prioridades nuevas por semana)

## 14) Flujo de trabajo sugerido para el primer cliente

1. Discovery (proceso actual + dolor + KPI)
2. Diseno tecnico del flujo (A2)
3. Validacion de alcance y riesgo (A1 + A0)
4. Implementacion controlada (A2)
5. Pruebas y evidencia
6. Handoff al cliente + siguiente iteracion

## 15) Problemas comunes y resolucion rapida

## El servidor no inicia
- Verifica Node/pnpm
- Reintenta `pnpm install` y `pnpm dev`
- Revisa si el puerto ya esta ocupado

## No ves datos en UI
- Confirma que estas en la company correcta
- Verifica que goals/proyectos/issues esten vinculados

## Gasto sube sin control
- Baja frecuencia de ejecucion
- Reduce tareas simultaneas por agente
- Refuerza aprobaciones y hard-stop

## 16) Criterio de "listo para operar"

Considera JAAGSOLUTIONS operando cuando se cumplan todos:
- [ ] Company activa con estructura basica
- [ ] 3 goals del MVP creados y enlazados
- [ ] 4 agentes creados con jerarquia correcta
- [ ] 2 proyectos del MVP creados
- [ ] 8 issues cargados y priorizados
- [ ] Reglas de aprobacion y done definidas
- [ ] Presupuestos iniciales configurados
- [ ] Primer ritual semanal agendado

## 17) Siguiente paso recomendado

Cuando completes el setup:
1. Ejecuta semana 1 del MVP
2. Cierra 2-3 issues de alta prioridad
3. Ajusta prompts y capacidades por resultados reales
4. Evalua si agregas un quinto agente (QA formal) en semana 3

