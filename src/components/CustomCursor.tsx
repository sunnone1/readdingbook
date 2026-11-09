import React, { useEffect, useRef } from 'react';

export type CursorState = 'default' | 'open' | 'spine' | 'btn';

interface CustomCursorProps {
  state: CursorState;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ state }) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const targetRef = useRef({ x: -100, y: -100 });
  const visibleRef = useRef(false);

  useEffect(() => {
    // Only show on fine pointer
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    const handlePointerMove = (e: PointerEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      if (!visibleRef.current) {
        visibleRef.current = true;
        posRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseLeave = () => {
      visibleRef.current = false;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    let lastTime = performance.now();
    let animId = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (cursorRef.current && visibleRef.current) {
        // Follows with 1 - e^(-16 * dt)
        const factor = 1 - Math.exp(-16 * dt);
        posRef.current.x += (targetRef.current.x - posRef.current.x) * factor;
        posRef.current.y += (targetRef.current.y - posRef.current.y) * factor;

        cursorRef.current.style.transform = `translate3d(${posRef.current.x - 29}px, ${
          posRef.current.y - 29
        }px, 0)`;
        cursorRef.current.style.opacity = '1';
      } else if (cursorRef.current) {
        cursorRef.current.style.opacity = '0';
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className={`fixed top-0 left-0 w-[58px] h-[58px] pointer-events-none z-[100] transition-opacity duration-300 hidden md:flex items-center justify-center state-${state}`}
      aria-hidden="true"
      style={{ opacity: 0 }}
    >
      {/* Outer Ring */}
      <div
        className={`absolute inset-0 rounded-full border-[1.5px] transition-all ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          state === 'open'
            ? 'scale-[1.75] bg-[var(--cobalt)] border-[var(--cobalt)] shadow-md'
            : state === 'spine'
            ? 'scale-[0.72] border-[var(--ink)] bg-transparent'
            : state === 'btn'
            ? 'scale-[0.55] border-[var(--cobalt)] bg-transparent'
            : 'scale-100 border-[var(--ink)] bg-transparent'
        }`}
        style={{
          transitionDuration: '500ms',
        }}
      />

      {/* Center 6px Dot */}
      <div
        className={`w-[6px] h-[6px] rounded-full transition-all duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          state === 'open' || state === 'btn'
            ? 'opacity-0 scale-0'
            : state === 'spine'
            ? 'bg-[var(--ink)] scale-75'
            : 'bg-[var(--ink)] scale-100'
        }`}
      />

      {/* White MỞ Label */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center text-white transition-all duration-450 ease-[cubic-bezier(0.2,0.8,0.2,1)] pointer-events-none ${
          state === 'open' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
      >
        <span className="font-sans font-semibold text-[11px] tracking-[0.16em] leading-none">
          MỞ
        </span>
      </div>
    </div>
  );
};
