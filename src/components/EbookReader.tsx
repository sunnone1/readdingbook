import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FilmItem, FILMS } from '../archive/films';
import { getEbookForFilm, FilmEbook } from '../ebook/ebookData';
import {
  FlattenedPage,
  flattenEbookPages,
  calculateProgress,
  getSpreadPageIndices,
  getNextPageIndex,
  getPrevPageIndex,
} from '../ebook/readerLogic';

interface EbookReaderProps {
  initialFilm: FilmItem;
  isOpen: boolean;
  onClose: () => void;
}

interface FlipState {
  direction: 'next' | 'prev';
  fromLeftIndex: number;
  fromRightIndex: number | null;
  toLeftIndex: number;
  toRightIndex: number | null;
}

// Gentle archival paper flip sound synthesis via Web Audio API
function playPaperSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const duration = 0.22;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Soft filtered noise with exponential decay
      const decay = Math.exp(-i / (bufferSize * 0.45));
      data[i] = (Math.random() * 2 - 1) * decay * 0.35;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + duration);
    filter.Q.value = 1.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + duration);
  } catch {
    // Non-blocking fallback if audio context is blocked
  }
}

// Individual Page Content Renderer
interface PageViewProps {
  page: FlattenedPage | undefined;
  isRightPage?: boolean;
  filmTitle: string;
  year: number;
  fontSizes: string;
  fontSizeLevel: number;
}

