/**
 * Tool 5: GST (Goods & Services Tax) Calculator
 * Calculate GST Exclusive (Add GST) and GST Inclusive (Remove GST)
 * with CGST, SGST, IGST split breakdowns and currency formatting.
 */

var GSTCalculator = (function () {
  'use strict';

  function calculateGST(amount, rate, mode) {
    if (isNaN(amount) || amount <= 0) {
      return { error: 'Please enter a valid amount greater than 0.' };
    }
    if (isNaN(rate) || rate < 0) {
      return { error: 'Please select or enter a valid tax rate percentage (0% or greater).' };
    }

    var baseAmount, gstAmount, totalAmount;

    if (mode === 'inclusive') {
      // Amount entered already includes GST
      totalAmount = amount;
      baseAmount = totalAmount / (1 + (rate / 100));
      gstAmount = totalAmount - baseAmount;
    } else {
      // GST is added on top of base amount (exclusive)
      baseAmount = amount;
      gstAmount = baseAmount * (rate / 100);
      totalAmount = baseAmount + gstAmount;
    }

    baseAmount = Math.round(baseAmount * 100) / 100;
    gstAmount = Math.round(gstAmount * 100) / 100;
    totalAmount = Math.round(totalAmount * 100) / 100;

    var cgst = Math.round((gstAmount / 2) * 100) / 100;
    var sgst = Math.round((gstAmount / 2) * 100) / 100;
    var igst = gstAmount;

    return {
      baseAmount: baseAmount,
      gstAmount: gstAmount,
      totalAmount: totalAmount,
      cgst: cgst,
      sgst: sgst,
      igst: igst,
      rate: rate,
      mode: mode
    };
  }

  // DOM Event Binding
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      var gstForm = document.getElementById('gstForm');
      var amountInput = document.getElementById('gstAmount');
      var rateInputs = document.querySelectorAll('input[name="gstRate"]');
      var customRateInput = document.getElementById('customGstRate');
      var modeInputs = document.querySelectorAll('input[name="gstMode"]');
      var gstResult = document.getElementById('gstResult');
      var gstError = document.getElementById('gstError');

      function getSelectedRate() {
        var selectedRadio = document.querySelector('input[name="gstRate"]:checked');
        if (selectedRadio) {
          if (selectedRadio.value === 'custom') {
            return parseFloat(customRateInput.value);
          }
          return parseFloat(selectedRadio.value);
        }
        return 18; // Default
      }

      function getSelectedMode() {
        var selectedMode = document.querySelector('input[name="gstMode"]:checked');
        return selectedMode ? selectedMode.value : 'exclusive';
      }

      // Handle custom rate toggle input enable/disable
      rateInputs.forEach(function (radio) {
        radio.addEventListener('change', function () {
          if (customRateInput) {
            customRateInput.disabled = (this.value !== 'custom');
            if (this.value === 'custom') {
              customRateInput.focus();
            }
          }
        });
      });

      if (gstForm) {
        gstForm.addEventListener('submit', function (e) {
          e.preventDefault();
          gstError.style.display = 'none';
          gstResult.style.display = 'none';

          var amt = parseFloat(amountInput.value);
          var rate = getSelectedRate();
          var mode = getSelectedMode();

          var res = calculateGST(amt, rate, mode);

          if (res.error) {
            gstError.textContent = res.error;
            gstError.style.display = 'block';
            return;
          }

          document.getElementById('resNet').textContent = res.baseAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          document.getElementById('resTax').textContent = res.gstAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          document.getElementById('resTotalGst').textContent = res.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          document.getElementById('resCgst').textContent = res.cgst.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          document.getElementById('resSgst').textContent = res.sgst.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          document.getElementById('resIgst').textContent = res.igst.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

          gstResult.style.display = 'block';
        });
      }
    });
  }

  return {
    calculateGST: calculateGST
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GSTCalculator;
}
