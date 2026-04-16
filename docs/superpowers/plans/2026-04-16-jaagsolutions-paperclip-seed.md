# JAAGSOLUTIONS Paperclip Seed — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cargar la company JAAGSOLUTIONS con goals, agentes, proyectos e issues en Paperclip usando un archivo JSON declarativo y un loader TypeScript idempotente.

**Architecture:** Un archivo `jaagsolutions-seed.json` contiene todos los datos de negocio con claves simbolicas (A0, G0, P1, etc.). Un loader `seed-jaagsolutions.ts` lee ese JSON, resuelve las referencias entre entidades y ejecuta upserts idempotentes contra la DB de Paperclip usando Drizzle ORM. El orden de insercion garantiza integridad referencial: company → agents → goals → projects → issues.

**Tech Stack:** TypeScript, Drizzle ORM (postgres-js), Node.js 20+, tsx

---

## File Map

| Accion | Archivo |
|--------|---------|
| Crear | `Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json` |
| Crear | `packages/db/src/seed-jaagsolutions.ts` |
| Modificar | `packages/db/package.json` |
| Modificar | `package.json` (root) |

---

### Task 1: Crear el archivo JSON seed declarativo

**Files:**
- Create: `Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json`

- [ ] **Step 1: Crear el archivo JSON con todos los datos de JAAGSOLUTIONS**

