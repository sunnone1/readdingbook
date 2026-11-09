import React, { useEffect, useRef } from 'react';
import { FilmItem } from '../archive/films';

interface CaptionProps {
  film: FilmItem;
  direction: number; // 1 for next, -1 for prev
  onPrev: () => void;
  onNext: () => void;
  onTitleClick?: () => void;
}

export const Caption: React.FC<CaptionProps> = ({
  film,
  direction,
  onPrev,
  onNext,
  onTitleClick,
}) => {
  const titleMaskRef = useRef<HTMLDivElement>(null);
  const subMaskRef = useRef<HTMLDivElement>(null);
  const metaMaskRef = useRef<HTMLDivElement>(null);

  const prevFilmIdRef = useRef<string>(film.id);
  const isFirstMountRef = useRef<boolean>(true);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dir = direction === 0 ? 1 : Math.sign(direction);

    const swapLine = (
      maskEl: HTMLDivElement | null,
      content: string,
      classes: string,
      isButton: boolean = false
    ) => {
      if (!maskEl) return;

      if (isFirstMountRef.current || prefersReducedMotion) {
        maskEl.innerHTML = '';
        const el = document.createElement(isButton ? 'button' : 'div');
        el.className = classes;
        el.textContent = content;
        if (isButton && onTitleClick) {
          el.onclick = onTitleClick;
        }
        maskEl.appendChild(el);
        return;
      }

      const oldChildren = Array.from(maskEl.children) as HTMLElement[];

      const nextEl = document.createElement(isButton ? 'button' : 'div');
      nextEl.className = `${classes} block w-full text-center`;
      nextEl.textContent = content;
      if (isButton && onTitleClick) {
        nextEl.onclick = onTitleClick;
      }
      maskEl.appendChild(nextEl);

      // Animate old children out
      oldChildren.forEach((oldEl) => {
        oldEl.style.position = 'absolute';
        oldEl.style.top = '0';
        oldEl.style.left = '0';
        oldEl.style.width = '100%';
        oldEl.style.pointerEvents = 'none';

        const anim = oldEl.animate(
          [
            { transform: 'translateY(0%)' },
            { transform: `translateY(${-dir * 105}%)` },
          ],
          {
            duration: 650,
            easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
            fill: 'both',
          }
        );
        anim.onfinish = () => oldEl.remove();
      });

      // Animate new child in
      nextEl.animate(
        [
          { transform: `translateY(${dir * 105}%)` },
          { transform: 'translateY(0%)' },
        ],
        {
          duration: 650,
          easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
          fill: 'both',
        }
      );
    };

    if (prevFilmIdRef.current !== film.id || isFirstMountRef.current) {
      swapLine(
        titleMaskRef.current,
        film.titleVi || film.title,
        'font-sans font-semibold text-[27px] md:text-[clamp(28px,3.4vw,46px)] leading-tight tracking-[-0.015em] text-[var(--cobalt)] cursor-pointer hover:opacity-85 transition-opacity',
        true
      );

      swapLine(
        subMaskRef.current,
        `${film.title.toUpperCase()} — BẢN LƯU TRỮ GỐC`,
        'font-sans font-semibold text-[9.5px] tracking-[0.24em] text-[var(--cobalt)] uppercase'
      );

      swapLine(
        metaMaskRef.current,
        `${film.year} — ${(film.genreVi || film.genre).toUpperCase()}`,
        'font-sans font-medium text-[10.5px] tracking-[0.08em] text-[var(--ink)]'
      );

      prevFilmIdRef.current = film.id;
      isFirstMountRef.current = false;
    }
  }, [film, direction, onTitleClick]);

  return (
    <div
      className="fixed left-0 right-0 z-20 flex flex-col items-center pointer-events-none select-none"
      style={{
        top: 'calc(var(--cy) + var(--H) / 2 + 4.2vh)',
      }}
    >
      <div className="relative flex flex-col items-center gap-[10px] w-full max-w-[min(80vw,640px)] px-4">
        {/* Title row with desktop navigation arrows */}
        <div className="relative w-full flex items-center justify-center">
          {/* Left Arrow (desktop) */}
          <button
            type="button"
            className="hidden md:flex absolute items-center justify-center w-[44px] h-[44px] text-[var(--cobalt)] bg-transparent border-0 cursor-pointer pointer-events-auto p-0 hover:opacity-75 transition-opacity focus:outline-none"
            style={{
              left: 'calc(50% - min(19vw, 250px) - 22px)',
            }}
            data-cursor="btn"
            onClick={onPrev}
            aria-label="Phim trước đó"
          >
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M6 1L1 6l5 5M1 6h23" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Title Mask */}
          <div
            ref={titleMaskRef}
            className="relative overflow-hidden w-full text-center pointer-events-auto min-h-[38px] md:min-h-[56px] flex items-center justify-center"
          />

          {/* Right Arrow (desktop) */}
          <button
            type="button"
            className="hidden md:flex absolute items-center justify-center w-[44px] h-[44px] text-[var(--cobalt)] bg-transparent border-0 cursor-pointer pointer-events-auto p-0 hover:opacity-75 transition-opacity focus:outline-none"
            style={{
              right: 'calc(50% - min(19vw, 250px) - 22px)',
            }}
            data-cursor="btn"
            onClick={onNext}
            aria-label="Phim tiếp theo"
          >
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M18 1l5 5-5 5M23 6H0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Subtitle Mask: ROMAJI / KANJI */}
        <div
          ref={subMaskRef}
          className="relative overflow-hidden w-full text-center min-h-[14px]"
        />

        {/* Short Rule: 18 × 1px, cobalt */}
        <div className="w-[18px] h-[1px] bg-[var(--cobalt)] my-[1px]" aria-hidden="true" />

        {/* Year & Genre Mask */}
        <div
          ref={metaMaskRef}
          className="relative overflow-hidden w-full text-center min-h-[16px]"
        />
      </div>

      {/* Mobile Arrows: drop to bottom: 118px at screen edges */}
      <div className="md:hidden fixed bottom-[118px] left-0 right-0 px-4 flex justify-between pointer-events-none z-30">
        <button
          type="button"
          className="flex items-center justify-center w-[44px] h-[44px] text-[var(--cobalt)] bg-[var(--paper)]/80 backdrop-blur-xs rounded-full border border-[var(--cobalt)]/30 cursor-pointer pointer-events-auto p-0 hover:opacity-75 transition-opacity focus:outline-none"
          onClick={onPrev}
          aria-label="Phim trước đó (di động)"
        >
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M6 1L1 6l5 5M1 6h23" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          type="button"
          className="flex items-center justify-center w-[44px] h-[44px] text-[var(--cobalt)] bg-[var(--paper)]/80 backdrop-blur-xs rounded-full border border-[var(--cobalt)]/30 cursor-pointer pointer-events-auto p-0 hover:opacity-75 transition-opacity focus:outline-none"
          onClick={onNext}
          aria-label="Phim tiếp theo (di động)"
        >
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M18 1l5 5-5 5M23 6H0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};
