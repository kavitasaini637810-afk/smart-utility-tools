const test = require('node:test');
const assert = require('node:assert/strict');
const EMICalculator = require('../assets/js/tools/emi-calculator.js');

test('EMI Calculator - standard reducing balance calculation', () => {
  // Principal: 100000, Rate: 12% annual, Tenure: 1 year (12 months)
  // Monthly r = 0.01. EMI = 100000 * 0.01 * (1.01^12) / (1.01^12 - 1) = 8884.88
  const res = EMICalculator.calculateEMI(100000, 12, 1, 'years');
  assert.equal(res.error, undefined);
  assert.equal(res.totalMonths, 12);
  assert.ok(Math.abs(res.monthlyEMI - 8884.88) < 0.1);
  assert.ok(res.totalPayment > 100000);
  assert.ok(res.totalInterest > 0);
  assert.equal(res.schedule.length, 12);
});

test('EMI Calculator - zero interest handling (0%)', () => {
  // Principal: 12000, Rate: 0%, Tenure: 12 months
  const res = EMICalculator.calculateEMI(12000, 0, 12, 'months');
  assert.equal(res.error, undefined);
  assert.equal(res.monthlyEMI, 1000);
  assert.equal(res.totalInterest, 0);
  assert.equal(res.totalPayment, 12000);
});

test('EMI Calculator - negative or zero principal validation', () => {
  const res = EMICalculator.calculateEMI(0, 10, 5, 'years');
  assert.ok(res.error);

  const res2 = EMICalculator.calculateEMI(-5000, 10, 5, 'years');
  assert.ok(res2.error);
});

test('EMI Calculator - invalid tenure validation', () => {
  const res = EMICalculator.calculateEMI(10000, 5, 0, 'months');
  assert.ok(res.error);

  const res2 = EMICalculator.calculateEMI(10000, 5, 700, 'months');
  assert.ok(res2.error);
});

