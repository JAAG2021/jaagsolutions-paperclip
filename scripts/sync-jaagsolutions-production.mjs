#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const wake = args.has("--wake");
const apiBase = (process.env.PAPERCLIP_API_URL || "http://127.0.0.1:3100").replace(/\/+$/, "");
const apiKey = process.env.PAPERCLIP_API_KEY || process.env.PAPERCLIP_AGENT_API_KEY || "";
const seedPath = resolve("Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json");
const seed = JSON.parse(readFileSync(seedPath, "utf8"));

const doneSyncComment =
  "Sincronizado con produccion. Evidencia: seed v2, CHECKLIST-MAESTRO-JAAGSOLUTIONS.md y workflow/post real revisado. Estado real confirmado por sincronizacion 2026-05-25.";

function usage() {
  console.log(`Usage:
  node scripts/sync-jaagsolutions-production.mjs --apply [--wake]

Environment:
  PAPERCLIP_API_URL   Base URL, default http://127.0.0.1:3100
  PAPERCLIP_API_KEY   Optional bearer token for production/private APIs

Without --apply the script runs as a dry run.`);
}

if (args.has("--help") || args.has("-h")) {
  usage();
  process.exit(0);
}

function headers() {
  return {
    "content-type": "application/json",
    accept: "application/json",
    ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
  };
}

