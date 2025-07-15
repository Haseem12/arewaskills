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
      <style>
        {`
          .knot-path {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
            animation: draw-in 2s ease-out forwards;
          }
          .knot-circle {
             opacity: 0;
             animation: fade-in 1s ease-out 1s forwards;
          }
          .center-dot {
            animation: pulse 3s infinite ease-in-out;
          }
          @keyframes draw-in {
            to {
              stroke-dashoffset: 0;
            }
          }
          @keyframes fade-in {
            to {
              opacity: 1;
            }
          }
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.5);
              opacity: 0.7;
            }
          }
        `}
      </style>
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
        <path className="knot-path" style={{ animationDelay: '0s' }} d="M50 20 V 35" />
        <path className="knot-path" style={{ animationDelay: '0.1s' }} d="M50 80 V 65" />
        <path className="knot-path" style={{ animationDelay: '0.2s' }} d="M20 50 H 35" />
        <path className="knot-path" style={{ animationDelay: '0.3s' }} d="M80 50 H 65" />
        <circle className="knot-circle" cx="50" cy="50" r="15" />
        <path className="knot-path" style={{ animationDelay: '0.4s' }} d="M35 35 A 21.21 21.21 0 0 1 65 65" />
        <path className="knot-path" style={{ animationDelay: '0.4s' }} d="M65 35 A 21.21 21.21 0 0 1 35 65" />
      </g>
      
      {/* Inner tech dots */}
      <circle className="center-dot" cx="50" cy="50" r="3" fill="hsl(var(--primary))" style={{transformOrigin: '50% 50%'}} />
    </svg>
  );
}
