export function Logo({ size = 38 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="NoxaPlus"
      className="logo-mark"
    >
      <defs>
        <linearGradient id="noxaplus-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1b2230" />
          <stop offset="1" stopColor="#0b0d12" />
        </linearGradient>
        <linearGradient id="noxaplus-accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd166" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#noxaplus-bg)" />
      <rect
        x="8"
        y="8"
        width="496"
        height="496"
        rx="104"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.08"
        strokeWidth="4"
      />
      <path d="M206 172 340 256 206 340Z" fill="url(#noxaplus-accent)" />
      <rect x="112" y="372" width="288" height="24" rx="12" fill="#eef1f7" fillOpacity="0.92" />
      <rect x="112" y="412" width="190" height="24" rx="12" fill="#5eead4" fillOpacity="0.85" />
    </svg>
  );
}
