/**
 * Tool 3: Age Calculator
 * Accurate calculation of age in years, months, and days with leap-year awareness,
 * different month length handling, future-date rejection, and next birthday countdown.
 */

var AgeCalculator = (function () {
  'use strict';

  function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  function getDaysInMonth(year, month) {
    // month is 0-indexed (0 = Jan, 1 = Feb, etc.)
    var daysPerMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return daysPerMonth[month];
  }

  // Parse YYYY-MM-DD string into local date parts to prevent timezone offsets
  function parseDateString(str) {
    if (!str || typeof str !== 'string') return null;
    var parts = str.split('-');
    if (parts.length !== 3) return null;
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10) - 1; // 0-indexed
    var d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d) || m < 0 || m > 11 || d < 1 || d > 31) return null;
    return { year: y, month: m, day: d };
  }

  function calculateAge(dobInput, targetInput) {
    var dob = typeof dobInput === 'string' ? parseDateString(dobInput) : dobInput;
    var target;
    if (!targetInput) {
      var now = new Date();
      target = { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
    } else {
      target = typeof targetInput === 'string' ? parseDateString(targetInput) : targetInput;
    }

    if (!dob) {
      return { error: 'Please enter a valid date of birth.' };
    }
    if (!target) {
      return { error: 'Please enter a valid target calculation date.' };
    }

    // Check if target is before DOB
    if (
      target.year < dob.year ||
      (target.year === dob.year && target.month < dob.month) ||
      (target.year === dob.year && target.month === dob.month && target.day < dob.day)
    ) {
      return { error: 'Date of birth cannot be in the future relative to the comparison date.' };
    }

    var years = target.year - dob.year;
    var months = target.month - dob.month;
    var days = target.day - dob.day;

    if (days < 0) {
      // Borrow days from previous month
      var prevMonth = target.month === 0 ? 11 : target.month - 1;
      var prevYear = target.month === 0 ? target.year - 1 : target.year;
      days += getDaysInMonth(prevYear, prevMonth);
      months--;
    }

    if (months < 0) {
      months += 12;
      years--;
    }

    // Total days lived
    var dobDate = new Date(dob.year, dob.month, dob.day);
    var targetDate = new Date(target.year, target.month, target.day);
    var diffTime = targetDate.getTime() - dobDate.getTime();
    var totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    var totalWeeks = Math.floor(totalDays / 7);
    var totalMonths = (years * 12) + months;
    var totalHours = totalDays * 24;

    // Next birthday calculation
    var nextBdayYear = target.year;
    var bdayDay = dob.day;
    // Handle Feb 29 for non-leap year target
    if (dob.month === 1 && dob.day === 29 && !isLeapYear(nextBdayYear)) {
      bdayDay = 28;
    }

    var nextBdayDate = new Date(nextBdayYear, dob.month, bdayDay);
    if (nextBdayDate.getTime() < targetDate.getTime()) {
      nextBdayYear++;
      bdayDay = (dob.month === 1 && dob.day === 29 && !isLeapYear(nextBdayYear)) ? 28 : dob.day;
      nextBdayDate = new Date(nextBdayYear, dob.month, bdayDay);
    }

    var daysUntilNextBday = Math.round((nextBdayDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      years: years,
      months: months,
      days: days,
      totalDays: totalDays,
      totalWeeks: totalWeeks,
      totalMonths: totalMonths,
      totalHours: totalHours,
      daysUntilNextBday: daysUntilNextBday
    };
  }

  // DOM Event Binding
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      var dobEl = document.getElementById('dob');
      var targetDateEl = document.getElementById('targetDate');
      var ageForm = document.getElementById('ageForm');
      var resultContainer = document.getElementById('ageResult');
      var errorContainer = document.getElementById('ageError');

      // Set targetDate default to today's local date
      if (targetDateEl && !targetDateEl.value) {
        var today = new Date();
        var yyyy = today.getFullYear();
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var dd = String(today.getDate()).padStart(2, '0');
        targetDateEl.value = yyyy + '-' + mm + '-' + dd;
      }

      if (ageForm) {
        ageForm.addEventListener('submit', function (e) {
          e.preventDefault();
          errorContainer.style.display = 'none';
          resultContainer.style.display = 'none';

          var res = calculateAge(dobEl.value, targetDateEl.value);

          if (res.error) {
            errorContainer.textContent = res.error;
            errorContainer.style.display = 'block';
            return;
          }

          document.getElementById('resYears').textContent = res.years;
          document.getElementById('resMonths').textContent = res.months;
          document.getElementById('resDays').textContent = res.days;
          document.getElementById('resTotalDays').textContent = res.totalDays.toLocaleString();
          document.getElementById('resTotalWeeks').textContent = res.totalWeeks.toLocaleString();
          document.getElementById('resTotalMonths').textContent = res.totalMonths.toLocaleString();
          document.getElementById('resTotalHours').textContent = res.totalHours.toLocaleString();
          document.getElementById('resNextBday').textContent = res.daysUntilNextBday === 0 ? 'Today is your Birthday! 🎉' : res.daysUntilNextBday + ' days remaining';

          resultContainer.style.display = 'block';
        });
      }
    });
  }

  return {
    calculateAge: calculateAge,
    isLeapYear: isLeapYear,
    getDaysInMonth: getDaysInMonth
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AgeCalculator;
}