async function request(method, path, body) {
  const url = `${apiBase}${path}`;
  const res = await fetch(url, {
    method,
    headers: headers(),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${method} ${url} failed: ${res.status} ${res.statusText}${text ? ` - ${text.slice(0, 500)}` : ""}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function maybe(method, path, body, label) {
  if (!apply) {
    console.log(`[dry-run] ${method} ${path} ${label ? `- ${label}` : ""}`);
    return null;
  }
  return request(method, path, body);
}

function byName(rows) {
  return new Map(rows.map((row) => [row.name, row]));
}

function byTitle(rows) {
  return new Map(rows.map((row) => [row.title, row]));
}

async function main() {
  console.log(`JAAGSOLUTIONS production sync`);
  console.log(`API: ${apiBase}`);
  console.log(`Mode: ${apply ? "apply" : "dry-run"}`);
  console.log(`Seed: ${seed.agents.length} agents, ${seed.goals.length} goals, ${seed.projects.length} projects, ${seed.issues.length} issues`);

  const companies = await request("GET", "/api/companies");
  let company = companies.find((candidate) => candidate.name === seed.company.name);
  if (!company) {
    company = await maybe("POST", "/api/companies", {
      name: seed.company.name,
      description: seed.company.description,
      budgetMonthlyCents: seed.company.budgetMonthlyCents,
    }, "create company");
    if (!company) {
      console.log("[dry-run] company would be created; stopping because dependent IDs do not exist yet");
      return;
    }
  } else {
    await maybe("PATCH", `/api/companies/${company.id}`, {
      description: seed.company.description,
      status: seed.company.status,
      budgetMonthlyCents: seed.company.budgetMonthlyCents,
    }, "update company");
  }

  const companyId = company.id;
  const agentIdByKey = new Map();
  const goalIdByKey = new Map();
  const projectIdByKey = new Map();

  let agents = await request("GET", `/api/companies/${companyId}/agents`);
  let agentsByName = byName(agents);
  const sortedAgents = [
    ...seed.agents.filter((agent) => agent.reportsToKey === null),
    ...seed.agents.filter((agent) => agent.reportsToKey !== null),
  ];

  for (const agent of sortedAgents) {
    const reportsTo = agent.reportsToKey ? agentIdByKey.get(agent.reportsToKey) ?? null : null;
    const payload = {
      name: agent.name,
      role: agent.role,
      title: agent.title,
      reportsTo,
      capabilities: agent.capabilities,
      adapterType: "process",
      adapterConfig: {},
      budgetMonthlyCents: agent.budgetMonthlyCents,
      metadata: {
        jaagsolutionsKey: agent.key,
        syncedAt: "2026-05-25",
      },
    };

    const existing = agentsByName.get(agent.name);
    let saved = existing;
    if (existing) {
      saved = await maybe("PATCH", `/api/agents/${existing.id}?companyId=${companyId}`, payload, `update agent ${agent.key}`) ?? existing;
    } else {
      saved = await maybe("POST", `/api/companies/${companyId}/agents`, payload, `create agent ${agent.key}`);
    }
    if (saved?.id) {
      agentIdByKey.set(agent.key, saved.id);
    }
  }

  agents = await request("GET", `/api/companies/${companyId}/agents`);
  agentsByName = byName(agents);
  for (const agent of seed.agents) {
    const existing = agentsByName.get(agent.name);
    if (existing?.id) agentIdByKey.set(agent.key, existing.id);
  }

  let goals = await request("GET", `/api/companies/${companyId}/goals`);
  let goalsByTitle = byTitle(goals);
  const sortedGoals = [
    ...seed.goals.filter((goal) => goal.parentKey === null),
    ...seed.goals.filter((goal) => goal.parentKey !== null),
  ];

  for (const goal of sortedGoals) {
    const payload = {
      title: goal.title,
      description: goal.description,
      level: goal.level,
      status: goal.status,
      parentId: goal.parentKey ? goalIdByKey.get(goal.parentKey) ?? null : null,
      ownerAgentId: agentIdByKey.get(goal.ownerKey) ?? null,
    };
    const existing = goalsByTitle.get(goal.title);
    let saved = existing;
    if (existing) {
      saved = await maybe("PATCH", `/api/goals/${existing.id}`, payload, `update goal ${goal.key}`) ?? existing;
    } else {
      saved = await maybe("POST", `/api/companies/${companyId}/goals`, payload, `create goal ${goal.key}`);
    }
    if (saved?.id) goalIdByKey.set(goal.key, saved.id);
  }

  goals = await request("GET", `/api/companies/${companyId}/goals`);
  goalsByTitle = byTitle(goals);
  for (const goal of seed.goals) {
    const existing = goalsByTitle.get(goal.title);
    if (existing?.id) goalIdByKey.set(goal.key, existing.id);
  }

  let projects = await request("GET", `/api/companies/${companyId}/projects`);
  let projectsByName = byName(projects);
  for (const project of seed.projects) {
    const payload = {
      name: project.name,
      description: project.description,
      status: project.status,
      goalId: goalIdByKey.get(project.goalKey) ?? null,
      leadAgentId: agentIdByKey.get(project.leadKey) ?? null,
    };
    const existing = projectsByName.get(project.name);
    let saved = existing;
    if (existing) {
      saved = await maybe("PATCH", `/api/projects/${existing.id}`, payload, `update project ${project.key}`) ?? existing;
    } else {
      saved = await maybe("POST", `/api/companies/${companyId}/projects`, payload, `create project ${project.key}`);
    }
    if (saved?.id) projectIdByKey.set(project.key, saved.id);
  }

  projects = await request("GET", `/api/companies/${companyId}/projects`);
  projectsByName = byName(projects);
  for (const project of seed.projects) {
    const existing = projectsByName.get(project.name);
    if (existing?.id) projectIdByKey.set(project.key, existing.id);
  }

  const issues = await request("GET", `/api/companies/${companyId}/issues`);
  const issuesByTitle = byTitle(issues);
  for (const issue of seed.issues) {
    const payload = {
      title: issue.title,
      description: issue.description,
      status: issue.status,
      priority: issue.priority,
      projectId: projectIdByKey.get(issue.projectKey) ?? null,
      goalId: goalIdByKey.get(issue.goalKey) ?? null,
      assigneeAgentId: agentIdByKey.get(issue.assigneeKey) ?? null,
    };
    const existing = issuesByTitle.get(issue.title);
    if (existing) {
      const needsDoneComment = existing.status !== "done" && issue.status === "done";
      await maybe("PATCH", `/api/issues/${existing.id}`, {
        ...payload,
        ...(needsDoneComment ? { comment: doneSyncComment } : {}),
      }, `update issue ${issue.title}`);
    } else {
      await maybe("POST", `/api/companies/${companyId}/issues`, payload, `create issue ${issue.title}`);
    }
  }

  if (wake) {
    for (const [key, agentId] of agentIdByKey.entries()) {
      await maybe("POST", `/api/agents/${agentId}/wakeup?companyId=${companyId}`, {
        source: "automation",
        triggerDetail: "system",
        reason: "jaagsolutions_production_sync_v2",
        payload: {
          syncDate: "2026-05-25",
          seedPath: "Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json",
          operatingModel: "docs/superpowers/specs/2026-05-25-jaagsolutions-production-sync-design.md",
        },
      }, `wake ${key}`);
    }
  }

  console.log(apply ? "Sync complete." : "Dry run complete. Re-run with --apply to modify Paperclip.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
