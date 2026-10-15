/**
 * Tool 4: EMI Loan Calculator
 * Standard reducing-balance EMI formula, zero-interest handling,
 * loan amortization schedule, and complete validation.
 */

var EMICalculator = (function () {
  'use strict';

  function calculateEMI(principal, annualRate, tenureValue, tenureType) {
    if (isNaN(principal) || principal <= 0) {
      return { error: 'Please enter a valid loan principal amount greater than 0.' };
    }
    if (isNaN(annualRate) || annualRate < 0) {
      return { error: 'Please enter a valid annual interest rate (0% or greater).' };
    }
    if (isNaN(tenureValue) || tenureValue <= 0) {
      return { error: 'Please enter a valid loan tenure greater than 0.' };
    }

    var totalMonths = tenureType === 'years' ? Math.round(tenureValue * 12) : Math.round(tenureValue);
    if (totalMonths <= 0 || totalMonths > 600) {
      return { error: 'Tenure must be between 1 month and 50 years (600 months).' };
    }

    var monthlyEMI = 0;
    var totalPayment = 0;
    var totalInterest = 0;

    if (annualRate === 0) {
      // Zero-interest financing
      monthlyEMI = principal / totalMonths;
      totalPayment = principal;
      totalInterest = 0;
    } else {
      var r = annualRate / (12 * 100);
      var factor = Math.pow(1 + r, totalMonths);
      monthlyEMI = (principal * r * factor) / (factor - 1);
      totalPayment = monthlyEMI * totalMonths;
      totalInterest = totalPayment - principal;
    }

    // Generate amortization preview (first 12 months)
    var balance = principal;
    var monthlyRate = annualRate / (12 * 100);
    var schedule = [];

    for (var m = 1; m <= totalMonths; m++) {
      var interestPart = annualRate === 0 ? 0 : balance * monthlyRate;
      var principalPart = monthlyEMI - interestPart;
      balance = Math.max(0, balance - principalPart);

      if (m <= 12 || m === totalMonths) {
        schedule.push({
          month: m,
          emi: monthlyEMI,
          principalPaid: principalPart,
          interestPaid: interestPart,
          remainingBalance: balance
        });
      }
    }

    return {
      monthlyEMI: monthlyEMI,
      totalInterest: totalInterest,
      totalPayment: totalPayment,
      principal: principal,
      totalMonths: totalMonths,
      schedule: schedule
    };
  }

  // DOM Binding
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      var emiForm = document.getElementById('emiForm');
      var principalInput = document.getElementById('principal');
      var rateInput = document.getElementById('rate');
      var tenureInput = document.getElementById('tenure');
      var tenureTypeInput = document.getElementById('tenureType');
      var emiResult = document.getElementById('emiResult');
      var emiError = document.getElementById('emiError');

      if (emiForm) {
        emiForm.addEventListener('submit', function (e) {
          e.preventDefault();
          emiError.style.display = 'none';
          emiResult.style.display = 'none';

          var p = parseFloat(principalInput.value);
          var r = parseFloat(rateInput.value);
          var t = parseFloat(tenureInput.value);
          var type = tenureTypeInput ? tenureTypeInput.value : 'years';

          var res = calculateEMI(p, r, t, type);

          if (res.error) {
            emiError.textContent = res.error;
            emiError.style.display = 'block';
            return;
          }

          document.getElementById('resEMI').textContent = res.monthlyEMI.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          document.getElementById('resInterest').textContent = res.totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          document.getElementById('resTotal').textContent = res.totalPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          document.getElementById('resTenureMonths').textContent = res.totalMonths + ' Months';

          // Populate Amortization Table
          var tableBody = document.getElementById('amortizationBody');
          if (tableBody) {
            tableBody.innerHTML = '';
            res.schedule.forEach(function (row) {
              var tr = document.createElement('tr');
              tr.innerHTML = '<td>Month ' + row.month + '</td>' +
                '<td>' + row.emi.toFixed(2) + '</td>' +
                '<td>' + row.principalPaid.toFixed(2) + '</td>' +
                '<td>' + row.interestPaid.toFixed(2) + '</td>' +
                '<td>' + row.remainingBalance.toFixed(2) + '</td>';
              tableBody.appendChild(tr);
            });
          }

          emiResult.style.display = 'block';
        });
      }
    });
  }

  return {
    calculateEMI: calculateEMI
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EMICalculator;
}

