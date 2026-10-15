const test = require('node:test');
const assert = require('node:assert/strict');
const PDFSplitter = require('../assets/js/tools/pdf-splitter.js');
const { PDFDocument } = require('pdf-lib');

test('PDF Splitter - range parsing valid format "1-3, 5, 8-10"', () => {
  const res = PDFSplitter.parsePageRanges('1-3, 5, 8-10', 12);
  assert.equal(res.error, undefined);
  assert.deepEqual(res.pages, [1, 2, 3, 5, 8, 9, 10]);
  assert.deepEqual(res.indices, [0, 1, 2, 4, 7, 8, 9]);
});

test('PDF Splitter - range parsing single pages with duplicates', () => {
  const res = PDFSplitter.parsePageRanges('2, 4, 2, 1', 10);
  assert.equal(res.error, undefined);
  assert.deepEqual(res.pages, [1, 2, 4]); // Sorted & deduplicated
});

test('PDF Splitter - out of range detection', () => {
  const res = PDFSplitter.parsePageRanges('1-5, 15', 10);
  assert.ok(res.error);
  assert.match(res.error, /exceeds/i);
});

test('PDF Splitter - invalid range syntax (start > end)', () => {
  const res = PDFSplitter.parsePageRanges('7-3', 10);
  assert.ok(res.error);
  assert.match(res.error, /greater/i);
});

test('PDF Splitter - invalid letters or symbols', () => {
  const res = PDFSplitter.parsePageRanges('abc, 3-5', 10);
  assert.ok(res.error);
});

test('PDF Splitter - zero or negative page rejection', () => {
  const res = PDFSplitter.parsePageRanges('0, 2', 10);
  assert.ok(res.error);
});

test('PDF Merger & Splitter - Real PDF binary generation & manipulation', async () => {
  // 1. Create PDF Document A (2 pages)
  const docA = await PDFDocument.create();
  docA.addPage([200, 200]);
  docA.addPage([200, 200]);
  const bytesA = await docA.save();

  // 2. Create PDF Document B (3 pages)
  const docB = await PDFDocument.create();
  docB.addPage([300, 300]);
  docB.addPage([300, 300]);
  docB.addPage([300, 300]);
  const bytesB = await docB.save();

  // 3. Merge them into a single PDF
  const mergedDoc = await PDFDocument.create();
  const loadedA = await PDFDocument.load(bytesA);
  const loadedB = await PDFDocument.load(bytesB);

  const copiedFromA = await mergedDoc.copyPages(loadedA, loadedA.getPageIndices());
  copiedFromA.forEach(p => mergedDoc.addPage(p));

  const copiedFromB = await mergedDoc.copyPages(loadedB, loadedB.getPageIndices());
  copiedFromB.forEach(p => mergedDoc.addPage(p));

  const mergedBytes = await mergedDoc.save();
  const finalMerged = await PDFDocument.load(mergedBytes);
  assert.equal(finalMerged.getPageCount(), 5, 'Merged document must contain 2 + 3 = 5 pages');

  // 4. Split / Extract pages 2-4 from merged document
  const rangeInfo = PDFSplitter.parsePageRanges('2-4', 5);
  assert.equal(rangeInfo.pages.length, 3);

  const splitDoc = await PDFDocument.create();
  const splitPages = await splitDoc.copyPages(finalMerged, rangeInfo.indices);
  splitPages.forEach(p => splitDoc.addPage(p));

  const splitBytes = await splitDoc.save();
  const finalSplit = await PDFDocument.load(splitBytes);
  assert.equal(finalSplit.getPageCount(), 3, 'Extracted document must contain exactly 3 pages');
});
