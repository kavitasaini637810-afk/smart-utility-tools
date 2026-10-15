const test = require('node:test');
const assert = require('node:assert/strict');
const GSTCalculator = require('../assets/js/tools/gst-calculator.js');

test('GST Calculator - exclusive (Add GST) at 18%', () => {
  const res = GSTCalculator.calculateGST(1000, 18, 'exclusive');
  assert.equal(res.error, undefined);
  assert.equal(res.baseAmount, 1000);
  assert.equal(res.gstAmount, 180);
  assert.equal(res.totalAmount, 1180);
  assert.equal(res.cgst, 90);
  assert.equal(res.sgst, 90);
  assert.equal(res.igst, 180);
});

test('GST Calculator - inclusive (Remove GST) at 18%', () => {
  const res = GSTCalculator.calculateGST(1180, 18, 'inclusive');
  assert.equal(res.error, undefined);
  assert.equal(Math.round(res.baseAmount), 1000);
  assert.equal(Math.round(res.gstAmount), 180);
  assert.equal(res.totalAmount, 1180);
  assert.equal(Math.round(res.cgst), 90);
  assert.equal(Math.round(res.sgst), 90);
});

test('GST Calculator - all standard rates (0%, 5%, 12%, 18%, 28%)', () => {
  const rates = [0, 5, 12, 18, 28];
  rates.forEach(rate => {
    const res = GSTCalculator.calculateGST(100, rate, 'exclusive');
    assert.equal(res.error, undefined);
    assert.equal(res.gstAmount, rate);
    assert.equal(res.totalAmount, 100 + rate);
  });
});

test('GST Calculator - invalid inputs', () => {
  const res = GSTCalculator.calculateGST(0, 18, 'exclusive');
  assert.ok(res.error);

  const res2 = GSTCalculator.calculateGST(-100, 18, 'exclusive');
  assert.ok(res2.error);

  const res3 = GSTCalculator.calculateGST(100, -5, 'exclusive');
  assert.ok(res3.error);
});

