import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FILMS, FilmItem, getCropBackgroundStyle } from '../archive/films';
import {
  rel,
  F,
  scl,
  computeXS,
  lookupXsc,
  smoothstep,
  getInterpolatedYear,
} from '../archive/geometry';
import { CursorState } from './CustomCursor';

interface ShelfProps {
  isDetailOpen: boolean;
  isEbookOpen?: boolean;
  isChatbotOpen?: boolean;
  onActiveFilmChange: (filmIndex: number, direction: number) => void;
  onYearUpdate: (interpolatedYear: number) => void;
  onOpenDetail: (film: FilmItem, coverRect: DOMRect | null) => void;
  onCursorStateChange: (state: CursorState) => void;
  // External navigation imperative triggers
  stepTarget: number | null;
  onStepTargetHandled: () => void;
}

export const Shelf: React.FC<ShelfProps> = ({
  isDetailOpen,
  isEbookOpen = false,
  isChatbotOpen = false,
  onActiveFilmChange,
  onYearUpdate,
  onOpenDetail,
  onCursorStateChange,
  stepTarget,
  onStepTargetHandled,
}) => {
  const probeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const playRingRef = useRef<HTMLDivElement>(null);

  // Arrays of 36 tape DOM references
  const tapeElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const spineShadeElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const coverShadeElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const coverFaceElsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Dynamics state in refs for 60fps RAF loop
  const sRef = useRef(17); // start at s = 17 (5 + 12)
  const TRef = useRef(17);
  const prevActiveIndexRef = useRef(5);

  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const dragStartTRef = useRef(17);
  const hasMovedRef = useRef(false);

  const wheelTimeoutRef = useRef<number | null>(null);

  // Mouse coords & tilt
  const mousePosRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const tiltXRef = useRef(0);
  const tiltYRef = useRef(0);

  // Lift array for 36 tapes
  const liftsRef = useRef<Float64Array>(new Float64Array(36));
  const hoveredTapeRef = useRef<number | null>(null);

  // Measured dimension state
  const [metrics, setMetrics] = useState({
    H: 300,
    ws: 50,
    d: 158,
    gap: 10,
    U: 390,
    shelfCentreY: 300,
  });

  // Handle external step targets from arrows or timeline
  useEffect(() => {
    if (stepTarget !== null) {
      TRef.current = stepTarget;
      onStepTargetHandled();
    }
  }, [stepTarget, onStepTargetHandled]);

  const endDrag = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      TRef.current = Math.round(TRef.current);
    }
  }, []);

  // Global window pointer listeners so drag NEVER gets stuck when pointer leaves element
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      endDrag();
    };
    const handleGlobalPointerCancel = () => {
      endDrag();
    };
    const handleBlur = () => {
      endDrag();
    };

    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerCancel);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerCancel);
      window.removeEventListener('blur', handleBlur);
    };
  }, [endDrag]);

  // Measure H and viewport dimensions
  const updateMetrics = useCallback(() => {
    const isMobile = window.innerWidth <= 767;
    const computedFallbackH = isMobile
      ? Math.min(window.innerWidth * 0.68, window.innerHeight * 0.40)
      : Math.min(window.innerHeight * 0.47, window.innerWidth * 0.33);

    const probeH =
      probeRef.current && probeRef.current.offsetHeight > 50
        ? probeRef.current.offsetHeight
        : computedFallbackH;

    const H = Math.round(probeH);
    const ws = (H * 142) / 840;
    const d = (H * 474) / 900;
    const gap = H * 0.035;
    const U = isMobile ? H * 1.05 : H * 1.3;
    const shelfCentreY = window.innerHeight * (isMobile ? 0.43 : 0.41);

    setMetrics({ H, ws, d, gap, U, shelfCentreY });
  }, []);

  useEffect(() => {
    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, [updateMetrics]);

  // Main RAF Animation Loop
  useEffect(() => {
    let lastTime = performance.now();
    let animId = 0;
    const P = 1400;

    let XS = computeXS(metrics.U);

    const loop = (now: number) => {
      if (isEbookOpen || isChatbotOpen) {
        // Overlay is full-screen, pause 3D transform recalculations
        lastTime = now;
        animId = requestAnimationFrame(loop);
        return;
      }

      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      // Sanitize TRef and sRef against NaN or infinite values
      if (!Number.isFinite(TRef.current)) TRef.current = 17;
      if (!Number.isFinite(sRef.current)) sRef.current = 17;

      // Prevent runaway targets when not actively dragging
      if (!isDraggingRef.current && Math.abs(TRef.current - sRef.current) > 6) {
        TRef.current = sRef.current + Math.sign(TRef.current - sRef.current) * 6;
      }

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const { H, ws, d, gap, U, shelfCentreY } = metrics;
      const W = window.innerWidth;
      const cy = shelfCentreY;

      // Update XS table if U changed
      if (XS.length === 0 || Math.abs(XS.length - (Math.ceil((3 * U) / 2) + 1)) > 2) {
        XS = computeXS(U);
      }

      // 1. Spring physics for s -> T
      if (prefersReducedMotion) {
        sRef.current = TRef.current;
      } else {
        const kSpring = isDraggingRef.current ? 18 : 5.2;
        sRef.current += (TRef.current - sRef.current) * (1 - Math.exp(-kSpring * dt));
      }

      // Shift loops if s passes bounds
      if (sRef.current > 29) {
        sRef.current -= 12;
        TRef.current -= 12;
        dragStartTRef.current -= 12;
      } else if (sRef.current < 5) {
        sRef.current += 12;
        TRef.current += 12;
        dragStartTRef.current += 12;
      }

      const s = sRef.current;
      const T = TRef.current;

      // Active film index
      const activeIdx = ((Math.round(s) % 12) + 12) % 12;
      if (activeIdx !== prevActiveIndexRef.current) {
        const dir = Math.sign(T - s) || 1;
        prevActiveIndexRef.current = activeIdx;
        onActiveFilmChange(activeIdx, dir);
      }

      // Timeline interpolated year
      const targetYear = getInterpolatedYear(s, FILMS);
      onYearUpdate(targetYear);

      // 2. Cover tilt calculation
      const mx = Math.max(0, Math.min(W, mousePosRef.current.x));
      const my = Math.max(0, Math.min(window.innerHeight, mousePosRef.current.y));
      const isOnCover =
        Math.abs(mx - W / 2) <= 0.55 * d &&
        Math.abs(my - cy) <= 0.55 * H &&
        Math.abs(T - s) < 0.3 &&
        !isDetailOpen &&
        !isEbookOpen &&
        !isChatbotOpen;

      let targetTiltY = 0;
      let targetTiltX = 0;

      if (isOnCover) {
        targetTiltY = ((mx - W / 2) / (0.55 * d)) * 8;
        targetTiltX = -((my - cy) / (H / 2)) * 5;
      } else {
        targetTiltY = ((mx - W / 2) / W) * 3;
        targetTiltX = 0;
      }

      if (prefersReducedMotion) {
        tiltXRef.current = targetTiltX;
        tiltYRef.current = targetTiltY;
      } else {
        const factor = 1 - Math.exp(-7 * dt);
        tiltXRef.current += (targetTiltX - tiltXRef.current) * factor;
        tiltYRef.current += (targetTiltY - tiltYRef.current) * factor;
      }

      const tiltX = tiltXRef.current;
      const tiltY = tiltYRef.current;

      // 3. Update cursor state
      if (isOnCover) {
        onCursorStateChange('open');
      } else if (hoveredTapeRef.current !== null) {
        const hoveredRel = rel(hoveredTapeRef.current, s);
        if (Math.abs(hoveredRel) > 0.5) {
          onCursorStateChange('spine');
        } else {
          onCursorStateChange('open');
        }
      } else {
        onCursorStateChange('default');
      }

      // 4. Update 36 tapes
      for (let v = 0; v < 36; v++) {
        const tapeEl = tapeElsRef.current[v];
        if (!tapeEl) continue;

        const r = rel(v, s);
        const u = F(r, ws, d, gap);

        // Hide far tapes
        if (Math.abs(u) > U * 1.95) {
          tapeEl.style.display = 'none';
          continue;
        }
        tapeEl.style.display = 'block';

        const o = smoothstep(Math.max(0, 1 - Math.abs(r)));
        const sc = scl(u, U);
        const k = Math.min(4, 1 / Math.max(0.2, sc));

        // Eased lift
        const isHovered = hoveredTapeRef.current === v && Math.abs(r) > 0.5;
        const targetLift = isHovered ? 1 : 0;
        if (prefersReducedMotion) {
          liftsRef.current[v] = targetLift;
        } else {
          liftsRef.current[v] += (targetLift - liftsRef.current[v]) * (1 - Math.exp(-12 * dt));
        }
        const lift = liftsRef.current[v];

        const z = P * (1 - k) + o * H * 0.1;
        const x = lookupXsc(u, XS) * k;
        const y = (H * 0.5 * (1 - sc) * 0.42 + o * H * 0.012 - lift * H * 0.05) * k;

        const rotateY =
          Math.sign(u) * Math.min(1, Math.abs(u) / U) * 26 * (1 - o) - 90 * o + tiltY * o;
        const rotateX = tiltX * o;

        tapeEl.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        tapeEl.style.zIndex = String(Math.round(3000 + z));

        // Shading
        const spineShadeEl = spineShadeElsRef.current[v];
        if (spineShadeEl) {
          const spineShade = Math.min(0.6, o * 0.55 + (1 - sc) * 0.32);
          spineShadeEl.style.opacity = String(spineShade);
        }

        const coverShadeEl = coverShadeElsRef.current[v];
        if (coverShadeEl) {
          const coverShade = (1 - o) * 0.82;
          coverShadeEl.style.opacity = String(coverShade);
        }
      }

      // 5. Update Play Ring
      if (playRingRef.current) {
        const ringScale = isDetailOpen
          ? 0
          : smoothstep(Math.max(0, 1 - Math.abs(TRef.current - sRef.current) * 3));
        const ringLeft = W / 2 - d / 2 - 6;
        const ringTop = cy + 0.36 * H;

        playRingRef.current.style.transform = `translate3d(${ringLeft}px, ${ringTop}px, 0) scale(${ringScale})`;
        playRingRef.current.style.opacity = ringScale > 0.01 ? '1' : '0';
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [metrics, isDetailOpen, isEbookOpen, isChatbotOpen, onActiveFilmChange, onYearUpdate, onCursorStateChange]);

  // Pointer move tracking with sanity checks
  const handlePointerMove = (e: React.PointerEvent) => {
    mousePosRef.current = { x: e.clientX, y: e.clientY };

    // If no mouse button is pressed while dragging, cancel drag immediately
    if (e.buttons === 0 && isDraggingRef.current) {
      endDrag();
      return;
    }

    if (!isDraggingRef.current) return;

    const dx = e.clientX - dragStartPosRef.current.x;
    if (Math.abs(dx) > 5) {
      hasMovedRef.current = true;
    }

    const { ws, gap } = metrics;
    TRef.current = dragStartTRef.current - dx / (ws + gap);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isDetailOpen || isEbookOpen || isChatbotOpen) return;
    // Only drag on main mouse button or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if not supported in test environments
    }

    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    dragStartTRef.current = TRef.current;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }
    endDrag();
  };

  // Wheel interaction with clamped delta and anti-runaway damping
  const handleWheel = (e: React.WheelEvent) => {
    if (isDetailOpen || isEbookOpen || isChatbotOpen) return;
    const { ws, gap } = metrics;

    const deltaX = e.deltaX;
    const deltaY = e.deltaY;
    const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;

    // Ignore tiny accidental trackpad vibrations
    if (Math.abs(delta) < 8) return;

    // Heavily damp wheel delta to max 0.8 step per event
    const stepDelta = Math.max(-0.8, Math.min(0.8, (delta / (ws + gap)) * 0.12));
    TRef.current += stepDelta;

    if (wheelTimeoutRef.current) {
      window.clearTimeout(wheelTimeoutRef.current);
    }
    wheelTimeoutRef.current = window.setTimeout(() => {
      TRef.current = Math.round(TRef.current);
    }, 180);
  };

  // Click tape interaction
  const handleTapeClick = (v: number) => {
    if (hasMovedRef.current || isDetailOpen) return;

    const r = rel(v, sRef.current);
    if (Math.abs(r) < 0.5) {
      // Active tape clicked: open detail
      const film = FILMS[v % 12];
      const coverFaceEl = coverFaceElsRef.current[v];
      const rect = coverFaceEl ? coverFaceEl.getBoundingClientRect() : null;
      TRef.current = Math.round(TRef.current);
      onOpenDetail(film, rect);
    } else {
      // Non-active tape: glide to round(T + r)
      TRef.current = Math.round(TRef.current + r);
    }
  };

  // Click play ring
  const handlePlayRingClick = () => {
    if (isDetailOpen) return;
    const activeIdx = ((Math.round(sRef.current) % 12) + 12) % 12;
    const film = FILMS[activeIdx];
    // Find active tape virtual index closest to s
    let activeV = 17;
    let minRel = Infinity;
    for (let v = 0; v < 36; v++) {
      const r = Math.abs(rel(v, sRef.current));
      if (r < minRel) {
        minRel = r;
        activeV = v;
      }
    }
    const coverFaceEl = coverFaceElsRef.current[activeV];
    const rect = coverFaceEl ? coverFaceEl.getBoundingClientRect() : null;
    TRef.current = Math.round(TRef.current);
    onOpenDetail(film, rect);
  };

  const { H, ws, d } = metrics;

  return (
    <>
      {/* Probe element to measure var(--H) */}
      <div
        ref={probeRef}
        className="fixed pointer-events-none -left-[9999px] -top-[9999px] h-[var(--H)]"
        aria-hidden="true"
      />

      {/* Floor Shadow: centred at top:calc(--cy + H×.47), width min(96vw, H×3.6), height H×.26 */}
      <div
        className="fixed left-1/2 -translate-x-1/2 pointer-events-none z-5"
        style={{
          top: 'calc(var(--cy) + var(--H) * 0.47)',
          width: 'min(96vw, calc(var(--H) * 3.6))',
          height: 'calc(var(--H) * 0.26)',
          background:
            'radial-gradient(50% 50% at 50% 40%, rgba(40,32,20,.30), rgba(40,32,20,.10) 55%, transparent 72%)',
        }}
        aria-hidden="true"
      />

      {/* Shelf section: perspective:1400px, spans full width, z 10 */}
      <div
        ref={containerRef}
        className="fixed left-0 right-0 z-10 shelf-viewport touch-none select-none"
        style={{
          top: 'calc(var(--cy) - var(--H) / 2 - 50px)',
          height: 'calc(var(--H) + 100px)',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onLostPointerCapture={endDrag}
        onWheel={handleWheel}
      >
        {/* Stage at center */}
        <div
          ref={stageRef}
          className="absolute left-1/2 top-1/2 w-0 h-0 preserve-3d"
        >
          {/* Render 36 tapes (3 sets of 12) */}
          {Array.from({ length: 36 }).map((_, v) => {
            const film = FILMS[v % 12];
            const spineStyle = getCropBackgroundStyle(film.spine);
            const coverStyle = getCropBackgroundStyle(film.cover);

            return (
              <div
                key={v}
                ref={(el) => { tapeElsRef.current[v] = el; }}
                className="absolute left-0 top-0 w-0 h-0 preserve-3d cursor-pointer"
                onClick={() => handleTapeClick(v)}
                onPointerEnter={() => { hoveredTapeRef.current = v; }}
                onPointerLeave={() => {
                  if (hoveredTapeRef.current === v) hoveredTapeRef.current = null;
                }}
                data-tape-index={v}
                data-film-title={film.title}
              >
                {/* Spine Face (.sp): width ws, translateZ(d/2) */}
                <div
                  className="absolute backface-hidden rounded-[2px] overflow-hidden"
                  style={{
                    width: `${ws}px`,
                    height: `${H}px`,
                    top: `${-H / 2}px`,
                    left: `${-ws / 2}px`,
                    transform: `translateZ(${d / 2}px)`,
                    ...spineStyle,
                  }}
                >
                  {/* Spine shading overlay */}
                  <div
                    ref={(el) => { spineShadeElsRef.current[v] = el; }}
                    className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-150"
                    style={{ opacity: 0 }}
                  />
                </div>

                {/* Cover Face (.cv): width d, rotateY(90deg) translateZ(ws/2) */}
                <div
                  ref={(el) => { coverFaceElsRef.current[v] = el; }}
                  className="absolute backface-hidden rounded-[2px] overflow-hidden"
                  style={{
                    width: `${d}px`,
                    height: `${H}px`,
                    top: `${-H / 2}px`,
                    left: `${-d / 2}px`,
                    transform: `rotateY(90deg) translateZ(${ws / 2}px)`,
                    boxShadow: '0 34px 60px -30px rgba(20,16,10,.6)',
                    ...coverStyle,
                  }}
                >
                  {/* Cover shading overlay */}
                  <div
                    ref={(el) => { coverShadeElsRef.current[v] = el; }}
                    className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-150"
                    style={{ opacity: 0 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Play Ring: fixed 42px circle with 1px cobalt border, rgba(236,232,224,.8) fill, 12px cobalt triangle */}
      <div
        ref={playRingRef}
        className="fixed top-0 left-0 w-[42px] h-[42px] rounded-full border border-[var(--cobalt)] bg-[#ECE8E0]/80 backdrop-blur-xs z-25 flex items-center justify-center cursor-pointer pointer-events-auto transition-opacity duration-300 shadow-md"
        data-cursor="btn"
        onClick={handlePlayRingClick}
        aria-label="Mở phim đang chọn"
        style={{
          transformOrigin: 'center center',
          opacity: 0,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="var(--cobalt)">
          <polygon points="2,1 11,6 2,11" />
        </svg>
      </div>
    </>
  );
};
