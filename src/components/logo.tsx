import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="100"
      height="100"
      aria-label="Arewa Tech Connect Logo"
      {...props}
    >
      <defs>
        <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))' }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))' }} />
        </linearGradient>
      </defs>
      {/* Outer circle */}
      <circle cx="50" cy="50" r="48" fill="hsl(var(--card))" stroke="url(#tealGradient)" strokeWidth="1.5" />

      {/* Arewa knot inspired design (silk lines) */}
      <g stroke="url(#tealGradient)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M50 20 V 35" />
        <path d="M50 80 V 65" />
        <path d="M20 50 H 35" />
        <path d="M80 50 H 65" />
        <circle cx="50" cy="50" r="15" />
        <path d="M35 35 A 21.21 21.21 0 0 1 65 65" />
        <path d="M65 35 A 21.21 21.21 0 0 1 35 65" />
      </g>
      
      {/* Inner tech dots */}
      <circle cx="50" cy="50" r="3" fill="hsl(var(--primary))" />
    </svg>
  );
}
