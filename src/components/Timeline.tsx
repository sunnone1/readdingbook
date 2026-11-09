import React, { useRef } from 'react';
import { FILMS, FilmItem } from '../archive/films';

interface TimelineProps {
  currentYear: number;
  onYearClick: (filmIndex: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ currentYear, onYearClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const startYear = 1955;
  const endYear = 1990;
  const totalYears = endYear - startYear; // 35

  // Generate 36 ticks from 1955 to 1990
  const ticks = [];
  for (let y = startYear; y <= endYear; y++) {
    const isMajor = (y - startYear) % 5 === 0;
    const pct = ((y - startYear) / totalYears) * 100;
    ticks.push({ year: y, isMajor, pct });
  }

  // Handle click on the timeline
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const targetYear = startYear + pct * totalYears;

    // Find nearest film by year
    let closestIndex = 0;
    let minDiff = Infinity;
    FILMS.forEach((film: FilmItem, idx: number) => {
      const diff = Math.abs(film.year - targetYear);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    onYearClick(closestIndex);
  };

  const dotPct = Math.max(0, Math.min(100, ((currentYear - startYear) / totalYears) * 100));

  return (
    <div
      ref={containerRef}
      className="fixed z-20 left-4 md:left-9 right-4 md:right-9 bottom-[54px] md:bottom-[64px] h-[40px] cursor-pointer select-none"
      onClick={handleClick}
      data-cursor="btn"
      role="slider"
      aria-label="Thanh chọn phim theo dòng thời gian"
      aria-valuemin={startYear}
      aria-valuemax={endYear}
      aria-valuenow={Math.round(currentYear)}
    >
      {/* 1px Cobalt line at 12px with opacity 0.75 */}
      <div
        className="absolute top-[12px] left-0 right-0 h-[1px] bg-[var(--cobalt)] opacity-75"
        aria-hidden="true"
      />

      {/* Ticks */}
      {ticks.map((t) => (
        <div
          key={t.year}
          className="absolute top-[12px] -translate-x-1/2 w-[1px] bg-[var(--cobalt)] pointer-events-none"
          style={{
            left: `${t.pct}%`,
            height: t.isMajor ? '13px' : '7px',
            opacity: t.isMajor ? 0.75 : 0.4,
          }}
          aria-hidden="true"
        />
      ))}

      {/* Major Year Labels under the ticks */}
      {ticks
        .filter((t) => t.isMajor)
        .map((t, idx) => {
          // On mobile phones (<= 767px), hide every other year label (idx % 2 !== 0)
          const isMobileHidden = idx % 2 !== 0;
          return (
            <div
              key={`label-${t.year}`}
              className={`absolute top-[27px] font-sans font-medium text-[9.5px] text-[var(--cobalt)] pointer-events-none ${
                isMobileHidden ? 'hidden md:block' : 'block'
              }`}
              style={{
                left: `${t.pct}%`,
                transform:
                  t.year === startYear
                    ? 'none'
                    : t.year === endYear
                    ? 'translateX(-100%)'
                    : 'translateX(-50%)',
              }}
              aria-hidden="true"
            >
              {t.year}
            </div>
          );
        })}

      {/* 9px Gliding Cobalt Dot */}
      <div
        className="absolute top-[12.5px] w-[9px] h-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--cobalt)] pointer-events-none shadow-sm"
        style={{
          left: `${dotPct}%`,
        }}
        aria-hidden="true"
      />
    </div>
  );
};
