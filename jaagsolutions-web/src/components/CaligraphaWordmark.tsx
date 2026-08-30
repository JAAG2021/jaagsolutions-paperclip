/**
 * Wordmark de Caligrapha (nuestro producto SaaS): la estrella ✦ de 8 puntas
 * de su marca + el nombre en su cara serif (DM Serif Display).
 *
 * El ✦ va siempre en dorado; el texto hereda `currentColor` para adaptarse
 * al fondo (claro u oscuro) donde se coloque. El tamaño se controla desde
 * fuera con clases de `font-size` (el ✦ escala en `em`).
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
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={`h-[0.9em] w-[0.9em] flex-shrink-0 ${sparkleClassName}`}
        fill="currentColor"
      >
        <path d="M12 2 L13.6 10.4 L22 12 L13.6 13.6 L12 22 L10.4 13.6 L2 12 L10.4 10.4 Z" />
      </svg>
      {!markOnly && (
        <span className="font-caligrapha tracking-tight">Caligrapha</span>
      )}
    </span>
  );
}