const PageView: React.FC<PageViewProps> = ({
  page,
  isRightPage = false,
  filmTitle,
  year,
  fontSizes,
}) => {
  if (!page) {
    // Colophon / Seal page when past the last page
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center text-center p-8 text-[var(--muted)] bg-[#FAF8F5]">
        <div className="w-16 h-16 rounded-full border border-[var(--cobalt)]/30 flex items-center justify-center mb-4 text-[var(--cobalt)] shadow-xs">
          <span className="font-serif italic font-bold text-xl">LV</span>
        </div>
        <div className="lbl text-[var(--cobalt)] text-[10px] tracking-widest mb-2">
          KẾT THÚC PHỤ BẢN LƯU TRỮ
        </div>
        <div className="font-serif italic text-base text-[var(--ink)]">
          {filmTitle} ({year})
        </div>
        <div className="text-xs mt-4 max-w-xs text-[var(--muted)] leading-relaxed">
          Bản chuyển đổi phim âm bản 35mm được bảo quản trong kho lưu trữ The Cineteca Vasari.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col p-6 md:p-12 overflow-y-auto bg-[#FAF8F5] select-text">
      {/* Running Head */}
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-[var(--rule)]/15 shrink-0 select-none">
        <span className="lbl text-[9px] text-[var(--cobalt)] tracking-widest truncate max-w-[280px]">
          {page.header || page.chapterTitle}
        </span>
        <span className="lbl text-[9px] text-[var(--muted)]">
          {isRightPage ? 'BẢN SAO GIÁM TUYỂN NGUYÊN BẢN' : 'HỒ SƠ LƯU TRỮ VASARI'}
        </span>
      </div>

      {/* Chapter Title Badge if chapter start */}
      {page.chapterSubtitle && (
        <div className="mb-6 select-none">
          <span className="lbl text-[9.5px] text-[var(--muted)] block mb-1">
            {page.chapterSubtitle}
          </span>
          <h2 className="font-sans font-semibold text-xl md:text-2xl text-[var(--cobalt)] tracking-tight">
            {page.chapterTitle}
          </h2>
        </div>
      )}

      {/* Page Content Body */}
      <div className={`flex-1 space-y-4 text-[var(--ink)] ${fontSizes}`}>
        {page.content.map((p: string, idx: number) => {
          const isSlug = p.startsWith('SCENE') || p.startsWith('ACT');
          const isCharacter =
            p === p.toUpperCase() &&
            p.length < 30 &&
            !p.includes('.') &&
            !p.startsWith('"') &&
            !isSlug;
          const isParenthetical = p.startsWith('(') && p.endsWith(')');

          if (isSlug) {
            return (
              <div
                key={idx}
                className="font-sans font-semibold text-xs tracking-wider text-[var(--cobalt)] pt-2 border-t border-[var(--rule)]/10"
              >
                {p}
              </div>
            );
          }

          if (isCharacter) {
            return (
              <div
                key={idx}
                className="font-sans font-semibold text-center text-xs tracking-widest text-[var(--ink)] pt-2"
              >
                {p}
              </div>
            );
          }

          if (isParenthetical) {
            return (
              <div key={idx} className="italic text-center text-xs opacity-75">
                {p}
              </div>
            );
          }

          return (
            <p
              key={idx}
              className={
                idx === 0 && page.type === 'prose'
                  ? 'first-letter:float-left first-letter:text-4xl first-letter:pr-2 first-letter:font-sans first-letter:font-bold first-letter:text-[var(--cobalt)]'
                  : ''
              }
            >
              {p}
            </p>
          );
        })}
      </div>

      {/* Folio page number bottom */}
      <div className="pt-4 mt-auto border-t border-[var(--rule)]/10 flex justify-between items-center text-[10px] text-[var(--muted)] shrink-0 font-sans select-none">
        {isRightPage ? (
          <>
            <span className="italic font-serif">Đạo diễn: Leon Vasari</span>
            <span>Trang {page.pageNumber}</span>
          </>
        ) : (
          <>
            <span>Trang {page.pageNumber}</span>
            <span className="italic font-serif">{filmTitle}</span>
          </>
        )}
      </div>
    </div>
  );
};

export const EbookReader: React.FC<EbookReaderProps> = ({
  initialFilm,
  isOpen,
  onClose,
}) => {
  const [currentFilm, setCurrentFilm] = useState<FilmItem>(initialFilm);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [isTwoPageMode, setIsTwoPageMode] = useState<boolean>(true);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(1);
  const [isTocOpen, setIsTocOpen] = useState<boolean>(false);

  // 3D Page flip state
  const [flipState, setFlipState] = useState<FlipState | null>(null);
  const flipTimerRef = useRef<number | null>(null);

  // Sync initial film when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentFilm(initialFilm);
      setPageIndex(0);
      setIsTocOpen(false);
      setFlipState(null);
    }
  }, [isOpen, initialFilm]);

  // Adapt two-page mode based on screen width
  useEffect(() => {
    const checkWidth = () => {
      if (window.innerWidth < 900) {
        setIsTwoPageMode(false);
      } else {
        setIsTwoPageMode(true);
      }
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const ebook: FilmEbook = useMemo(() => {
    return getEbookForFilm(
      currentFilm.id,
      currentFilm.title,
      currentFilm.romaji,
      currentFilm.kanji,
      currentFilm.year,
      currentFilm.genre,
      currentFilm.synopsis
    );
  }, [currentFilm]);

  const flattenedPages = useMemo(() => {
    return flattenEbookPages(ebook);
  }, [ebook]);

  const totalPages = flattenedPages.length;

  const { leftIndex, rightIndex } = useMemo(() => {
    return getSpreadPageIndices(pageIndex, isTwoPageMode, totalPages);
  }, [pageIndex, isTwoPageMode, totalPages]);

  const progress = calculateProgress(pageIndex, totalPages);

  // Handle page transitions with realistic 3D flipping animation
  const handleNextPage = useCallback(() => {
    if (flipState) return; // Prevent double trigger while page is flipping

    const target = getNextPageIndex(pageIndex, isTwoPageMode, totalPages);
    if (target === pageIndex) return; // Already on last page

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setPageIndex(target);
      return;
    }

    const { leftIndex: currLeft, rightIndex: currRight } = getSpreadPageIndices(
      pageIndex,
      isTwoPageMode,
      totalPages
    );
    const { leftIndex: destLeft, rightIndex: destRight } = getSpreadPageIndices(
      target,
      isTwoPageMode,
      totalPages
    );

    playPaperSound();
    setFlipState({
      direction: 'next',
      fromLeftIndex: currLeft,
      fromRightIndex: currRight,
      toLeftIndex: destLeft,
      toRightIndex: destRight,
    });
  }, [pageIndex, isTwoPageMode, totalPages, flipState]);

  const handlePrevPage = useCallback(() => {
    if (flipState) return;

    const target = getPrevPageIndex(pageIndex, isTwoPageMode);
    if (target === pageIndex) return; // Already on first page

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setPageIndex(target);
      return;
    }

    const { leftIndex: currLeft, rightIndex: currRight } = getSpreadPageIndices(
      pageIndex,
      isTwoPageMode,
      totalPages
    );
    const { leftIndex: destLeft, rightIndex: destRight } = getSpreadPageIndices(
      target,
      isTwoPageMode,
      totalPages
    );

    playPaperSound();
    setFlipState({
      direction: 'prev',
      fromLeftIndex: currLeft,
      fromRightIndex: currRight,
      toLeftIndex: destLeft,
      toRightIndex: destRight,
    });
  }, [pageIndex, isTwoPageMode, totalPages, flipState]);

  // Handle animation completion
  useEffect(() => {
    if (!flipState) return;

    const duration = 520;
    flipTimerRef.current = window.setTimeout(() => {
      setPageIndex(flipState.toLeftIndex);
      setFlipState(null);
    }, duration);

    return () => {
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
    };
  }, [flipState]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === 'Escape') {
        if (isTocOpen) {
          setIsTocOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNextPage, handlePrevPage, onClose, isTocOpen]);

  if (!isOpen) return null;

  const fontSizes = [
    'text-sm leading-relaxed',
    'text-base leading-[1.65]',
    'text-lg leading-[1.75]',
  ];

  const currentFilmTitle = currentFilm.titleVi || ebook.filmTitle;

  return (
    <div
      className="fixed inset-0 z-80 bg-[var(--sheet)] text-[var(--ink)] flex flex-col select-none overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`Tập sách phụ bản: ${ebook.filmTitle}`}
    >
      {/* 3D Page Flip Keyframe Animations Styles */}
      <style>{`
        @keyframes pageFlipNextTwoPage {
          0% {
            transform: perspective(2200px) rotateY(0deg);
            box-shadow: 0 4px 14px rgba(0,0,0,0.06);
          }
          45% {
            box-shadow: -22px 14px 40px rgba(25,18,10,0.28);
          }
          100% {
            transform: perspective(2200px) rotateY(-180deg);
            box-shadow: 0 4px 14px rgba(0,0,0,0.06);
          }
        }

        @keyframes pageFlipPrevTwoPage {
          0% {
            transform: perspective(2200px) rotateY(0deg);
            box-shadow: 0 4px 14px rgba(0,0,0,0.06);
          }
          45% {
            box-shadow: 22px 14px 40px rgba(25,18,10,0.28);
          }
          100% {
            transform: perspective(2200px) rotateY(180deg);
            box-shadow: 0 4px 14px rgba(0,0,0,0.06);
          }
        }

        @keyframes singlePageCurlNext {
          0% {
            transform: perspective(1400px) rotateY(0deg);
            opacity: 1;
          }
          100% {
            transform: perspective(1400px) rotateY(-90deg) translateX(-25%);
            opacity: 0.15;
          }
        }

        @keyframes singlePageCurlPrev {
          0% {
            transform: perspective(1400px) rotateY(90deg) translateX(-25%);
            opacity: 0.15;
          }
          100% {
            transform: perspective(1400px) rotateY(0deg);
            opacity: 1;
          }
        }

        .flip-leaf-next {
          transform-origin: left center;
          animation: pageFlipNextTwoPage 520ms cubic-bezier(0.35, 0.05, 0.25, 1) forwards;
          backface-visibility: hidden;
        }

        .flip-leaf-prev {
          transform-origin: right center;
          animation: pageFlipPrevTwoPage 520ms cubic-bezier(0.35, 0.05, 0.25, 1) forwards;
          backface-visibility: hidden;
        }
      `}</style>

      {/* 1. Reader Header Bar */}
      <header className="h-[60px] md:h-[68px] border-b border-[var(--rule)]/20 px-4 md:px-8 flex items-center justify-between bg-[var(--paper)]/60 backdrop-blur-xs z-20 shrink-0">
        {/* Left: Close button & Film Title */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="box-tag lbl text-[var(--ink)] bg-[var(--sheet)] hover:bg-[var(--paper)] transition-colors cursor-pointer"
            data-cursor="btn"
            aria-label="Đóng tập sách"
          >
            ĐÓNG
          </button>

          <div className="hidden sm:flex flex-col">
            <span className="lbl text-[var(--cobalt)]">
              {currentFilmTitle} ({ebook.year})
            </span>
            <span className="text-[10px] text-[var(--muted)] font-serif italic">
              {ebook.edition}
            </span>
          </div>
        </div>

        {/* Center: Film Selector Dropdown */}
        <div className="hidden md:flex items-center gap-2">
          <label htmlFor="film-folio-select" className="lbl text-[var(--muted)] text-[9.5px]">
            HỒ SƠ LƯU TRỮ:
          </label>
          <select
            id="film-folio-select"
            value={currentFilm.id}
            onChange={(e) => {
              const selected = FILMS.find((f) => f.id === e.target.value);
              if (selected) {
                setCurrentFilm(selected);
                setPageIndex(0);
                setFlipState(null);
              }
            }}
            className="bg-transparent border border-[var(--cobalt)]/40 text-[var(--cobalt)] lbl text-[10px] py-1 px-2.5 rounded-none cursor-pointer focus:outline-none hover:border-[var(--cobalt)] transition-colors"
          >
            {FILMS.map((f) => (
              <option key={f.id} value={f.id} className="bg-[var(--sheet)] text-[var(--ink)]">
                {f.year} — {f.titleVi || f.title}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Controls (TOC, Font, View Mode) */}
        <div className="flex items-center gap-3">
          {/* TOC Toggle */}
          <button
            type="button"
            onClick={() => setIsTocOpen(!isTocOpen)}
            className={`box-tag lbl cursor-pointer transition-colors ${
              isTocOpen
                ? 'bg-[var(--cobalt)] text-white border-[var(--cobalt)]'
                : 'text-[var(--cobalt)] border-[var(--cobalt)] hover:bg-[var(--cobalt)]/10'
            }`}
            data-cursor="btn"
            aria-label="Bật tắt mục lục"
          >
            MỤC LỤC
          </button>

          {/* Font Serif / Sans */}
          <div className="hidden lg:flex items-center border border-[var(--rule)]/40 p-0.5">
            <button
              type="button"
              onClick={() => setFontFamily('serif')}
              className={`px-2 py-0.5 text-xs font-serif ${
                fontFamily === 'serif' ? 'bg-[var(--cobalt)] text-white' : 'text-[var(--ink)]'
              }`}
              title="Phông Serif"
            >
              Serif
            </button>
            <button
              type="button"
              onClick={() => setFontFamily('sans')}
              className={`px-2 py-0.5 text-xs font-sans ${
                fontFamily === 'sans' ? 'bg-[var(--cobalt)] text-white' : 'text-[var(--ink)]'
              }`}
              title="Phông Sans-serif"
            >
              Sans
            </button>
          </div>

          {/* Font Size (+ / -) */}
          <div className="hidden sm:flex items-center border border-[var(--rule)]/40 p-0.5">
            <button
              type="button"
              disabled={fontSizeLevel <= 0}
              onClick={() => setFontSizeLevel((l) => Math.max(0, l - 1))}
              className="px-2 py-0.5 text-xs font-bold disabled:opacity-30 hover:bg-black/5"
              aria-label="Giảm cỡ chữ"
            >
              A-
            </button>
            <button
              type="button"
              disabled={fontSizeLevel >= 2}
              onClick={() => setFontSizeLevel((l) => Math.min(2, l + 1))}
              className="px-2 py-0.5 text-xs font-bold disabled:opacity-30 hover:bg-black/5"
              aria-label="Tăng cỡ chữ"
            >
              A+
            </button>
          </div>

          {/* Spread mode toggle on wide screens */}
          <button
            type="button"
            onClick={() => {
              setIsTwoPageMode(!isTwoPageMode);
              setFlipState(null);
            }}
            className="hidden lg:inline-flex box-tag lbl text-[var(--ink)] hover:bg-[var(--paper)] transition-colors cursor-pointer"
            title="Chuyển đổi chế độ 1 trang / 2 trang"
          >
            {isTwoPageMode ? '2 TRANG' : '1 TRANG'}
          </button>
        </div>
      </header>

      {/* 2. Main Reader Book Workspace */}
      <div className="relative flex-1 flex items-center justify-center p-3 md:p-8 overflow-hidden">
        {/* Navigation Arrow: Previous */}
        <button
          type="button"
          disabled={leftIndex === 0 || flipState !== null}
          onClick={handlePrevPage}
          className="absolute left-2 md:left-6 z-40 w-11 h-11 rounded-full border border-[var(--cobalt)]/30 bg-[var(--paper)]/90 backdrop-blur-xs text-[var(--cobalt)] flex items-center justify-center disabled:opacity-20 hover:bg-[var(--paper)] hover:border-[var(--cobalt)] hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none shadow-sm"
          data-cursor="btn"
          aria-label="Trang trước"
        >
          <svg width="20" height="12" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 1L1 6l5 5M1 6h23" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* 3D Book Container */}
        <div
          className={`relative w-full max-w-5xl h-[calc(100vh-170px)] bg-[#FAF8F5] border border-[var(--rule)]/25 shadow-2xl flex rounded-[2px] overflow-hidden ${
            fontFamily === 'serif' ? 'font-serif' : 'font-sans'
          }`}
          style={{
            perspective: '2200px',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Subtle center spine shadow in two-page mode */}
          {isTwoPageMode && (
            <div
              className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-10 pointer-events-none z-30"
              style={{
                background:
                  'linear-gradient(to right, rgba(0,0,0,0.08), rgba(0,0,0,0.01) 40%, rgba(0,0,0,0.01) 60%, rgba(0,0,0,0.08))',
                borderLeft: '1px solid rgba(20,20,20,0.06)',
                borderRight: '1px solid rgba(20,20,20,0.06)',
              }}
              aria-hidden="true"
            />
          )}

          {/* TWO-PAGE MODE LAYOUT */}
          {isTwoPageMode ? (
            <div className="relative w-full h-full flex">
              {/* STATIC UNDERLYING PAGES */}
              {/* Left Spread: clickable to go prev */}
              <div
                className="w-1/2 h-full flex flex-col cursor-pointer relative group"
                onClick={() => {
                  if (leftIndex > 0) handlePrevPage();
                }}
                title={leftIndex > 0 ? 'Nhấn để lật về trang trước' : ''}
              >
                <PageView
                  page={
                    flipState
                      ? flipState.direction === 'prev'
                        ? flattenedPages[flipState.toLeftIndex]
                        : flattenedPages[flipState.fromLeftIndex]
                      : flattenedPages[leftIndex]
                  }
                  isRightPage={false}
                  filmTitle={currentFilmTitle}
                  year={ebook.year}
                  fontSizes={fontSizes[fontSizeLevel]}
                  fontSizeLevel={fontSizeLevel}
                />
                {/* Left hover edge curl hint */}
                {leftIndex > 0 && !flipState && (
                  <div className="absolute top-0 bottom-0 left-0 w-8 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-r from-black/5 to-transparent" />
                )}
              </div>

              {/* Right Spread: clickable to go next */}
              <div
                className="w-1/2 h-full flex flex-col cursor-pointer relative border-l border-[var(--rule)]/10 group"
                onClick={() => {
                  if (rightIndex !== null && rightIndex < totalPages - 1) handleNextPage();
                }}
                title={
                  rightIndex !== null && rightIndex < totalPages - 1
                    ? 'Nhấn để lật sang trang tiếp theo'
                    : ''
                }
              >
                <PageView
                  page={
                    flipState
                      ? flipState.direction === 'next'
                        ? flattenedPages[flipState.toRightIndex || 0]
                        : flattenedPages[flipState.fromRightIndex || 0]
                      : rightIndex !== null
                      ? flattenedPages[rightIndex]
                      : undefined
                  }
                  isRightPage={true}
                  filmTitle={currentFilmTitle}
                  year={ebook.year}
                  fontSizes={fontSizes[fontSizeLevel]}
                  fontSizeLevel={fontSizeLevel}
                />
                {/* Right hover edge curl hint */}
                {rightIndex !== null && rightIndex < totalPages - 1 && !flipState && (
                  <div className="absolute top-0 bottom-0 right-0 w-8 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-l from-black/5 to-transparent" />
                )}
              </div>

              {/* 3D DYNAMIC FLIPPING LEAF (NEXT) */}
              {flipState && flipState.direction === 'next' && (
                <div
                  className="absolute top-0 bottom-0 left-1/2 w-1/2 h-full z-20"
                  style={{
                    transformOrigin: 'left center',
                    transformStyle: 'preserve-3d',
                    animation: 'pageFlipNextTwoPage 520ms cubic-bezier(0.35, 0.05, 0.25, 1) forwards',
                  }}
                >
                  {/* Front Face: current right page flipping over */}
                  <div
                    className="absolute inset-0 w-full h-full border-l border-[var(--rule)]/15 shadow-2xl overflow-hidden"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(0deg)',
                    }}
                  >
                    <PageView
                      page={flattenedPages[flipState.fromRightIndex || 0]}
                      isRightPage={true}
                      filmTitle={currentFilmTitle}
                      year={ebook.year}
                      fontSizes={fontSizes[fontSizeLevel]}
                      fontSizeLevel={fontSizeLevel}
                    />
                    {/* Shadow gradient across the turning paper */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(to right, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.02) 20%, transparent 60%)',
                      }}
                    />
                  </div>

                  {/* Back Face: upcoming left page landing flat */}
                  <div
                    className="absolute inset-0 w-full h-full border-r border-[var(--rule)]/15 shadow-2xl overflow-hidden"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <PageView
                      page={flattenedPages[flipState.toLeftIndex]}
                      isRightPage={false}
                      filmTitle={currentFilmTitle}
                      year={ebook.year}
                      fontSizes={fontSizes[fontSizeLevel]}
                      fontSizeLevel={fontSizeLevel}
                    />
                    {/* Shadow gradient on back crease */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(to left, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.02) 20%, transparent 60%)',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* 3D DYNAMIC FLIPPING LEAF (PREV) */}
              {flipState && flipState.direction === 'prev' && (
                <div
                  className="absolute top-0 bottom-0 left-0 w-1/2 h-full z-20"
                  style={{
                    transformOrigin: 'right center',
                    transformStyle: 'preserve-3d',
                    animation: 'pageFlipPrevTwoPage 520ms cubic-bezier(0.35, 0.05, 0.25, 1) forwards',
                  }}
                >
                  {/* Front Face: current left page flipping back */}
                  <div
                    className="absolute inset-0 w-full h-full border-r border-[var(--rule)]/15 shadow-2xl overflow-hidden"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(0deg)',
                    }}
                  >
                    <PageView
                      page={flattenedPages[flipState.fromLeftIndex]}
                      isRightPage={false}
                      filmTitle={currentFilmTitle}
                      year={ebook.year}
                      fontSizes={fontSizes[fontSizeLevel]}
                      fontSizeLevel={fontSizeLevel}
                    />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(to left, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.02) 20%, transparent 60%)',
                      }}
                    />
                  </div>

                  {/* Back Face: previous right page landing flat */}
                  <div
                    className="absolute inset-0 w-full h-full border-l border-[var(--rule)]/15 shadow-2xl overflow-hidden"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <PageView
                      page={
                        flipState.toRightIndex !== null
                          ? flattenedPages[flipState.toRightIndex]
                          : undefined
                      }
                      isRightPage={true}
                      filmTitle={currentFilmTitle}
                      year={ebook.year}
                      fontSizes={fontSizes[fontSizeLevel]}
                      fontSizeLevel={fontSizeLevel}
                    />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(to right, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.02) 20%, transparent 60%)',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* SINGLE-PAGE MODE LAYOUT (MOBILE / NARROW) */
            <div className="relative w-full h-full flex flex-col overflow-hidden">
              <div
                key={pageIndex}
                className="w-full h-full flex flex-col"
                style={{
                  animation:
                    flipState?.direction === 'prev'
                      ? 'singlePageCurlPrev 450ms cubic-bezier(0.25, 1, 0.5, 1) forwards'
                      : flipState?.direction === 'next'
                      ? 'singlePageCurlNext 450ms cubic-bezier(0.25, 1, 0.5, 1) forwards'
                      : undefined,
                }}
              >
                <PageView
                  page={flattenedPages[pageIndex]}
                  isRightPage={pageIndex % 2 !== 0}
                  filmTitle={currentFilmTitle}
                  year={ebook.year}
                  fontSizes={fontSizes[fontSizeLevel]}
                  fontSizeLevel={fontSizeLevel}
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Arrow: Next */}
        <button
          type="button"
          disabled={
            (isTwoPageMode
              ? rightIndex === null || rightIndex >= totalPages - 1
              : leftIndex >= totalPages - 1) || flipState !== null
          }
          onClick={handleNextPage}
          className="absolute right-2 md:right-6 z-40 w-11 h-11 rounded-full border border-[var(--cobalt)]/30 bg-[var(--paper)]/90 backdrop-blur-xs text-[var(--cobalt)] flex items-center justify-center disabled:opacity-20 hover:bg-[var(--paper)] hover:border-[var(--cobalt)] hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none shadow-sm"
          data-cursor="btn"
          aria-label="Trang tiếp theo"
        >
          <svg width="20" height="12" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 1l5 5-5 5M23 6H0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* 3. Bottom Scrubber & Progress Bar */}
      <footer className="h-[48px] border-t border-[var(--rule)]/20 px-6 flex items-center justify-between bg-[var(--paper)]/70 text-xs text-[var(--muted)] shrink-0 font-sans select-none">
        <div className="lbl text-[10px] text-[var(--cobalt)]">
          TRANG {flattenedPages[leftIndex] ? flattenedPages[leftIndex].pageNumber : 1}
          {isTwoPageMode && rightIndex !== null && flattenedPages[rightIndex]
            ? `–${flattenedPages[rightIndex].pageNumber}`
            : ''}{' '}
          TRÊN {totalPages}
        </div>

        {/* Linear progress bar */}
        <div className="flex-1 max-w-xs mx-6 h-1 bg-[var(--rule)]/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--cobalt)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-[11px] font-medium text-[var(--ink)]">
          {progress}% ĐÃ ĐỌC
        </div>
      </footer>

      {/* 4. Table of Contents Sliding Drawer */}
      {isTocOpen && (
        <div
          className="fixed inset-0 z-90 bg-black/30 backdrop-blur-xs flex justify-end"
          onClick={() => setIsTocOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[var(--sheet)] h-full p-8 border-l border-[var(--rule)] shadow-2xl flex flex-col overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-[var(--rule)]">
              <div>
                <span className="lbl text-[var(--cobalt)]">MỤC LỤC</span>
                <h3 className="font-sans font-semibold text-lg text-[var(--ink)]">
                  Hồ Sơ {currentFilmTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTocOpen(false)}
                className="box-tag lbl text-[var(--ink)] bg-transparent hover:bg-[var(--paper)] transition-colors cursor-pointer"
              >
                ĐÓNG
              </button>
            </div>

            {/* Chapters list */}
            <div className="space-y-4">
              {ebook.chapters.map((ch, chIdx) => {
                const firstPageInCh = flattenedPages.findIndex((p) => p.chapterTitle === ch.title);
                return (
                  <div
                    key={ch.id}
                    className="p-3 border border-[var(--rule)]/20 hover:border-[var(--cobalt)]/60 bg-[var(--paper)]/50 cursor-pointer transition-colors"
                    onClick={() => {
                      if (firstPageInCh !== -1) {
                        setPageIndex(firstPageInCh);
                        setFlipState(null);
                      }
                      setIsTocOpen(false);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <span className="lbl text-[9.5px] text-[var(--cobalt)]">
                        CHƯƠNG {chIdx + 1}
                      </span>
                      <span className="font-sans text-xs text-[var(--muted)]">
                        Trang {ch.pages[0]?.pageNumber || 1}
                      </span>
                    </div>
                    <div className="font-sans font-medium text-base text-[var(--ink)] mt-1">
                      {ch.title}
                    </div>
                    <div className="font-serif italic text-xs text-[var(--muted)] mt-0.5">
                      {ch.subtitle}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Film switch section inside TOC */}
            <div className="mt-8 pt-6 border-t border-[var(--rule)]/20">
              <span className="lbl text-[var(--muted)] block mb-3">CHUYỂN PHIM LƯU TRỮ</span>
              <div className="grid grid-cols-2 gap-2">
                {FILMS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setCurrentFilm(f);
                      setPageIndex(0);
                      setFlipState(null);
                      setIsTocOpen(false);
                    }}
                    className={`text-left p-2 text-xs border transition-colors ${
                      currentFilm.id === f.id
                        ? 'border-[var(--cobalt)] text-[var(--cobalt)] bg-[var(--cobalt)]/5 font-semibold'
                        : 'border-[var(--rule)]/20 text-[var(--ink)] hover:border-[var(--rule)]/60'
                    }`}
                  >
                    <span className="block text-[9px] opacity-70">{f.year}</span>
                    <span className="truncate block">{f.titleVi || f.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
