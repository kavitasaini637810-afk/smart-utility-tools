/**
 * Tool 2: Percentage Calculator
 * 4 core percentage calculations with input validation, zero division protection,
 * step-by-step formula explanation, and clear error reporting.
 */

var PercentageCalc = (function () {
  'use strict';

  function formatNum(n) {
    if (isNaN(n) || !isFinite(n)) return '0';
    // Remove trailing zeroes after decimal if unnecessary
    return Number(n.toFixed(4)).toLocaleString();
  }

  // Mode 1: What is X% of Y?
  function calculatePercentOf(x, y) {
    if (isNaN(x) || isNaN(y)) {
      return { error: 'Please enter valid numbers for both values.' };
    }
    var result = (x / 100) * y;
    return {
      result: result,
      formatted: formatNum(result),
      formula: x + '% × ' + y + ' = (' + x + ' ÷ 100) × ' + y + ' = ' + formatNum(result)
    };
  }

  // Mode 2: What percentage is X of Y?
  function calculateWhatPercent(x, y) {
    if (isNaN(x) || isNaN(y)) {
      return { error: 'Please enter valid numbers for both values.' };
    }
    if (y === 0) {
      return { error: 'Division by zero is undefined. Y cannot be zero.' };
    }
    var result = (x / y) * 100;
    return {
      result: result,
      formatted: formatNum(result) + '%',
      formula: '(' + x + ' ÷ ' + y + ') × 100 = ' + formatNum(result) + '%'
    };
  }

  // Mode 3: Percentage Increase from X to Y
  function calculatePercentIncrease(x, y) {
    if (isNaN(x) || isNaN(y)) {
      return { error: 'Please enter valid numbers for both values.' };
    }
    if (x === 0) {
      return { error: 'Initial value X cannot be zero when calculating percentage increase.' };
    }
    var diff = y - x;
    var result = (diff / Math.abs(x)) * 100;
    var isPositive = diff >= 0;
    return {
      result: result,
      difference: diff,
      isPositive: isPositive,
      formatted: formatNum(result) + '%',
      formula: '((' + y + ' - ' + x + ') ÷ |' + x + '|) × 100 = ' + formatNum(result) + '%'
    };
  }

  // Mode 4: Percentage Decrease from X to Y
  function calculatePercentDecrease(x, y) {
    if (isNaN(x) || isNaN(y)) {
      return { error: 'Please enter valid numbers for both values.' };
    }
    if (x === 0) {
      return { error: 'Initial value X cannot be zero when calculating percentage decrease.' };
    }
    var diff = x - y;
    var result = (diff / Math.abs(x)) * 100;
    return {
      result: result,
      difference: diff,
      formatted: formatNum(result) + '%',
      formula: '((' + x + ' - ' + y + ') ÷ |' + x + '|) × 100 = ' + formatNum(result) + '%'
    };
  }

  // DOM Event Binding if running in browser
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      // Setup Mode 1 Form
      var form1 = document.getElementById('formPercentOf');
      if (form1) {
        form1.addEventListener('submit', function (e) {
          e.preventDefault();
          var x = parseFloat(document.getElementById('p1_x').value);
          var y = parseFloat(document.getElementById('p1_y').value);
          var resBox = document.getElementById('res_p1');
          var out = calculatePercentOf(x, y);
          if (out.error) {
            resBox.className = 'alert alert-danger';
            resBox.textContent = out.error;
          } else {
            resBox.className = 'alert alert-success';
            resBox.innerHTML = '<strong>Result: ' + out.formatted + '</strong><br><small class="text-muted">' + out.formula + '</small>';
          }
          resBox.style.display = 'block';
        });
      }

      // Setup Mode 2 Form
      var form2 = document.getElementById('formWhatPercent');
      if (form2) {
        form2.addEventListener('submit', function (e) {
          e.preventDefault();
          var x = parseFloat(document.getElementById('p2_x').value);
          var y = parseFloat(document.getElementById('p2_y').value);
          var resBox = document.getElementById('res_p2');
          var out = calculateWhatPercent(x, y);
          if (out.error) {
            resBox.className = 'alert alert-danger';
            resBox.textContent = out.error;
          } else {
            resBox.className = 'alert alert-success';
            resBox.innerHTML = '<strong>Result: ' + out.formatted + '</strong><br><small class="text-muted">' + out.formula + '</small>';
          }
          resBox.style.display = 'block';
        });
      }

      // Setup Mode 3 Form
      var form3 = document.getElementById('formPercentIncrease');
      if (form3) {
        form3.addEventListener('submit', function (e) {
          e.preventDefault();
          var x = parseFloat(document.getElementById('p3_x').value);
          var y = parseFloat(document.getElementById('p3_y').value);
          var resBox = document.getElementById('res_p3');
          var out = calculatePercentIncrease(x, y);
          if (out.error) {
            resBox.className = 'alert alert-danger';
            resBox.textContent = out.error;
          } else {
            resBox.className = 'alert alert-success';
            resBox.innerHTML = '<strong>' + (out.isPositive ? 'Increase: +' : 'Change: ') + out.formatted + '</strong><br><small class="text-muted">' + out.formula + '</small>';
          }
          resBox.style.display = 'block';
        });
      }

      // Setup Mode 4 Form
      var form4 = document.getElementById('formPercentDecrease');
      if (form4) {
        form4.addEventListener('submit', function (e) {
          e.preventDefault();
          var x = parseFloat(document.getElementById('p4_x').value);
          var y = parseFloat(document.getElementById('p4_y').value);
          var resBox = document.getElementById('res_p4');
          var out = calculatePercentDecrease(x, y);
          if (out.error) {
            resBox.className = 'alert alert-danger';
            resBox.textContent = out.error;
          } else {
            resBox.className = 'alert alert-success';
            resBox.innerHTML = '<strong>Decrease: ' + out.formatted + '</strong><br><small class="text-muted">' + out.formula + '</small>';
          }
          resBox.style.display = 'block';
        });
      }
    });
  }

  return {
    calculatePercentOf: calculatePercentOf,
    calculateWhatPercent: calculateWhatPercent,
    calculatePercentIncrease: calculatePercentIncrease,
    calculatePercentDecrease: calculatePercentDecrease
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PercentageCalc;
}

