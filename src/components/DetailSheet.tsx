import React, { useEffect, useRef, useState } from 'react';
import { FilmItem, getCropBackgroundStyle } from '../archive/films';

interface DetailSheetProps {
  film: FilmItem | null;
  isOpen: boolean;
  coverRect: DOMRect | null;
  onClose: () => void;
  onReadBooklet?: (film: FilmItem) => void;
}

export const DetailSheet: React.FC<DetailSheetProps> = ({
  film,
  isOpen,
  coverRect,
  onClose,
  onReadBooklet,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const textLineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeAnimations, setActiveAnimations] = useState<Animation[]>([]);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!sheetRef.current || !film) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sheetEl = sheetRef.current;

    if (isOpen) {
      sheetEl.style.display = 'block';

      // Initial cover rect bounds
      const vpW = window.innerWidth;
      const vpH = window.innerHeight;
      const top = coverRect ? Math.max(0, coverRect.top) : vpH * 0.2;
      const left = coverRect ? Math.max(0, coverRect.left) : vpW * 0.4;
      const right = coverRect ? Math.max(0, vpW - coverRect.right) : vpW * 0.4;
      const bottom = coverRect ? Math.max(0, vpH - coverRect.bottom) : vpH * 0.2;

      const animList: Animation[] = [];

      if (prefersReducedMotion) {
        sheetEl.style.clipPath = 'inset(0px round 0px)';
        textLineRefs.current.forEach((t) => {
          if (t) t.style.transform = 'translateY(0%)';
        });
        return;
      }

      // 1. Clip path expansion over 1050ms
      const initialClip = `inset(${top}px ${right}px ${bottom}px ${left}px round 3px)`;
      const finalClip = 'inset(0px 0px 0px 0px round 0px)';

      const sheetAnim = sheetEl.animate(
        [
          { clipPath: initialClip },
          { clipPath: finalClip },
        ],
        {
          duration: 1050,
          easing: 'cubic-bezier(0.76, 0, 0.18, 1)',
          fill: 'forwards',
        }
      );
      animList.push(sheetAnim);

      // 2. Text lines rise from translateY(110%) over 900ms, with delays 620 + i * 75 ms
      textLineRefs.current.forEach((lineEl, idx) => {
        if (!lineEl) return;
        const lineAnim = lineEl.animate(
          [
            { transform: 'translateY(110%)' },
            { transform: 'translateY(0%)' },
          ],
          {
            duration: 900,
            delay: 620 + idx * 75,
            easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
            fill: 'both',
          }
        );
        animList.push(lineAnim);
      });

      setActiveAnimations(animList);
    } else if (rendered) {
      // Closing animation: reverse clip-path back to current cover rect over 850ms
      const vpW = window.innerWidth;
      const vpH = window.innerHeight;
      const top = coverRect ? Math.max(0, coverRect.top) : vpH * 0.2;
      const left = coverRect ? Math.max(0, coverRect.left) : vpW * 0.4;
      const right = coverRect ? Math.max(0, vpW - coverRect.right) : vpW * 0.4;
      const bottom = coverRect ? Math.max(0, vpH - coverRect.bottom) : vpH * 0.2;

      const targetClip = `inset(${top}px ${right}px ${bottom}px ${left}px round 3px)`;

      // Cancel previous animations
      activeAnimations.forEach((a) => a.cancel());

      if (prefersReducedMotion) {
        sheetEl.style.display = 'none';
        setRendered(false);
        return;
      }

      const closeAnim = sheetEl.animate(
        [
          { clipPath: 'inset(0px 0px 0px 0px round 0px)' },
          { clipPath: targetClip },
        ],
        {
          duration: 850,
          easing: 'cubic-bezier(0.76, 0, 0.18, 1)',
          fill: 'forwards',
        }
      );

      closeAnim.onfinish = () => {
        sheetEl.style.display = 'none';
        setRendered(false);
        setActiveAnimations([]);
      };
    }
  }, [isOpen, coverRect, film, rendered]);

  if (!film && !rendered) return null;

  return (
    <div
      ref={sheetRef}
      className="fixed inset-0 z-60 bg-[var(--sheet)] text-[var(--ink)] overflow-y-auto select-none"
      style={{
        display: rendered ? 'block' : 'none',
      }}
      role="dialog"
      aria-modal="true"
      aria-label={film ? (film.titleVi || film.title) : 'Chi tiết phim'}
    >
      {/* Top Header: Close Button and Brand */}
      <div className="fixed top-0 left-0 right-0 z-70 flex justify-between items-center px-4 md:px-9 h-[60px] md:h-[76px] pointer-events-none">
        {/* Close Button: boxed .lbl "ĐÓNG" */}
        <button
          type="button"
          onClick={onClose}
          className="box-tag lbl text-[var(--ink)] bg-[var(--sheet)] pointer-events-auto hover:bg-[var(--paper)] transition-colors focus:outline-none cursor-pointer"
          data-cursor="btn"
          aria-label="Đóng chế độ xem chi tiết"
        >
          ĐÓNG
        </button>

        {/* Brand: cobalt copy of brand */}
        <div className="lbl text-[var(--cobalt)] hidden sm:flex items-center gap-2">
          <span>LEON VASARI</span>
          <span className="w-8 h-[1px] bg-[var(--cobalt)]" aria-hidden="true" />
          <span>KHO LƯU TRỮ PHIM</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-full w-full flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-[4vw] pt-[84px] md:pt-[110px] pb-14 px-5 md:px-[6vw] items-center justify-center">
        {/* Left Column (Desktop) / Second on Phone */}
        <div className="flex flex-col justify-center max-w-[520px] w-full gap-[18px] order-2 md:order-1">
          {/* 1. Subtitle */}
          <div className="overflow-hidden">
            <div
              ref={(el) => { textLineRefs.current[0] = el; }}
              className="lbl text-[var(--cobalt)]"
            >
              {film?.title.toUpperCase()} — {film?.year}
            </div>
          </div>

          {/* 2. Big Title */}
          <div className="overflow-hidden">
            <h1
              ref={(el) => { textLineRefs.current[1] = el; }}
              className="font-sans font-semibold text-[38px] md:text-[clamp(44px,5.2vw,80px)] leading-[1.05] tracking-[-0.03em] text-[var(--cobalt)] m-0"
            >
              {film?.titleVi || film?.title}
            </h1>
          </div>

          {/* 3. Muted meta line: YEAR / GENRE / N min */}
          <div className="overflow-hidden">
            <div
              ref={(el) => { textLineRefs.current[2] = el; }}
              className="font-sans font-medium text-xs md:text-[13px] tracking-widest text-[var(--muted)] uppercase"
            >
              {film?.year} / {(film?.genreVi || film?.genre || '').toUpperCase()} / {film?.min} PHÚT
            </div>
          </div>

          {/* 4. Synopsis in Newsreader 17px/1.5 */}
          <div className="overflow-hidden">
            <p
              ref={(el) => { textLineRefs.current[3] = el; }}
              className="font-serif text-[17px] leading-[1.5] max-w-[42ch] text-[var(--ink)] m-0"
            >
              {film?.synopsis}
            </p>
          </div>

          {/* 5. Italic muted credit */}
          <div className="overflow-hidden">
            <div
              ref={(el) => { textLineRefs.current[4] = el; }}
              className="font-serif italic text-sm text-[var(--muted)]"
            >
              Kịch bản & đạo diễn bởi Leon Vasari.
            </div>
          </div>

          {/* 6. Action buttons: Watch film & Read companion booklet */}
          <div className="overflow-hidden pt-2">
            <div ref={(el) => { textLineRefs.current[5] = el; }} className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="h-[44px] px-6 inline-flex items-center justify-center border border-[var(--cobalt)] bg-[var(--cobalt)] text-white font-sans font-semibold text-[11px] tracking-[0.15em] uppercase hover:bg-transparent hover:text-[var(--cobalt)] transition-colors cursor-pointer focus:outline-none"
                data-cursor="btn"
                onClick={() => alert(`Đang phát "${film?.titleVi || film?.title}" (Bản lưu trữ reel #VAS-${film?.year})`)}
              >
                XEM PHIM
              </button>

              <button
                type="button"
                className="h-[44px] px-6 inline-flex items-center justify-center border border-[var(--cobalt)] text-[var(--cobalt)] bg-transparent font-sans font-semibold text-[11px] tracking-[0.15em] uppercase hover:bg-[var(--cobalt)] hover:text-white transition-colors cursor-pointer focus:outline-none"
                data-cursor="btn"
                onClick={() => {
                  if (film && onReadBooklet) {
                    onReadBooklet(film);
                  }
                }}
              >
                ĐỌC TẬP SÁCH PHỤ BẢN
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Top on Mobile, Right on Desktop): Poster Artwork */}
        <div className="flex items-center justify-center w-full order-1 md:order-2">
          {film && (
            <div
              className="relative w-[min(70vw,290px)] sm:w-[310px] md:w-[clamp(280px,26vw,440px)] aspect-[474/900] max-h-[46svh] md:max-h-[78vh] rounded-[3px] shadow-2xl border border-[var(--rule)]/25 overflow-hidden bg-[#ECE8E0] transition-transform duration-500 ease-out hover:scale-[1.02]"
              style={{
                ...getCropBackgroundStyle(film.cover),
              }}
              role="img"
              aria-label={`Bìa tác phẩm ${film.titleVi || film.title}`}
            >
              {/* Authentic subtle paper grain and edge shadow overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10 pointer-events-none" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
