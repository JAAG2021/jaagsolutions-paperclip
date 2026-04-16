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
