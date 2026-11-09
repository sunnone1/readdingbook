import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      className="fixed bottom-[24px] left-4 md:left-9 right-4 md:right-9 z-20 flex justify-between items-center text-[var(--cobalt)] pointer-events-auto select-none"
      role="contentinfo"
    >
      <div className="lbl text-[9px] md:text-[10.5px]">
        © LEON VASARI. BẢO LƯU MỌI QUYỀN.
      </div>

      <div className="flex items-center gap-3">
        <a
          href="#facebook"
          className="lbl text-[9px] md:text-[10.5px] hover:opacity-75 transition-opacity"
          data-cursor="btn"
          onClick={(e) => e.preventDefault()}
        >
          FB
        </a>
        <span className="text-[10px] opacity-40">/</span>
        <a
          href="#twitter"
          className="lbl text-[9px] md:text-[10.5px] hover:opacity-75 transition-opacity"
          data-cursor="btn"
          onClick={(e) => e.preventDefault()}
        >
          TW
        </a>
      </div>
    </footer>
  );
};
