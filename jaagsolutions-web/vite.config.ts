import type { IncomingMessage } from "node:http";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function readRawBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function escapeHtmlAttr(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function resolveOgUrl(env: Record<string, string>): string | undefined {
  const explicit = env.VITE_OG_IMAGE_URL?.trim();
  if (explicit) return explicit;
  const site = env.VITE_SITE_URL?.trim().replace(/\/+$/, "");
  if (!site) return undefined;
  return `${site}/og-share.jpg`;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    // Windows: default can bind IPv6-only so http://127.0.0.1:5173 fails; host true listens on all interfaces.
    server: {
      host: true,
      port: 5173,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (/\bnode_modules\/(?:react(?:-dom)?)(?:\/|$)/.test(id)) {
              return "react-vendor";
            }
            if (id.includes("node_modules/lucide-react")) {
              return "lucide-icons";
            }
            return undefined;
          },
        },
      },
    },
    plugins: [
      react(),
      {
        name: "dev-api-lead-proxy",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const pathOnly = req.url?.split("?")[0] ?? "";
            if (pathOnly !== "/api/lead") {
              next();
              return;
            }
            if (req.method !== "POST") {
              res.statusCode = 405;
              res.end();
              return;
            }
            const formId = env.VITE_FORMSPREE_ID?.trim();
            if (!formId) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Missing VITE_FORMSPREE_ID en .env" }));
              return;
            }
            try {
              const raw = await readRawBody(req);
              const upstream = await fetch(`https://formspree.io/f/${formId}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: raw,
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
          });
        },
      },
      {
        name: "inject-og-image-meta",
        transformIndexHtml(html) {
          const ogUrl = resolveOgUrl(env);
          if (!ogUrl) return html;
          const safe = escapeHtmlAttr(ogUrl);
          const injection = `
    <meta property="og:image" content="${safe}" />
    <meta property="og:image:alt" content="JAAGSOLUTIONS — Automatizacion y SaaS para PYMEs" />
    <meta property="og:locale" content="es_ES" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="${safe}" />`;
          return html.replace("</head>", `${injection}
  </head>`);
        },
      },
    ],
  };
});
