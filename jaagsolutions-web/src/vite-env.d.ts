/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GA_ID?: string;
  readonly VITE_FORMSPREE_ID?: string;
  readonly VITE_OG_IMAGE_URL?: string;
  /** URL publica sin barra final; build inyecta og:image como {SITE}/og-share.jpg si no hay VITE_OG_IMAGE_URL */
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