```json
{
  "company": {
    "name": "JAAGSOLUTIONS",
    "description": "Agencia de automatizacion de flujos para terceros con operacion comercial y de entrega parcialmente automatizada.",
    "status": "active",
    "issuePrefix": "JAAG",
    "budgetMonthlyCents": 200000
  },
  "agents": [
    {
      "key": "A0",
      "name": "CEO JAAGSOLUTIONS",
      "role": "ceo",
      "title": "Direccion Estrategica",
      "reportsToKey": null,
      "capabilities": "Define prioridades estrategicas y foco trimestral. Evalua rentabilidad por servicio, cliente y vertical. Toma decisiones de inversion operativa y comercial. Aprueba cambios de alto impacto (produccion, pricing, compromisos criticos).",
      "budgetMonthlyCents": 30000
    },
    {
      "key": "A1",
      "name": "PM Delivery Lead",
      "role": "pm",
      "title": "Operaciones y Entrega",
      "reportsToKey": "A0",
      "capabilities": "Convierte objetivos en roadmap y backlog ejecutable. Planifica capacidad, prioridades y dependencias. Monitorea SLA, bloqueos y riesgos de ejecucion. Coordina handoff entre arquitectura, implementacion, QA y soporte.",
      "budgetMonthlyCents": 20000
    },
    {
      "key": "A2",
      "name": "Automation Builder",
      "role": "engineer",
      "title": "Integraciones y Workflows",
      "reportsToKey": "A1",
      "capabilities": "Implementa flujos, integraciones y reglas de negocio. Realiza pruebas tecnicas iniciales y documentacion tecnica. Ejecuta ajustes de performance y confiabilidad. Registra evidencia de entrega por tarea.",
      "budgetMonthlyCents": 40000
    },
    {
      "key": "A3",
      "name": "Growth Ops",
      "role": "marketing",
      "title": "Estrategia de Adquisicion",
      "reportsToKey": "A0",
      "capabilities": "Gestiona CRM y pipeline de oportunidades. Califica leads con criterios definidos. Automatiza seguimiento y recordatorios. Prepara propuestas y controla tiempos de respuesta.",
      "budgetMonthlyCents": 25000
    }
  ],
  "goals": [
    {
      "key": "G0",
      "title": "Lanzar operacion MVP rentable de automatizaciones en 30 dias",
      "description": "Establecer y operar JAAGSOLUTIONS como proveedor confiable de automatizaciones empresariales, con adquisicion de clientes y entrega de valor predecible.",
      "level": "company",
      "status": "active",
      "parentKey": null,
      "ownerKey": "A0"
    },
    {
      "key": "G1",
      "title": "Entregar 1 caso de automatizacion de punta a punta con calidad",
      "description": "Estandarizar el ciclo discovery -> diseno -> implementacion -> QA -> despliegue -> soporte, minimizando retrabajo y maximizando satisfaccion del cliente.",
      "level": "team",
      "status": "active",
      "parentKey": "G0",
      "ownerKey": "A1"
    },
    {
      "key": "G2",
      "title": "Implementar embudo minimo de captacion y seguimiento comercial",
      "description": "Disenar e implementar un embudo continuo de captacion, nurturing, calificacion y cierre para sostener el crecimiento de la agencia.",
      "level": "team",
      "status": "active",
      "parentKey": "G0",
      "ownerKey": "A3"
    },
    {
      "key": "G3",
      "title": "Establecer control operativo basico (aprobaciones + metricas)",
      "description": "Definir politicas, metricas, aprobaciones y tableros que permitan escalar equipo y clientes con control de costos y calidad.",
      "level": "team",
      "status": "active",
      "parentKey": "G0",
      "ownerKey": "A0"
    }
  ],
  "projects": [
    {
      "key": "P1",
      "name": "Client Delivery MVP",
      "description": "Implementar el sistema operativo interno para entregar automatizaciones a clientes con calidad y repetibilidad.",
      "status": "planned",
      "goalKey": "G1",
      "leadKey": "A1"
    },
    {
      "key": "P2",
      "name": "Demand Engine MVP",
      "description": "Construir y automatizar el embudo completo de captacion, nurturing, calificacion y agendamiento comercial.",
      "status": "planned",
      "goalKey": "G2",
      "leadKey": "A3"
    }
  ],
  "issues": [
    {
      "title": "Definir oferta MVP de servicio",
      "description": "Definir alcance, entregables y precio base del paquete Starter para el cliente piloto.",
      "projectKey": "P1",
      "goalKey": "G1",
      "assigneeKey": "A1",
      "createdByKey": "A0",
      "priority": "high",
      "status": "backlog"
    },
    {
      "title": "Crear plantilla de discovery para cliente piloto",
      "description": "Cerrar plantilla de discovery comercial-tecnico utilizable desde la primera reunion.",
      "projectKey": "P1",
      "goalKey": "G1",
      "assigneeKey": "A1",
      "createdByKey": "A0",
      "priority": "high",
      "status": "backlog"
    },
    {
      "title": "Disenar arquitectura del flujo piloto",
      "description": "Disenar arquitectura funcional y tecnica del flujo piloto una vez seleccionado el cliente ganador.",
      "projectKey": "P1",
      "goalKey": "G1",
      "assigneeKey": "A2",
      "createdByKey": "A1",
      "priority": "high",
      "status": "backlog"
    },
    {
      "title": "Implementar y validar automatizacion piloto",
      "description": "Construir flujo principal, probar casos normales y de error, documentar limites operativos y preparar handoff.",
      "projectKey": "P1",
      "goalKey": "G1",
      "assigneeKey": "A2",
      "createdByKey": "A1",
      "priority": "high",
      "status": "backlog"
    },
    {
      "title": "Definir ICP y propuesta de valor",
      "description": "Definir perfil de cliente ideal (1 nicho) y propuesta de valor diferenciada para el MVP comercial.",
      "projectKey": "P2",
      "goalKey": "G2",
      "assigneeKey": "A3",
      "createdByKey": "A0",
      "priority": "high",
      "status": "backlog"
    },
    {
      "title": "Crear activo de captacion + CTA a diagnostico",
      "description": "Publicar landing o formulario con CTA de diagnostico empresarial gratuito.",
      "projectKey": "P2",
      "goalKey": "G2",
      "assigneeKey": "A3",
      "createdByKey": "A0",
      "priority": "medium",
      "status": "backlog"
    },
    {
      "title": "Automatizar seguimiento de leads",
      "description": "Configurar flujo minimo de seguimiento automatico para leads que no responden en 48h.",
      "projectKey": "P2",
      "goalKey": "G2",
      "assigneeKey": "A3",
      "createdByKey": "A0",
      "priority": "medium",
      "status": "backlog"
    },
    {
      "title": "Configurar tablero semanal de control",
      "description": "Crear dashboard semanal con KPIs minimos: leads nuevos, reuniones realizadas, propuestas enviadas, avance del piloto y margen estimado.",
      "projectKey": "P2",
      "goalKey": "G3",
      "assigneeKey": "A0",
      "createdByKey": "A0",
      "priority": "high",
      "status": "backlog"
    }
  ]
}
```

- [ ] **Step 2: Verificar que el JSON es valido**

```bash
node -e "JSON.parse(require('fs').readFileSync('Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json','utf8')); console.log('JSON valido')"
```

Resultado esperado: `JSON valido`

- [ ] **Step 3: Commit**

```bash
git add Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json
git commit -m "feat(jaagsolutions): add declarative seed JSON with company, agents, goals, projects and issues"
```

---

### Task 2: Crear el loader TypeScript idempotente

