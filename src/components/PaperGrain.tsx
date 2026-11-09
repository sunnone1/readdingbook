import React from 'react';

export const PaperGrain: React.FC = () => {
  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none z-40 opacity-60 mix-blend-multiply"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <filter id="paper-grain-filter" x="0" y="0" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.85"
          numOctaves="3"
          stitchTiles="stitch"
          result="noise"
        />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.45   0 0 0 0 0.42   0 0 0 0 0.38   0 0 0 0.22 0"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#paper-grain-filter)" />
    </svg>
  );
};
