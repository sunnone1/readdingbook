import React from 'react';

export const HalftoneBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none select-none z-1 overflow-hidden" aria-hidden="true">
      {/* Left: 映画 at left 2.4vw, top 13vh */}
      <div
        className="absolute font-jp-big halftone-kanji left-[2.4vw] top-[13vh]"
      >
        映画
      </div>

      {/* Right: の記憶 at right 2.4vw, top 9vh */}
      <div
        className="absolute font-jp-big halftone-kanji right-[2.4vw] top-[9vh]"
      >
        の記憶
      </div>
    </div>
  );
};
