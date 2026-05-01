const GA_MEASUREMENT_ID = /^G-[A-Z0-9]+$/i;

/**
 * GA4 oficial: etiqueta asíncrona + bloque inline con dataLayer (la cola atiende al cargar gtag.js).
 */
export function initGoogleAnalytics(): void {
  const gaId = import.meta.env.VITE_GA_ID?.trim();
  if (!gaId || typeof document === "undefined") return;

  if (!GA_MEASUREMENT_ID.test(gaId)) {
    if (import.meta.env.DEV) {
      console.warn("[analytics] VITE_GA_ID debe ser un ID de medición GA4 (formato G-XXXXXXXX).");
    }
    return;
  }

  const external = document.createElement("script");
  external.async = true;
  external.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  document.head.appendChild(external);

  const inline = document.createElement("script");
  inline.textContent = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(gaId)});
`;
  document.head.appendChild(inline);
}
