// src/components/DoctorSVG.tsx
type Props = {
  width?: number | string;
  height?: number | string;
  skin?: string;
  coat?: string;
  accent?: string;
};

export default function DoctorSVG({
  width = 240,
  height,
  skin = "#F4C7A1",
  coat = "#FFFFFF",
  accent = "#2DD4BF",
}: Props) {
  return (
    <svg
      role="img"
      aria-label="Doctor"
      viewBox="0 0 300 400"
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
      style={{
        overflow: "visible",
        display: "block",
        position: "absolute",
        right: "40px",
        bottom: "20px",
        filter: "drop-shadow(0 6px 14px rgba(0,0,0,.25))",
      }}
    >
      <title>Doctor</title>

      {/* Sombra */}
      <ellipse cx="150" cy="370" rx="90" ry="18" fill="#000" opacity="0.08" />

      <g vectorEffect="non-scaling-stroke">
        {/* Cabeza y orejas */}
        <circle cx="150" cy="90" r="38" fill={skin} />
        <circle cx="112" cy="90" r="8" fill={skin} />
        <circle cx="188" cy="90" r="8" fill={skin} />

        {/* Cabello */}
        <path
          d="M115 97c2-22 19-40 44-40 18 0 34 10 41 26 2 4 3 9 3 14-8-10-23-16-44-16-19 0-33 4-44 16z"
          fill="#2E2E38"
        />

        {/* Cejas y ojos */}
        <rect x="130" y="82" width="16" height="3" rx="1.5" fill="#2E2E38" />
        <rect x="154" y="82" width="16" height="3" rx="1.5" fill="#2E2E38" />
        <circle cx="138" cy="92" r="4" fill="#1C1C1C" />
        <circle cx="162" cy="92" r="4" fill="#1C1C1C" />

        {/* Nariz y boca */}
        <path d="M150 96c0 7-2 10-6 12" stroke="#E3A981" strokeWidth="2" fill="none" />
        <path
          d="M138 112c6 6 18 6 24 0"
          stroke="#C96A6A"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Cuello */}
        <rect x="140" y="124" width="20" height="16" rx="4" fill={skin} />

        {/* Torso / bata */}
        <rect x="95" y="140" width="110" height="150" rx="14" fill={coat} />
        <rect x="110" y="150" width="80" height="70" rx="8" fill={accent} opacity="0.9" />

        {/* Solapas */}
        <path d="M95 160l40 40 10-14-26-46z" fill="#EDEDED" />
        <path d="M205 160l-40 40-10-14 26-46z" fill="#EDEDED" />

        {/* Bolsillos */}
        <rect x="112" y="200" width="26" height="24" rx="4" fill="#F5F5F5" stroke="#D9D9D9" />
        <rect x="162" y="200" width="26" height="24" rx="4" fill="#F5F5F5" stroke="#D9D9D9" />

        {/* Pluma */}
        <rect x="170" y="204" width="4" height="14" rx="1" fill="#5B8DEF" />
        <rect x="176" y="204" width="3" height="10" rx="1" fill="#5B8DEF" opacity="0.8" />

        {/* Brazos y manos */}
        <rect x="78" y="170" width="34" height="80" rx="14" fill={coat} />
        <rect x="188" y="170" width="34" height="80" rx="14" fill={coat} />
        <circle cx="88" cy="248" r="12" fill={skin} />
        <circle cx="212" cy="248" r="12" fill={skin} />

        {/* Estetoscopio */}
        <circle cx="116" cy="128" r="6" fill="#2E2E38" />
        <circle cx="184" cy="128" r="6" fill="#2E2E38" />
        <path
          d="M116 128c0 26 10 36 34 36s34-10 34-36"
          stroke="#2E2E38"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="150" cy="232" r="12" fill="#2E2E38" />
        <circle cx="150" cy="232" r="6" fill="#BFC6CD" />

        {/* Cintura y pantalón */}
        <rect x="120" y="288" width="60" height="10" rx="5" fill="#CFCFCF" />
        <rect x="115" y="298" width="34" height="64" rx="8" fill="#2F3B56" />
        <rect x="151" y="298" width="34" height="64" rx="8" fill="#2F3B56" />

        {/* Zapatos */}
        <rect x="108" y="356" width="44" height="16" rx="8" fill="#1F2535" />
        <rect x="148" y="356" width="44" height="16" rx="8" fill="#1F2535" />
      </g>
    </svg>
  );
}
