/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GA_ID?: string;
  readonly VITE_FORMSPREE_ID?: string;
  readonly VITE_OG_IMAGE_URL?: string;
  /** URL publica sin barra final; build inyecta og:image como {SITE}/og-share.png si no hay VITE_OG_IMAGE_URL */
  readonly VITE_SITE_URL?: string;
  /** Opcional: URL absoluta HTTPS o ruta `/media/*.mp4` servida igual que la web. Si falla se intenta Lottie y el mock CSS. */
  readonly VITE_HERO_VIDEO_URL?: string;
  /** Ruta bajo `public` (ej `lottie/workflow-demo.json`) o URL HTTPS al JSON Lottie */
  readonly VITE_HERO_LOTTIE_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