**Files:**
- Create: `packages/db/src/seed-jaagsolutions.ts`

- [ ] **Step 1: Crear el archivo del loader**

```typescript
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { eq, and } from "drizzle-orm";
import { createDb } from "./client.js";
import { companies, agents, goals, projects, issues } from "./schema/index.js";

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentSeed = {
  key: string;
  name: string;
  role: string;
  title: string;
  reportsToKey: string | null;
  capabilities: string;
  budgetMonthlyCents: number;
};

type GoalSeed = {
  key: string;
  title: string;
  description: string;
  level: string;
  status: string;
  parentKey: string | null;
  ownerKey: string;
};

type ProjectSeed = {
  key: string;
  name: string;
  description: string;
  status: string;
  goalKey: string;
  leadKey: string;
};

type IssueSeed = {
  title: string;
  description: string;
  projectKey: string;
  goalKey: string;
  assigneeKey: string;
  createdByKey: string;
  priority: string;
  status: string;
};

type SeedData = {
  company: {
    name: string;
    description: string;
    status: string;
    issuePrefix: string;
    budgetMonthlyCents: number;
  };
  agents: AgentSeed[];
  goals: GoalSeed[];
  projects: ProjectSeed[];
  issues: IssueSeed[];
};

// ─── Setup ────────────────────────────────────────────────────────────────────

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    "DATABASE_URL is required.\n" +
    "Start Paperclip first (pnpm dev), then run:\n" +
    "  DATABASE_URL=postgresql://postgres@localhost:54329/paperclip pnpm seed:jaagsolutions",
  );
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const seedPath = resolve(__dirname, "../../../Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json");

const seed = JSON.parse(readFileSync(seedPath, "utf-8")) as SeedData;
const db = createDb(url);

let created = 0;
let updated = 0;

function track(action: "created" | "updated") {
  if (action === "created") created++;
  else updated++;
}

// ─── Upsert helpers ───────────────────────────────────────────────────────────

async function upsertCompany() {
  const [existing] = await db
    .select()
    .from(companies)
    .where(eq(companies.name, seed.company.name))
    .limit(1);

  if (existing) {
    await db
      .update(companies)
      .set({ ...seed.company, updatedAt: new Date() })
      .where(eq(companies.id, existing.id));
    track("updated");
    return existing.id;
  }

  const [record] = await db.insert(companies).values(seed.company).returning();
  track("created");
  return record!.id;
}

async function upsertAgent(
  companyId: string,
  agentSeed: AgentSeed,
  idMap: Map<string, string>,
) {
  const reportsTo = agentSeed.reportsToKey ? idMap.get(agentSeed.reportsToKey) ?? null : null;

  const values = {
    companyId,
    name: agentSeed.name,
    role: agentSeed.role,
    title: agentSeed.title,
    reportsTo,
    capabilities: agentSeed.capabilities,
    adapterType: "process" as const,
    adapterConfig: {} as Record<string, unknown>,
    budgetMonthlyCents: agentSeed.budgetMonthlyCents,
    status: "idle",
  };

  const [existing] = await db
    .select()
    .from(agents)
    .where(and(eq(agents.companyId, companyId), eq(agents.name, agentSeed.name)))
    .limit(1);

  if (existing) {
    await db
      .update(agents)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(agents.id, existing.id));
    track("updated");
    return existing.id;
  }

  const [record] = await db.insert(agents).values(values).returning();
  track("created");
  return record!.id;
}

async function upsertGoal(
  companyId: string,
  goalSeed: GoalSeed,
  agentIdMap: Map<string, string>,
  goalIdMap: Map<string, string>,
) {
  const ownerAgentId = agentIdMap.get(goalSeed.ownerKey) ?? null;
  const parentId = goalSeed.parentKey ? goalIdMap.get(goalSeed.parentKey) ?? null : null;

  const values = {
    companyId,
    title: goalSeed.title,
    description: goalSeed.description,
    level: goalSeed.level,
    status: goalSeed.status,
    parentId,
    ownerAgentId,
  };

  const [existing] = await db
    .select()
    .from(goals)
    .where(and(eq(goals.companyId, companyId), eq(goals.title, goalSeed.title)))
    .limit(1);

  if (existing) {
    await db
      .update(goals)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(goals.id, existing.id));
    track("updated");
    return existing.id;
  }

  const [record] = await db.insert(goals).values(values).returning();
  track("created");
  return record!.id;
}

async function upsertProject(
  companyId: string,
  projectSeed: ProjectSeed,
  agentIdMap: Map<string, string>,
  goalIdMap: Map<string, string>,
) {
  const goalId = goalIdMap.get(projectSeed.goalKey) ?? null;
  const leadAgentId = agentIdMap.get(projectSeed.leadKey) ?? null;

  const values = {
    companyId,
    name: projectSeed.name,
    description: projectSeed.description,
    status: projectSeed.status,
    goalId,
    leadAgentId,
  };

  const [existing] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.companyId, companyId), eq(projects.name, projectSeed.name)))
    .limit(1);

  if (existing) {
    await db
      .update(projects)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(projects.id, existing.id));
    track("updated");
    return existing.id;
  }

  const [record] = await db.insert(projects).values(values).returning();
  track("created");
  return record!.id;
}

async function upsertIssue(
  companyId: string,
  issueSeed: IssueSeed,
  agentIdMap: Map<string, string>,
  goalIdMap: Map<string, string>,
  projectIdMap: Map<string, string>,
) {
  const projectId = projectIdMap.get(issueSeed.projectKey) ?? null;
  const goalId = goalIdMap.get(issueSeed.goalKey) ?? null;
  const assigneeAgentId = agentIdMap.get(issueSeed.assigneeKey) ?? null;
  const createdByAgentId = agentIdMap.get(issueSeed.createdByKey) ?? null;

  const values = {
    companyId,
    title: issueSeed.title,
    description: issueSeed.description,
    projectId,
    goalId,
    assigneeAgentId,
    createdByAgentId,
    priority: issueSeed.priority,
    status: issueSeed.status,
  };

  const [existing] = await db
    .select()
    .from(issues)
    .where(and(eq(issues.companyId, companyId), eq(issues.title, issueSeed.title)))
    .limit(1);

  if (existing) {
    await db
      .update(issues)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(issues.id, existing.id));
    track("updated");
    return existing.id;
  }

  const [record] = await db.insert(issues).values(values).returning();
  track("created");
  return record!.id;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log("Cargando JAAGSOLUTIONS en Paperclip...\n");

// 1. Company
const companyId = await upsertCompany();
console.log(`  ✓ Company: ${seed.company.name} (${companyId})`);

// 2. Agents — insertar en orden: primero los que no tienen reportsTo
const agentIdMap = new Map<string, string>();
const sortedAgents = [
  ...seed.agents.filter((a) => a.reportsToKey === null),
  ...seed.agents.filter((a) => a.reportsToKey !== null),
];

for (const agentSeed of sortedAgents) {
  const id = await upsertAgent(companyId, agentSeed, agentIdMap);
  agentIdMap.set(agentSeed.key, id);
  console.log(`  ✓ Agent [${agentSeed.key}]: ${agentSeed.name}`);
}

// 3. Goals — G0 primero, luego los que tienen parentKey
const goalIdMap = new Map<string, string>();
const sortedGoals = [
  ...seed.goals.filter((g) => g.parentKey === null),
  ...seed.goals.filter((g) => g.parentKey !== null),
];

for (const goalSeed of sortedGoals) {
  const id = await upsertGoal(companyId, goalSeed, agentIdMap, goalIdMap);
  goalIdMap.set(goalSeed.key, id);
  console.log(`  ✓ Goal [${goalSeed.key}]: ${goalSeed.title}`);
}

// 4. Projects
const projectIdMap = new Map<string, string>();
for (const projectSeed of seed.projects) {
  const id = await upsertProject(companyId, projectSeed, agentIdMap, goalIdMap);
  projectIdMap.set(projectSeed.key, id);
  console.log(`  ✓ Project [${projectSeed.key}]: ${projectSeed.name}`);
}

// 5. Issues
for (const issueSeed of seed.issues) {
  await upsertIssue(companyId, issueSeed, agentIdMap, goalIdMap, projectIdMap);
  console.log(`  ✓ Issue: ${issueSeed.title}`);
}

console.log(`\n✓ JAAGSOLUTIONS seed completo — ${created} creados, ${updated} actualizados`);
process.exit(0);
```

