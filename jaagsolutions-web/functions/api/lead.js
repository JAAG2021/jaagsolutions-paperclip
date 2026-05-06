/**
 * Cloudflare Pages Function — POST /api/lead
 * Proxy servidor → Formspree + reenvío a n8n (sin plan premium de Formspree).
 * Variables de entorno (Cloudflare Pages → Settings → Variables):
 *   VITE_FORMSPREE_ID    — ID del form en Formspree
 *   N8N_WEBHOOK_URL      — https://n8n.jaagsolutions.com/webhook/formspree-lead
 *   N8N_WEBHOOK_SECRET   — mismo valor que FORMSPREE_WEBHOOK_SECRET en VPS .env
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  // Honeypot antispam — bots llenan el campo _hp, humanos no
  if (body._hp) {
    return json({ ok: true }, 200);
  }

  const formId = env.VITE_FORMSPREE_ID?.trim();
  if (!formId) {
    return json({ error: "Missing VITE_FORMSPREE_ID" }, 500);
  }

  const origin = request.headers.get("origin") ?? request.headers.get("referer") ?? "";

  // Reenvío a n8n en background (fire-and-forget, no bloquea la respuesta)
  const n8nUrl = env.N8N_WEBHOOK_URL?.trim();
  const n8nSecret = env.N8N_WEBHOOK_SECRET?.trim();
  if (n8nUrl) {
    const n8nBody = { ...body, form: formId };
    context.waitUntil(
      fetch(n8nUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(n8nSecret && { "x-paperclip-webhook-token": n8nSecret }),
        },
        body: JSON.stringify(n8nBody),
      }).catch(() => {}),
    );
  }

  try {
    const upstream = await fetch(`https://formspree.io/f/${formId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(origin && { Origin: origin, Referer: origin }),
      },
      body: JSON.stringify(body),
    });
    const text = await upstream.text();
    const ct = upstream.headers.get("content-type") ?? "application/json";
    return new Response(text, { status: upstream.status, headers: { "Content-Type": ct } });
  } catch {
    return json({ error: "Upstream error" }, 502);
  }
}

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }
  return onRequestPost(context);
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
