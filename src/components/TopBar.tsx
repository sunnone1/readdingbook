import React, { useState } from 'react';

interface TopBarProps {
  onNavClick?: (item: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onNavClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between text-[var(--cobalt)] select-none px-4 md:px-9 h-[60px] md:h-[76px]"
        role="banner"
      >
        {/* Left: Brand info */}
        <div className="flex items-center gap-4">
          <a
            href="#archive"
            className="lbl text-[var(--cobalt)] hover:opacity-80 transition-opacity flex items-center"
            data-cursor="btn"
            onClick={(e) => {
              e.preventDefault();
              onNavClick?.('home');
            }}
          >
            LEON VASARI
          </a>
          <div className="w-[22px] md:w-[40px] h-[1px] bg-[var(--cobalt)]" aria-hidden="true" />
          <span className="lbl text-[var(--cobalt)]">KHO LƯU TRỮ PHIM</span>
        </div>

        {/* Right: Nav items and burger */}
        <div className="flex items-center">
          <nav className="hidden md:flex items-center gap-[34px] mr-[34px]" aria-label="Điều hướng chính">
            {[
              { id: 'films', label: 'PHIM' },
              { id: 'booklets', label: 'TẬP SÁCH' },
              { id: 'archivist ai', label: 'AI GIÁM TUYỂN' },
              { id: 'about', label: 'GIỚI THIỆU' },
              { id: 'journal', label: 'NHẬT KÝ' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className="lbl text-[var(--cobalt)] bg-transparent border-0 cursor-pointer p-0 hover:opacity-75 transition-opacity"
                data-cursor="btn"
                onClick={() => onNavClick?.(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Burger icon: two 1.5px lines, 26 × 12px */}
          <button
            type="button"
            className="w-[26px] h-[12px] flex flex-col justify-between items-stretch bg-transparent border-0 p-0 cursor-pointer group"
            data-cursor="btn"
            aria-label="Chuyển đổi menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span
              className={`w-full h-[1.5px] bg-[var(--cobalt)] transition-transform duration-300 ${
                mobileMenuOpen ? 'translate-y-[5.25px] rotate-45' : ''
              }`}
            />
            <span
              className={`w-full h-[1.5px] bg-[var(--cobalt)] transition-transform duration-300 ${
                mobileMenuOpen ? '-translate-y-[5.25px] -rotate-45' : ''
              }`}
            />
          </button>
        </div>
      </header>

      {/* Drawer menu for mobile when burger is open */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[60px] z-50 bg-[var(--paper)] md:hidden flex flex-col p-8 border-t border-[var(--rule)] animate-fadeIn">
          <nav className="flex flex-col gap-6" aria-label="Điều hướng di động">
            {[
              { id: 'films', label: 'PHIM' },
              { id: 'booklets', label: 'TẬP SÁCH' },
              { id: 'archivist ai', label: 'AI GIÁM TUYỂN' },
              { id: 'about', label: 'GIỚI THIỆU' },
              { id: 'journal', label: 'NHẬT KÝ' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className="lbl text-[var(--cobalt)] text-left text-base py-2 border-b border-[var(--cobalt)]/20"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavClick?.(item.id);
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto text-[var(--muted)] text-xs font-serif italic">
            Kho Lưu Trữ Điện Ảnh Leon Vasari (1922–2004)
          </div>
        </div>
      )}
    </>
  );
};
