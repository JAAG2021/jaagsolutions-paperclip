/**
 * Wordmark de Caligrapha (nuestro producto SaaS): version simplificada del
 * plumin de su marca (public/caligrapha/Logo_CALIGRAPHA_FINAL_.svg) + el
 * nombre en su cara serif (DM Serif Display).
 *
 * El SVG oficial es un dibujo de lineas finas pensado para verse grande;
 * a los ~13px que ocupa este icono ese trazo queda sub-pixel y se ve
 * borroso. Por eso el plumin va como silueta rellena (con la ranura y el
 * orificio "recortados" via fill-rule evenodd) en lugar de replicar cada
 * linea del original — misma forma, legible en miniatura.
 *
 * El plumín hereda `currentColor` para adaptarse al fondo (claro u oscuro)
 * donde se coloque. El tamaño se controla desde fuera con clases de
 * `font-size` (el plumín escala en `em`).
 */
type CaligraphaWordmarkProps = {
  className?: string;
  /** Clase extra para la estrella (por defecto dorada). */
  sparkleClassName?: string;
  /** Oculta el texto y deja solo la estrella (p. ej. como bullet). */
  markOnly?: boolean;
};

export default function CaligraphaWordmark({
  className = "",
  sparkleClassName = "text-caligrapha-gold",
  markOnly = false,
}: CaligraphaWordmarkProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 leading-none ${className}`}>
      <svg
        viewBox="110 0 320 460"
        aria-hidden="true"
        className={`h-[0.95em] w-[0.66em] flex-shrink-0 ${sparkleClassName}`}
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M270 18 C258 39 245 60 231 82 C215 108 198 134 181 160 C166 183 151 205 137 225 C131 234 132 242 139 251 C151 267 161 285 169 306 C178 329 183 356 184 385 L184 431 C184 438 188 442 195 443 C244 449 296 449 345 443 C352 442 356 438 356 431 L356 385 C357 356 362 329 371 306 C379 285 389 267 401 251 C408 242 409 234 403 225 C389 205 374 183 359 160 C342 134 325 108 309 82 C295 60 282 39 270 18 Z M266 40 L274 40 L274 200 L266 200 Z M254 224 A16 16 0 1 1 286 224 A16 16 0 1 1 254 224 Z"
        />
      </svg>
      {!markOnly && (
        <span className="font-caligrapha tracking-tight">Caligrapha</span>
      )}
    </span>
  );
}
