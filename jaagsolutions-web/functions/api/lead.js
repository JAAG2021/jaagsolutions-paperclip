/**
 * Cloudflare Pages Function — POST /api/lead
 * Proxy servidor → Formspree (mismo origen, sin CORS en el navegador).
 * Variables de entorno: VITE_FORMSPREE_ID (configurar en Cloudflare Pages → Settings → Variables).
 */

export async function onRequestPost({ request, env }) {
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

  try {
    const upstream = await fetch(`https://formspree.io/f/${formId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    const text = await upstream.text();
    const ct = upstream.headers.get("content-type") ?? "application/json";
    return new Response(text, { status: upstream.status, headers: { "Content-Type": ct } });
  } catch {
    return json({ error: "Upstream error" }, 502);
  }
}

export async function onRequest({ request, env }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }
  return onRequestPost({ request, env });
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
