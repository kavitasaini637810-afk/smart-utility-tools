const test = require('node:test');
const assert = require('node:assert/strict');
const PercentageCalc = require('../assets/js/tools/percentage-calculator.js');

test('Percentage Calculator - normal calculations (X% of Y)', () => {
  const res = PercentageCalc.calculatePercentOf(15, 200);
  assert.equal(res.result, 30);
  assert.equal(res.error, undefined);
});

test('Percentage Calculator - what percent is X of Y', () => {
  const res = PercentageCalc.calculateWhatPercent(25, 100);
  assert.equal(res.result, 25);
  assert.equal(res.formatted, '25%');
});

test('Percentage Calculator - division by zero handling', () => {
  const res = PercentageCalc.calculateWhatPercent(50, 0);
  assert.ok(res.error);
  assert.match(res.error, /Division by zero/i);
});

test('Percentage Calculator - zero values', () => {
  const res = PercentageCalc.calculatePercentOf(0, 500);
  assert.equal(res.result, 0);

  const res2 = PercentageCalc.calculatePercentOf(10, 0);
  assert.equal(res2.result, 0);
});

test('Percentage Calculator - percentage increase', () => {
  const res = PercentageCalc.calculatePercentIncrease(50, 75);
  assert.equal(res.result, 50); // 50% increase
  assert.equal(res.difference, 25);
});

test('Percentage Calculator - percentage increase with zero initial value', () => {
  const res = PercentageCalc.calculatePercentIncrease(0, 100);
  assert.ok(res.error);
});

test('Percentage Calculator - percentage decrease', () => {
  const res = PercentageCalc.calculatePercentDecrease(100, 80);
  assert.equal(res.result, 20); // 20% decrease
  assert.equal(res.difference, 20);
});

test('Percentage Calculator - invalid inputs', () => {
  const res = PercentageCalc.calculatePercentOf(NaN, 100);
  assert.ok(res.error);
});
