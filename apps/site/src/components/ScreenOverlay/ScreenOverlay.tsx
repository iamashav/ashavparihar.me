export function ScreenOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50" aria-hidden="true">
      <div className="scanlines absolute inset-0" />

      <svg className="absolute inset-0 h-full w-full opacity-[0.035] mix-blend-overlay">
        <filter id="screen-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#screen-grain)" />
      </svg>

      <div className="vignette absolute inset-0" />
    </div>
  );
}
