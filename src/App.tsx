/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FILMS, FilmItem, preloadSheets } from './archive/films';
import { TopBar } from './components/TopBar';
import { HalftoneBackground } from './components/HalftoneBackground';
import { Shelf } from './components/Shelf';
import { Caption } from './components/Caption';
import { Timeline } from './components/Timeline';
import { Footer } from './components/Footer';
import { DetailSheet } from './components/DetailSheet';
import { EbookReader } from './components/EbookReader';
import { GeminiChatbot } from './components/GeminiChatbot';
import { CustomCursor, CursorState } from './components/CustomCursor';
import { PaperGrain } from './components/PaperGrain';

export default function App() {
  // Active film index (0 to 11) - default 5 (Noon in Ashes)
  const [activeFilmIndex, setActiveFilmIndex] = useState(5);
  const [slideDirection, setSlideDirection] = useState(1);
  const [currentYear, setCurrentYear] = useState(1971);

  // Detail Sheet state
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState<FilmItem | null>(null);
  const [coverRect, setCoverRect] = useState<DOMRect | null>(null);

  // Ebook Reader state
  const [isEbookOpen, setIsEbookOpen] = useState(false);
  const [ebookFilm, setEbookFilm] = useState<FilmItem | null>(null);

  // Gemini Chatbot state
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Imperative target step for shelf
  const [stepTarget, setStepTarget] = useState<number | null>(null);
  const currentTRef = useRef(17);

  // Custom cursor state
  const [cursorState, setCursorState] = useState<CursorState>('default');

  // About modal state
  const [infoModal, setInfoModal] = useState<string | null>(null);

  // Preload sheets on mount
  useEffect(() => {
    preloadSheets();
  }, []);

  // Keyboard navigation: Left/Right, Enter, Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isChatbotOpen) {
          setIsChatbotOpen(false);
        } else if (isEbookOpen) {
          setIsEbookOpen(false);
        } else if (isDetailOpen) {
          setIsDetailOpen(false);
        } else if (infoModal) {
          setInfoModal(null);
        }
      } else if (e.key === 'Enter') {
        if (!isDetailOpen && !isEbookOpen && !isChatbotOpen) {
          setSelectedFilm(FILMS[activeFilmIndex]);
          setIsDetailOpen(true);
        }
      } else if (e.key === 'ArrowRight') {
        if (!isDetailOpen && !isEbookOpen && !isChatbotOpen) {
          currentTRef.current += 1;
          setStepTarget(currentTRef.current);
          setSlideDirection(1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (!isDetailOpen && !isEbookOpen && !isChatbotOpen) {
          currentTRef.current -= 1;
          setStepTarget(currentTRef.current);
          setSlideDirection(-1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDetailOpen, isEbookOpen, isChatbotOpen, activeFilmIndex, infoModal]);

  // Listener to track hovered buttons for cursor state
  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[data-cursor="btn"]') ||
        target.closest('[role="slider"]')
      ) {
        setCursorState('btn');
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[data-cursor="btn"]') ||
        target.closest('[role="slider"]')
      ) {
        setCursorState('default');
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  const handleActiveFilmChange = useCallback((filmIndex: number, direction: number) => {
    setActiveFilmIndex(filmIndex);
    setSlideDirection(direction);
  }, []);

  const handleYearUpdate = useCallback((interpolatedYear: number) => {
    setCurrentYear(interpolatedYear);
  }, []);

  const handleOpenDetail = useCallback((film: FilmItem, rect: DOMRect | null) => {
    setSelectedFilm(film);
    setCoverRect(rect);
    setIsDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
  }, []);

  const handlePrev = useCallback(() => {
    currentTRef.current -= 1;
    setStepTarget(currentTRef.current);
    setSlideDirection(-1);
  }, []);

  const handleNext = useCallback(() => {
    currentTRef.current += 1;
    setStepTarget(currentTRef.current);
    setSlideDirection(1);
  }, []);

  const handleYearClick = useCallback((targetFilmIndex: number) => {
    // Jump by shortest way round
    const currentBase = ((currentTRef.current % 12) + 12) % 12;
    let delta = targetFilmIndex - currentBase;
    if (delta > 6) delta -= 12;
    if (delta < -6) delta += 12;

    currentTRef.current += delta;
    setStepTarget(currentTRef.current);
    setSlideDirection(delta >= 0 ? 1 : -1);
  }, []);

  const handleNavClick = (item: string) => {
    const key = item.toLowerCase();
    if (key === 'films' || key === 'phim') {
      // Toggle to first or next film
      handleNext();
    } else if (key === 'booklets' || key === 'tập sách') {
      setEbookFilm(FILMS[activeFilmIndex]);
      setIsEbookOpen(true);
    } else if (key === 'archivist ai' || key === 'ai giám tuyển' || key === 'chat') {
      setIsChatbotOpen(true);
    } else if (key === 'about' || key === 'giới thiệu') {
      setInfoModal('about');
    } else if (key === 'journal' || key === 'nhật ký') {
      setInfoModal('journal');
    } else {
      setInfoModal(item);
    }
  };

  const activeFilm = FILMS[activeFilmIndex];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
      {/* 1. Paper grain texture */}
      <PaperGrain />

      {/* 2. Top bar */}
      <TopBar onNavClick={handleNavClick} />

      {/* 3. Giant Halftone Kanji: 映画 / の記憶 */}
      <HalftoneBackground />

      {/* 4. 3D Curved Shelf with 36 tapes and floor shadow */}
      <Shelf
        isDetailOpen={isDetailOpen}
        isEbookOpen={isEbookOpen}
        isChatbotOpen={isChatbotOpen}
        onActiveFilmChange={handleActiveFilmChange}
        onYearUpdate={handleYearUpdate}
        onOpenDetail={handleOpenDetail}
        onCursorStateChange={(st) => {
          // If not hovering over a button, adopt shelf cursor state
          if (isEbookOpen || isChatbotOpen) {
            setCursorState('default');
            return;
          }
          if (cursorState !== 'btn' || st === 'open') {
            setCursorState(st);
          }
        }}
        stepTarget={stepTarget}
        onStepTargetHandled={() => setStepTarget(null)}
      />

      {/* 5. Center Caption with mask slide and navigation arrows */}
      <Caption
        film={activeFilm}
        direction={slideDirection}
        onPrev={handlePrev}
        onNext={handleNext}
        onTitleClick={() => handleOpenDetail(activeFilm, null)}
      />

      {/* 6. Timeline ruler 1955–1990 */}
      <Timeline currentYear={currentYear} onYearClick={handleYearClick} />

      {/* 7. Footer */}
      <Footer />

      {/* 8. Full-screen Detail Sheet with ink bleed reveal */}
      <DetailSheet
        film={selectedFilm || activeFilm}
        isOpen={isDetailOpen}
        coverRect={coverRect}
        onClose={handleCloseDetail}
        onReadBooklet={(film) => {
          setEbookFilm(film);
          setIsEbookOpen(true);
        }}
      />

      {/* 9. Interactive Ebook & Companion Monograph Reader */}
      <EbookReader
        initialFilm={ebookFilm || activeFilm}
        isOpen={isEbookOpen}
        onClose={() => setIsEbookOpen(false)}
      />

      {/* 10. Gemini Multi-Turn Conversational Archivist Chatbot */}
      <GeminiChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        activeFilm={activeFilm}
      />

      {/* Refined Archival Floating AI Trigger Widget */}
      <button
        type="button"
        onClick={() => setIsChatbotOpen(true)}
        className="fixed z-30 flex items-center gap-2 group transition-all duration-300 ease-out cursor-pointer focus:outline-none
          bottom-[72px] right-3 sm:right-5 md:bottom-[108px] md:right-8
          h-[32px] sm:h-[34px] md:h-[32px] px-2.5 sm:px-3 md:px-3.5
          rounded-full md:rounded-[2px]
          bg-[#FAF8F5]/90 hover:bg-[var(--cobalt)]
          border border-[var(--cobalt)]/40 hover:border-[var(--cobalt)]
          text-[var(--cobalt)] hover:text-white
          shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95
          backdrop-blur-md"
        data-cursor="btn"
        aria-label="Mở AI Giám Tuyển Lưu Trữ"
      >
        {/* Subtle breathing live beacon */}
        <span className="relative flex h-2 w-2 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--cobalt)] opacity-60 group-hover:bg-white" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--cobalt)] group-hover:bg-white transition-colors" />
        </span>

        {/* Delicate typography matching the site */}
        <span className="lbl text-[9.5px] sm:text-[10px] md:text-[10.5px] tracking-[0.16em] uppercase whitespace-nowrap transition-colors">
          AI GIÁM TUYỂN
        </span>
      </button>

      {/* 11. Custom Smooth Spring Cursor */}
      <CustomCursor state={cursorState} />

      {/* Info Modal for ABOUT / JOURNAL */}
      {infoModal && (
        <div
          className="fixed inset-0 z-80 bg-[var(--ink)]/40 backdrop-blur-xs flex items-center justify-center p-6"
          onClick={() => setInfoModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-[var(--sheet)] p-8 max-w-lg w-full border border-[var(--rule)] shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <span className="lbl text-[var(--cobalt)]">
                {infoModal === 'about' ? 'GIỚI THIỆU' : 'NHẬT KÝ LƯU TRỮ'}
              </span>
              <button
                type="button"
                className="box-tag lbl text-[var(--ink)] bg-transparent hover:bg-[var(--paper)] transition-colors cursor-pointer"
                onClick={() => setInfoModal(null)}
              >
                ĐÓNG
              </button>
            </div>
            <h2 className="font-sans font-semibold text-2xl text-[var(--cobalt)] mb-4">
              {infoModal === 'about'
                ? 'Điện Ảnh Của Leon Vasari'
                : 'Ghi Chú Phục Chế Lưu Trữ'}
            </h2>
            <div className="font-serif text-base leading-relaxed text-[var(--ink)] space-y-3">
              {infoModal === 'about' ? (
                <>
                  <p>
                    Leon Vasari (1922–2004) đã sáng tác mười hai tác phẩm điện ảnh kinh điển trải dài qua bốn thập kỷ.
                    Làm việc giữa Hokkaido tuyết trắng và các hải cảng Địa Trung Hải ngập nắng, điện ảnh của ông dung hợp
                    chủ nghĩa hiện thực đen trắng khắc nghiệt cùng ngữ pháp thị giác in lụa duotone rực rỡ và ám ảnh.
                  </p>
                  <p>
                    Mỗi cuộn băng từ tính trong không gian sắp đặt cong này đại diện cho một bản master băng từ gốc
                    được bảo tồn ở tốc độ 24 hình/giây dưới định dạng lưu trữ tiêu chuẩn NTSC / PAL.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Bộ sưu tập Quỹ Vasari gìn giữ các bản chuyển đổi phim âm bản 35mm, các băng từ gốc master,
                    và các hộp bìa trượt in lụa thủ công nguyên bản.
                  </p>
                  <p>
                    Tập VII đã được quét số hóa vào mùa thu năm 2026 ở độ phân giải 4K bằng thiết bị quang học wet-gate chuyên dụng.
                  </p>
                </>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--rule)] text-xs text-[var(--muted)] font-sans">
              Nhấn phím Escape hoặc bấm Đóng để quay lại kệ băng VHS.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