- [ ] **Step 2: Commit**

```bash
git add packages/db/src/seed-jaagsolutions.ts
git commit -m "feat(jaagsolutions): add idempotent seed loader for Paperclip"
```

---

### Task 3: Agregar scripts npm

**Files:**
- Modify: `packages/db/package.json`
- Modify: `package.json` (root)

- [ ] **Step 1: Agregar script en `packages/db/package.json`**

En la seccion `"scripts"`, agregar despues de `"seed": "tsx src/seed.ts"`:

```json
"seed:jaagsolutions": "tsx src/seed-jaagsolutions.ts"
```

El bloque scripts completo queda:

```json
"scripts": {
  "check:migrations": "tsx src/check-migration-numbering.ts",
  "build": "pnpm run check:migrations && tsc && cp -r src/migrations dist/migrations",
  "clean": "rm -rf dist",
  "typecheck": "pnpm run check:migrations && tsc --noEmit",
  "generate": "pnpm run check:migrations && tsc -p tsconfig.json && drizzle-kit generate",
  "migrate": "pnpm run check:migrations && tsx src/migrate.ts",
  "seed": "tsx src/seed.ts",
  "seed:jaagsolutions": "tsx src/seed-jaagsolutions.ts"
}
```

- [ ] **Step 2: Agregar script en `package.json` (root)**

