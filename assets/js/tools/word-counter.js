/**
 * Tool 1: Word and Character Counter
 * Comprehensive live text analysis with Unicode support, sentence/paragraph counts,
 * reading time estimation, copy, and clear functionality.
 */

(function () {
  'use strict';

  function analyzeText(text) {
    if (!text || text.trim() === '') {
      return {
        words: 0,
        charsWithSpaces: text ? Array.from(text).length : 0,
        charsNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: '0 sec'
      };
    }

    // Unicode-aware character array (handles astral symbols, emojis properly)
    var unicodeChars = Array.from(text);
    var charsWithSpaces = unicodeChars.length;
    var charsNoSpaces = unicodeChars.filter(function (ch) {
      return !/\s/.test(ch);
    }).length;

    // Word count (split by unicode whitespace sequences)
    var trimmed = text.trim();
    var wordsArray = trimmed.length > 0 ? trimmed.split(/\s+/).filter(Boolean) : [];
    var words = wordsArray.length;

    // Paragraph count (blocks separated by one or more newlines)
    var paragraphs = text
      .split(/\r?\n+/)
      .map(function (p) { return p.trim(); })
      .filter(function (p) { return p.length > 0; }).length;

    // Sentence count (matches terminating punctuation . ! ? followed by space/end)
    var sentenceMatches = trimmed.match(/[^.!?]+[.!?]+(\s|$)/g);
    var sentences = sentenceMatches ? sentenceMatches.length : (words > 0 ? 1 : 0);

    // Reading time (average 200 words per minute)
    var minutes = words / 200;
    var readingTimeStr;
    if (words === 0) {
      readingTimeStr = '0 sec';
    } else if (minutes < 1) {
      var sec = Math.ceil(minutes * 60);
      readingTimeStr = sec + ' sec';
    } else {
      var mins = Math.floor(minutes);
      var remSec = Math.round((minutes - mins) * 60);
      readingTimeStr = mins + ' min' + (remSec > 0 ? ' ' + remSec + ' sec' : '');
    }

    return {
      words: words,
      charsWithSpaces: charsWithSpaces,
      charsNoSpaces: charsNoSpaces,
      sentences: sentences,
      paragraphs: paragraphs,
      readingTime: readingTimeStr
    };
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      var textInput = document.getElementById('textInput');
      var wordCountEl = document.getElementById('wordCount');
      var charWithSpacesEl = document.getElementById('charWithSpaces');
      var charNoSpacesEl = document.getElementById('charNoSpaces');
      var sentenceCountEl = document.getElementById('sentenceCount');
      var paragraphCountEl = document.getElementById('paragraphCount');
      var readingTimeEl = document.getElementById('readingTime');
      var clearBtn = document.getElementById('clearBtn');
      var copyBtn = document.getElementById('copyBtn');

      if (!textInput) return;

      function updateStats() {
        var stats = analyzeText(textInput.value);
        if (wordCountEl) wordCountEl.textContent = stats.words.toLocaleString();
        if (charWithSpacesEl) charWithSpacesEl.textContent = stats.charsWithSpaces.toLocaleString();
        if (charNoSpacesEl) charNoSpacesEl.textContent = stats.charsNoSpaces.toLocaleString();
        if (sentenceCountEl) sentenceCountEl.textContent = stats.sentences.toLocaleString();
        if (paragraphCountEl) paragraphCountEl.textContent = stats.paragraphs.toLocaleString();
        if (readingTimeEl) readingTimeEl.textContent = stats.readingTime;
      }

      textInput.addEventListener('input', updateStats);

      if (clearBtn) {
        clearBtn.addEventListener('click', function () {
          textInput.value = '';
          updateStats();
          textInput.focus();
        });
      }

      if (copyBtn) {
        copyBtn.addEventListener('click', function () {
          if (!textInput.value) return;
          if (window.SmartTools && window.SmartTools.copyToClipboard) {
            window.SmartTools.copyToClipboard(textInput.value, copyBtn, 'Text Copied!');
          }
        });
      }

      // Initial calculation
      updateStats();
    });
  }

  // Export for testing
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { analyzeText: analyzeText };
  }
})();
