/**
 * Wordmark de Caligrapha (nuestro producto SaaS): el emblema del plumín
 * de su marca (public/caligrapha/Logo_CALIGRAPHA_FINAL_.svg) + el nombre
 * en su cara serif (DM Serif Display).
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
        viewBox="0 0 540 610"
        aria-hidden="true"
        className={`h-[0.9em] w-[0.8em] flex-shrink-0 ${sparkleClassName}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M270 18 C258 39 245 60 231 82 C215 108 198 134 181 160 C166 183 151 205 137 225 C131 234 132 242 139 251 C151 267 161 285 169 306 C178 329 183 356 184 385 L184 431 C184 438 188 442 195 443 C244 449 296 449 345 443 C352 442 356 438 356 431 L356 385 C357 356 362 329 371 306 C379 285 389 267 401 251 C408 242 409 234 403 225 C389 205 374 183 359 160 C342 134 325 108 309 82 C295 60 282 39 270 18 Z" />
        <path d="M270 43 L270 218" />
        <circle cx="270" cy="228" r="12" />
        <path d="M184 431 C238 424 302 424 356 431" />
        <path d="M183 444 C211 437 239 435 270 435 C301 435 329 437 357 444 L357 458 C330 451 301 449 270 449 C239 449 210 451 183 458 Z" />
        <path d="M176 463 C207 455 238 453 270 453 C302 453 333 455 364 463 L364 478 C333 470 302 468 270 468 C238 468 207 470 176 478 Z" />
        <path d="M168 491 C188 480 225 475 270 475 C315 475 352 480 372 491 C384 498 384 507 372 514 C352 526 315 531 270 531 C225 531 188 526 168 514 C156 507 156 498 168 491 Z" />
        <path d="M180 498 C199 490 232 486 270 486 C308 486 341 490 360 498 C366 501 366 504 360 507 C341 515 308 519 270 519 C232 519 199 515 180 507 C174 504 174 501 180 498 Z" />
      </svg>
      {!markOnly && (
        <span className="font-caligrapha tracking-tight">Caligrapha</span>
      )}
    </span>
  );
}
