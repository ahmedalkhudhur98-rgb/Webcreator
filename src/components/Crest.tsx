export default function Crest({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="crest-gold" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#E8D5A8" />
          <stop offset="50%" stopColor="#C9A961" />
          <stop offset="100%" stopColor="#9A7D3F" />
        </linearGradient>
      </defs>
      {/* Outer diamond frame */}
      <path
        d="M24 2 L46 24 L24 46 L2 24 Z"
        stroke="url(#crest-gold)"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M24 7 L41 24 L24 41 L7 24 Z"
        stroke="url(#crest-gold)"
        strokeWidth="0.75"
        fill="rgba(201,169,97,0.06)"
      />
      {/* EB monogram */}
      <text
        x="24"
        y="29.5"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="15"
        fontWeight="600"
        fill="url(#crest-gold)"
        letterSpacing="0.5"
      >
        EB
      </text>
    </svg>
  );
}
