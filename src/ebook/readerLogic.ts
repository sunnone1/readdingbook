import { FilmEbook } from './ebookData';

export interface FlattenedPage {
  index: number;
  pageNumber: number;
  chapterTitle: string;
  chapterSubtitle: string;
  header?: string;
  type?: 'screenplay' | 'prose' | 'notes';
  content: string[];
}

export function flattenEbookPages(ebook: FilmEbook): FlattenedPage[] {
  const result: FlattenedPage[] = [];
  let index = 0;

  for (const chapter of ebook.chapters) {
    for (const page of chapter.pages) {
      result.push({
        index,
        pageNumber: page.pageNumber,
        chapterTitle: chapter.title,
        chapterSubtitle: chapter.subtitle,
        header: page.header,
        type: page.type,
        content: page.content,
      });
      index++;
    }
  }

  return result;
}

export function calculateProgress(currentPageIndex: number, totalPages: number): number {
  if (totalPages <= 1) return 100;
  return Math.round(((currentPageIndex + 1) / totalPages) * 100);
}

export function getSpreadPageIndices(pageIndex: number, isTwoPageMode: boolean, totalPages: number): {
  leftIndex: number;
  rightIndex: number | null;
} {
  if (!isTwoPageMode) {
    return { leftIndex: pageIndex, rightIndex: null };
  }

  // Two page spread: even index on left, odd on right (0 & 1, 2 & 3, etc.)
  const evenIndex = pageIndex % 2 === 0 ? pageIndex : pageIndex - 1;
  const leftIndex = Math.max(0, Math.min(evenIndex, totalPages - 1));
  const rightIndex = leftIndex + 1 < totalPages ? leftIndex + 1 : null;

  return { leftIndex, rightIndex };
}

export function getNextPageIndex(currentIndex: number, isTwoPageMode: boolean, totalPages: number): number {
  const step = isTwoPageMode ? 2 : 1;
  return Math.min(totalPages - 1, currentIndex + step);
}

export function getPrevPageIndex(currentIndex: number, isTwoPageMode: boolean): number {
  const step = isTwoPageMode ? 2 : 1;
  return Math.max(0, currentIndex - step);
}
