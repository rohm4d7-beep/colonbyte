export default function DevsAuraLogo({ height = 48 }: { height?: number }) {
  const w = height * 2.2;
  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 110 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Devs Aura Agency"
    >
      <defs>
        <linearGradient id="da-silver" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c0c0c0" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#a0a0a0" />
        </linearGradient>
        <linearGradient id="da-silver2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b0b0b0" />
          <stop offset="50%" stopColor="#f0f0f0" />
          <stop offset="100%" stopColor="#909090" />
        </linearGradient>
      </defs>

      {/* D letter */}
      <path
        d="M6 6 L6 42 L22 42 C34 42 42 34 42 24 C42 14 34 6 22 6 Z
           M14 13 L21 13 C29 13 34 18 34 24 C34 30 29 35 21 35 L14 35 Z"
        fill="url(#da-silver)"
      />

      {/* A letter — overlaps D slightly */}
      <path
        d="M52 42 L64 6 L76 6 L88 42 L80 42 L77 34 L51 34 L48 42 Z
           M54 27 L64 9 L74 27 Z"
        fill="url(#da-silver2)"
      />

      {/* Connector accent line between D and A */}
      <rect x="38" y="22" width="18" height="3" rx="1.5" fill="url(#da-silver)" opacity="0.6" />

      {/* Tagline */}
      <text
        x="96"
        y="20"
        fontSize="6"
        fontFamily="'Inter', 'Helvetica Neue', sans-serif"
        fontWeight="600"
        letterSpacing="1.5"
        fill="url(#da-silver)"
        opacity="0.8"
      >
        DEVS
      </text>
      <text
        x="96"
        y="30"
        fontSize="6"
        fontFamily="'Inter', 'Helvetica Neue', sans-serif"
        fontWeight="600"
        letterSpacing="1.5"
        fill="url(#da-silver)"
        opacity="0.8"
      >
        AURA
      </text>
    </svg>
  );
}
