interface LogoProps {
  className?: string;
}

// Inline SVG (not <img>) so it inherits `currentColor` and recolors per context. The viewBox is
// cropped to the ink rather than the artboard, so the mark fills the box it is given.
export function Logo({ className }: LogoProps) {
  return (
    <svg
      className={className}
      viewBox="10 10 44 44"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinejoin="miter"
      strokeLinecap="square"
      aria-hidden="true"
    >
      <path d="M 16 48 L 16 16 L 28 16 L 28 48 M 16 32 L 28 32" />
      <path d="M 36 48 L 36 16 L 48 16 L 48 32 L 36 32" />
    </svg>
  );
}
