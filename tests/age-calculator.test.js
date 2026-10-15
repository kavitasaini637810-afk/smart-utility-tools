const test = require('node:test');
const assert = require('node:assert/strict');
const AgeCalculator = require('../assets/js/tools/age-calculator.js');

test('Age Calculator - normal valid dates', () => {
  // Born 2000-01-15, Target 2026-10-15
  const res = AgeCalculator.calculateAge('2000-01-15', '2026-10-15');
  assert.equal(res.years, 26);
  assert.equal(res.months, 9);
  assert.equal(res.days, 0);
  assert.equal(res.error, undefined);
  assert.ok(res.totalDays > 0);
});

test('Age Calculator - month borrowing logic', () => {
  // Born 2000-05-25, Target 2026-05-10 (Target day < DOB day)
  const res = AgeCalculator.calculateAge('2000-05-25', '2026-05-10');
  assert.equal(res.years, 25);
  assert.equal(res.months, 11);
  // April 2026 has 30 days. 10 - 25 + 30 = 15 days
  assert.equal(res.days, 15);
});

test('Age Calculator - future dates rejection', () => {
  const res = AgeCalculator.calculateAge('2030-01-01', '2026-10-15');
  assert.ok(res.error);
  assert.match(res.error, /future/i);
});

test('Age Calculator - invalid date inputs', () => {
  const res = AgeCalculator.calculateAge('not-a-date', '2026-10-15');
  assert.ok(res.error);
});

test('Age Calculator - leap year detection', () => {
  assert.equal(AgeCalculator.isLeapYear(2000), true); // Divisible by 400
  assert.equal(AgeCalculator.isLeapYear(1900), false); // Divisible by 100 but not 400
  assert.equal(AgeCalculator.isLeapYear(2024), true); // Divisible by 4
  assert.equal(AgeCalculator.isLeapYear(2025), false);
});

test('Age Calculator - Feb 29 leap year birthday countdown', () => {
  // Born on Feb 29, 2004. On Oct 15, 2026, next birthday is Feb 28, 2027 (non-leap year)
  const res = AgeCalculator.calculateAge('2004-02-29', '2026-10-15');
  assert.ok(res.daysUntilNextBday > 0);
});

