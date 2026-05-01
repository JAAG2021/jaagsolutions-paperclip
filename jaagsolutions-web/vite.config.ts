import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function escapeHtmlAttr(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function resolveOgUrl(env: Record<string, string>): string | undefined {
  const explicit = env.VITE_OG_IMAGE_URL?.trim();
  if (explicit) return explicit;
  const site = env.VITE_SITE_URL?.trim().replace(/\/+$/, "");
  if (!site) return undefined;
  return `${site}/og-share.png`;
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
