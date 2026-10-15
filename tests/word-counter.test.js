const test = require('node:test');
const assert = require('node:assert/strict');
const { analyzeText } = require('../assets/js/tools/word-counter.js');

test('Word Counter - empty input', () => {
  const res = analyzeText('');
  assert.equal(res.words, 0);
  assert.equal(res.charsWithSpaces, 0);
  assert.equal(res.charsNoSpaces, 0);
  assert.equal(res.sentences, 0);
  assert.equal(res.paragraphs, 0);
  assert.equal(res.readingTime, '0 sec');
});

test('Word Counter - multiple spaces and tabs', () => {
  const text = '   Hello    world   with    spaces   ';
  const res = analyzeText(text);
  assert.equal(res.words, 4);
  assert.equal(res.charsNoSpaces, 20); // 5 + 5 + 4 + 6 = 20
  assert.equal(res.sentences, 1);
});

test('Word Counter - multiple paragraphs and newlines', () => {
  const text = 'Paragraph 1.\n\nParagraph 2 has more text.\r\n\r\nParagraph 3.';
  const res = analyzeText(text);
  assert.equal(res.words, 9); // 'Paragraph', '1.', 'Paragraph', '2', 'has', 'more', 'text.', 'Paragraph', '3.' = 9
  assert.equal(res.paragraphs, 3);
  assert.equal(res.sentences, 3);
});

test('Word Counter - Unicode and emojis', () => {
  const text = 'Bonjour le monde! 🌍✨ Ça va? こんにちは';
  const res = analyzeText(text);
  assert.ok(res.words >= 5);
  assert.ok(res.charsWithSpaces > 0);
  // Verify Unicode characters are correctly counted without surrogate pair splits
  assert.equal(Array.from('🌍✨').length, 2);
});

test('Word Counter - reading time calculation', () => {
  // 400 words should be 2 minutes
  const words400 = new Array(400).fill('word').join(' ') + '.';
  const res = analyzeText(words400);
  assert.equal(res.words, 400);
  assert.equal(res.readingTime, '2 min');
});
