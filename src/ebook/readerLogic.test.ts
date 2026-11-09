import test from 'node:test';
import assert from 'node:assert/strict';
import {
  flattenEbookPages,
  calculateProgress,
  getSpreadPageIndices,
  getNextPageIndex,
  getPrevPageIndex,
} from './readerLogic.ts';
import { EBOOK_DATABASE } from './ebookData.ts';

test('flattenEbookPages flattens chapters into sequential list', () => {
  const noonEbook = EBOOK_DATABASE.noon;
  const pages = flattenEbookPages(noonEbook);
  assert.equal(pages.length, 5);
  assert.equal(pages[0].pageNumber, 1);
  assert.equal(pages[0].chapterTitle, 'Act I: The White Meridian');
  assert.equal(pages[4].pageNumber, 5);
  assert.equal(pages[4].chapterTitle, 'Chapter III: The Silence After Noon');
});

test('calculateProgress returns accurate percentage', () => {
  assert.equal(calculateProgress(0, 5), 20);
  assert.equal(calculateProgress(4, 5), 100);
  assert.equal(calculateProgress(2, 5), 60);
  assert.equal(calculateProgress(0, 1), 100);
});

test('getSpreadPageIndices handles single and two-page spreads', () => {
  // Single page mode
  assert.deepEqual(getSpreadPageIndices(2, false, 5), { leftIndex: 2, rightIndex: null });

  // Two page mode: index 0 -> left: 0, right: 1
  assert.deepEqual(getSpreadPageIndices(0, true, 5), { leftIndex: 0, rightIndex: 1 });
  // index 1 -> snaps to even left: 0, right: 1
  assert.deepEqual(getSpreadPageIndices(1, true, 5), { leftIndex: 0, rightIndex: 1 });
  // index 2 -> left: 2, right: 3
  assert.deepEqual(getSpreadPageIndices(2, true, 5), { leftIndex: 2, rightIndex: 3 });
  // index 4 (last page of 5) -> left: 4, right: null
  assert.deepEqual(getSpreadPageIndices(4, true, 5), { leftIndex: 4, rightIndex: null });
});

test('getNextPageIndex and getPrevPageIndex bounds', () => {
  // Two page step
  assert.equal(getNextPageIndex(0, true, 5), 2);
  assert.equal(getNextPageIndex(3, true, 5), 4);
  assert.equal(getNextPageIndex(4, true, 5), 4); // clamped at max
  assert.equal(getPrevPageIndex(2, true), 0);
  assert.equal(getPrevPageIndex(0, true), 0); // clamped at min

  // Single page step
  assert.equal(getNextPageIndex(1, false, 5), 2);
  assert.equal(getPrevPageIndex(1, false), 0);
});
