const test = require('node:test');
const assert = require('node:assert/strict');

test('Image Resizer - aspect ratio preservation calculations', () => {
  const originalWidth = 1920;
  const originalHeight = 1080;
  const aspectRatio = originalWidth / originalHeight; // 1.7777...

  // When changing width to 800
  const targetWidth = 800;
  const calculatedHeight = Math.round(targetWidth / aspectRatio);
  assert.equal(calculatedHeight, 450);

  // When changing height to 720
  const targetHeight = 720;
  const calculatedWidth = Math.round(targetHeight * aspectRatio);
  assert.equal(calculatedWidth, 1280);
});

test('Image Resizer - dimension safeguard thresholds', () => {
  const maxAllowed = 8000;
  
  function validateDimensions(w, h) {
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return 'Invalid dimensions';
    if (w > maxAllowed || h > maxAllowed) return 'Dimension exceeds safeguard limit';
    return 'valid';
  }

  assert.equal(validateDimensions(1000, 800), 'valid');
  assert.equal(validateDimensions(8001, 800), 'Dimension exceeds safeguard limit');
  assert.equal(validateDimensions(0, 500), 'Invalid dimensions');
  assert.equal(validateDimensions(-10, 500), 'Invalid dimensions');
});

test('Image Compressor - savings and percentage calculations', () => {
  function computeCompressionSavings(origBytes, compBytes) {
    const diff = origBytes - compBytes;
    const percent = parseFloat(((diff / origBytes) * 100).toFixed(1));
    return { diff, percent, saved: diff > 0 };
  }

  // Case 1: Successful compression (1,000,000 bytes down to 300,000 bytes)
  const c1 = computeCompressionSavings(1000000, 300000);
  assert.equal(c1.diff, 700000);
  assert.equal(c1.percent, 70.0);
  assert.equal(c1.saved, true);

  // Case 2: Already compressed file increases in size (100,000 bytes up to 120,000 bytes)
  const c2 = computeCompressionSavings(100000, 120000);
  assert.equal(c2.diff, -20000);
  assert.equal(c2.percent, -20.0);
  assert.equal(c2.saved, false);
});