En la seccion `"scripts"`, agregar despues de `"db:migrate"`:

```json
"db:seed:jaagsolutions": "pnpm --filter @paperclipai/db seed:jaagsolutions"
```

- [ ] **Step 3: Verificar typecheck del loader**

```bash
pnpm --filter @paperclipai/db typecheck
```

Resultado esperado: sin errores de TypeScript.

- [ ] **Step 4: Commit**

```bash
git add packages/db/package.json package.json
git commit -m "feat(jaagsolutions): add db:seed:jaagsolutions npm script"
```

---

### Task 4: Ejecutar el seed y verificar en Paperclip

**Files:** ninguno nuevo

- [ ] **Step 1: Asegurarse de que Paperclip esta corriendo**

```bash
pnpm dev
```

Esperar hasta ver en la consola que el servidor esta escuchando (normalmente en http://localhost:3100).

- [ ] **Step 2: Ejecutar el seed en una segunda terminal**

```bash
DATABASE_URL=postgresql://postgres@localhost:54329/paperclip pnpm db:seed:jaagsolutions
```

Resultado esperado:
```
Cargando JAAGSOLUTIONS en Paperclip...

  ✓ Company: JAAGSOLUTIONS (uuid...)
  ✓ Agent [A0]: CEO JAAGSOLUTIONS
  ✓ Agent [A3]: Growth Ops
  ✓ Agent [A1]: PM Delivery Lead
  ✓ Agent [A2]: Automation Builder
  ✓ Goal [G0]: Lanzar operacion MVP rentable de automatizaciones en 30 dias
  ✓ Goal [G1]: Entregar 1 caso de automatizacion de punta a punta con calidad
  ✓ Goal [G2]: Implementar embudo minimo de captacion y seguimiento comercial
  ✓ Goal [G3]: Establecer control operativo basico (aprobaciones + metricas)
  ✓ Project [P1]: Client Delivery MVP
  ✓ Project [P2]: Demand Engine MVP
  ✓ Issue: Definir oferta MVP de servicio
  ✓ Issue: Crear plantilla de discovery para cliente piloto
  ✓ Issue: Disenar arquitectura del flujo piloto
  ✓ Issue: Implementar y validar automatizacion piloto
  ✓ Issue: Definir ICP y propuesta de valor
  ✓ Issue: Crear activo de captacion + CTA a diagnostico
  ✓ Issue: Automatizar seguimiento de leads
  ✓ Issue: Configurar tablero semanal de control

✓ JAAGSOLUTIONS seed completo — 15 creados, 0 actualizados
```

- [ ] **Step 3: Verificar idempotencia — correr una segunda vez**

```bash
DATABASE_URL=postgresql://postgres@localhost:54329/paperclip pnpm db:seed:jaagsolutions
```

Resultado esperado:
```
✓ JAAGSOLUTIONS seed completo — 0 creados, 15 actualizados
```

- [ ] **Step 4: Verificar en la UI de Paperclip**

Abrir http://localhost:3100. Verificar:
- Company "JAAGSOLUTIONS" visible en el selector de companies
- 4 agentes con jerarquia correcta (CEO sin reportsTo, PM y Growth reportan al CEO, Builder reporta al PM)
- 4 goals: G0 como company goal, G1/G2/G3 como team goals con parent G0
- 2 proyectos: Client Delivery MVP y Demand Engine MVP
- 8 issues distribuidos entre los dos proyectos

Si el puerto del embedded postgres es diferente, buscar el valor en la configuracion de Paperclip (`~/.paperclip/instances/default/config.json` o el archivo de config activo) y ajustar el `DATABASE_URL`.
