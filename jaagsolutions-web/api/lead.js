/**
 * Proxy servidor → Formspree (el navegador llama al mismo origen; sin CORS).
 * Requiere VITE_FORMSPREE_ID en el entorno de Vercel (Settings → Environment Variables).
 */

export default async function handler(req, res) {
  if (req.body?._hp) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const formId = process.env.VITE_FORMSPREE_ID?.trim();
  if (!formId) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Missing VITE_FORMSPREE_ID" }));
    return;
  }

  try {
    const upstream = await fetch(`https://formspree.io/f/${formId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(req.body ?? {}),
    });

    const text = await upstream.text();
    const ct = upstream.headers.get("content-type") || "application/json";
    res.statusCode = upstream.status;
    res.setHeader("Content-Type", ct);
    res.end(text);
  } catch {
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Upstream error" }));
  }
}
