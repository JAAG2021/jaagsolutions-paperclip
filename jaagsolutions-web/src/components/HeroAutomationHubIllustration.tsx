/**
 * Dashboard alineado al brief: isometría sugerida, paneles cristal, datos en vivo,
 * líneas luminosas (cian / magenta / amarillo / verde) hacia núcleo IA y nodos
 * WhatsApp, Telegram, Gmail, Google Sheets. Iconografía genérica + etiquetas.
 */
type Props = {
  className?: string;
  /** Rellena el contenedor tipo “cover” (recorta bordes del viewBox si no coincide la proporción). */
  fillFrame?: boolean;
  "aria-hidden"?: boolean;
};

export default function HeroAutomationHubIllustration({
  className = "",
  fillFrame = false,
  ...rest
}: Props) {
  const hubX = 360;
  const hubY = 252;

  const nodes = [
    { x: 118, y: 282, stroke: "#4ade80", label: "WhatsApp", badge: "#16a34a" },
    { x: 196, y: 142, stroke: "#22d3ee", label: "Telegram", badge: "#0284c7" },
    { x: 634, y: 156, stroke: "#e879f9", label: "Gmail", badge: "#dc2626" },
    { x: 652, y: 296, stroke: "#facc15", label: "Google Sheets", badge: "#15803d" },
  ] as const;

  return (
    <svg
      viewBox="0 0 720 420"
      className={className}
      preserveAspectRatio={fillFrame ? "xMidYMid slice" : "xMidYMid meet"}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <title>
        Vista isométrica 3D de un dashboard digital: paneles de cristal con datos en tiempo real y flujos
        luminosos entre WhatsApp, Telegram, Gmail, Google Sheets y un núcleo de IA tipo OpenAI
      </title>
      <defs>
        <radialGradient id="hub-amb" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="glass" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.05" />
        </linearGradient>
        <filter id="neon" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="neon-lite" x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation="2" result="bl" />
          <feMerge>
            <feMergeNode in="bl" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="float-shadow">
          <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#020617" floodOpacity="0.55" />
        </filter>
      </defs>

      <rect width="720" height="420" fill="#020917" rx="14" />

      <g opacity="0.95">
        <path d="M56 296 L360 224 L664 296 L360 368 Z" fill="#0c1a34" stroke="rgba(56,189,248,0.25)" strokeWidth="1.2" />
        <path d="M56 296 L360 368 L360 394 L56 324 Z" fill="#081225" opacity="0.92" />
        <path d="M664 296 L360 394 L360 368 L664 324 Z" fill="#0a1730" />
      </g>

      <ellipse cx={hubX} cy="384" rx="298" ry="72" fill="url(#hub-amb)" />

      <g filter="url(#float-shadow)" opacity="0.88">
        <path
          d="M246 56 L478 42 L494 118 L266 134 Z"
          fill="url(#glass)"
          stroke="rgba(147,197,253,0.3)"
          strokeWidth="1.2"
        />
        <path d="M286 74 L446 62 M286 88 L446 76" stroke="rgba(148,163,184,0.3)" strokeWidth="1" />
      </g>

      <g filter="url(#float-shadow)">
        <rect x="62" y="124" width="192" height="124" rx="16" fill="url(#glass)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
        <text x="78" y="148" fill="rgba(226,232,240,0.55)" fontSize="11" fontWeight="700" fontFamily="ui-sans-serif,system-ui,sans-serif">
          Datos en tiempo real
        </text>
        <path d="M78 226 L118 188 L154 206 L206 164 L246 178 L274 154" fill="none" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round" filter="url(#neon-lite)" />
        <path d="M78 234 L274 226" stroke="rgba(148,163,184,0.28)" strokeWidth="1" />
        <path d="M82 246 L274 246" stroke="rgba(34,211,238,0.35)" strokeWidth="5" strokeLinecap="round" />
      </g>

      <g filter="url(#float-shadow)">
        <rect x="474" y="118" width="184" height="128" rx="16" fill="url(#glass)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
        <text x="490" y="142" fill="rgba(226,232,240,0.55)" fontSize="11" fontWeight="700" fontFamily="ui-sans-serif,system-ui,sans-serif">
          Tableros en vivo
        </text>
        <circle cx="534" cy="192" r="38" fill="none" stroke="#38bdf8" strokeWidth="9" strokeDasharray="70 154" strokeLinecap="round" opacity="0.9" />
        <rect x="586" y="156" width="58" height="58" rx="8" fill="rgba(74,222,128,0.09)" stroke="rgba(74,222,128,0.35)" strokeWidth="1.1" />
        <path
          d="M596 168h42M596 178h42M596 188h42M608 200v-24M624 200v-18M640 200v-26"
          stroke="rgba(74,222,128,0.45)"
          strokeWidth="1.1"
        />
      </g>

      <g strokeWidth="2.8" strokeLinecap="round" fill="none" filter="url(#neon)">
        {nodes.map((n) => (
          <path
            key={`l-${n.label}`}
            d={`M${n.x} ${n.y} Q ${(hubX + n.x) / 2} ${(hubY + n.y) / 2 - 20} ${hubX} ${hubY}`}
            stroke={n.stroke}
            opacity="0.92"
          />
        ))}
      </g>

      {nodes.map((n) => (
        <g key={n.label}>
          <rect x={n.x - 48} y={n.y - 22} width="96" height="44" rx="12" fill={n.badge} stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" filter="url(#neon-lite)" />
          <text
            x={n.x}
            y={n.y + 6}
            textAnchor="middle"
            fill="rgba(255,255,255,0.94)"
            fontSize="11"
            fontWeight="800"
            fontFamily="ui-sans-serif,system-ui,sans-serif"
          >
            {n.label}
          </text>
        </g>
      ))}

      <g filter="url(#neon)">
        <rect x={hubX - 70} y={hubY - 70} width="140" height="140" rx="28" fill="#1e3a8a" stroke="rgba(147,197,253,0.6)" strokeWidth="2.2" />
        <rect x={hubX - 56} y={hubY - 56} width="112" height="112" rx="22" fill="rgba(255,255,255,0.05)" stroke="rgba(191,219,254,0.22)" strokeWidth="1.1" />
        <path
          d={`M ${hubX - 28} ${hubY + 12} Q ${hubX} ${hubY - 36} ${hubX + 28} ${hubY + 12} Q ${hubX} ${hubY + 28} ${hubX - 28} ${hubY + 12}`}
          fill="none"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <circle cx={hubX} cy={hubY} r="14" fill="rgba(255,255,255,0.94)" opacity="0.95" />
      </g>
      <text
        x={hubX}
        y={hubY + 96}
        textAnchor="middle"
        fill="rgba(186,230,253,0.78)"
        fontSize="11"
        fontWeight="800"
        fontFamily="ui-sans-serif,system-ui,sans-serif"
        letterSpacing="0.06em"
      >
        OpenAI · núcleo
      </text>
    </svg>
  );
}
