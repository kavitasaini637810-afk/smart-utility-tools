/**
 * Smart Utility Tools - Core Shared Site Script
 * Handles mobile navigation, accessible FAQs, dynamic tool searching & filtering,
 * safe client-side downloads, and configurable ad slots.
 */

(function () {
  'use strict';

  // Configurable AdSense Settings - Empty by default (Ad slots stay 100% hidden)
  window.ADSENSE_CONFIG = {
    client: '', // Set your Google AdSense Publisher ID here (e.g., 'ca-pub-XXXXXXXXXXXXXXXX')
    enabled: false
  };

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initFaqAccordion();
    initToolSearch();
    initCategoryFilter();
    initAdSlots();
  });

  /**
   * Accessible Mobile Navigation
   */
  function initNavigation() {
    var toggleBtn = document.querySelector('.nav-toggle');
    var navLinks = document.querySelector('.nav-links');

    if (!toggleBtn || !navLinks) return;

    toggleBtn.setAttribute('aria-expanded', 'false');

    toggleBtn.addEventListener('click', function () {
      var isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', !isExpanded);
      navLinks.classList.toggle('open');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (!toggleBtn.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /**
   * Accessible FAQ Accordion
   */
  function initFaqAccordion() {
    var faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var parentItem = btn.closest('.faq-item');
        if (!parentItem) return;

        var isOpen = parentItem.classList.contains('open');

        // Optional: close siblings if desired, or allow multiple open
        parentItem.classList.toggle('open');
        btn.setAttribute('aria-expanded', !isOpen);
      });
    });
  }

  /**
   * Real-time Tool Directory Search
   */
  function initToolSearch() {
    var searchInput = document.querySelector('.search-input');
    var toolCards = document.querySelectorAll('.tool-card');
    var noResultsMsg = document.getElementById('noSearchResults');

    if (!searchInput || toolCards.length === 0) return;

    searchInput.addEventListener('input', function () {
      var query = searchInput.value.trim().toLowerCase();
      var visibleCount = 0;

      toolCards.forEach(function (card) {
        var title = (card.querySelector('.tool-card-title') || {}).textContent || '';
        var desc = (card.querySelector('.tool-card-desc') || {}).textContent || '';
        var keywords = card.getAttribute('data-keywords') || '';
        var category = card.getAttribute('data-category') || '';

        var textContent = (title + ' ' + desc + ' ' + keywords + ' ' + category).toLowerCase();

        if (textContent.indexOf(query) !== -1) {
          card.style.display = '';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (noResultsMsg) {
        noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    });
  }

  /**
   * Category Filter Tabs
   */
  function initCategoryFilter() {
    var categoryTabs = document.querySelectorAll('.category-tab');
    var toolCards = document.querySelectorAll('.tool-card');

    if (categoryTabs.length === 0 || toolCards.length === 0) return;

    categoryTabs.forEach(function (tab) {
      tab.addEventListener('click', function (e) {
        // Only prevent default if it has data-filter attribute
        var filter = tab.getAttribute('data-filter');
        if (!filter) return;

        e.preventDefault();

        categoryTabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');

        var visibleCount = 0;
        toolCards.forEach(function (card) {
          var cardCategory = card.getAttribute('data-category');
          if (filter === 'all' || cardCategory === filter) {
            card.style.display = '';
            visibleCount++;
          } else {
            card.style.display = 'none';
          }
        });

        var noResultsMsg = document.getElementById('noSearchResults');
        if (noResultsMsg) {
          noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
        }
      });
    });
  }

  /**
   * Safe Ad Slots Initializer
   * Only renders and displays ad slots if client configuration is explicitly provided.
   */
  function initAdSlots() {
    if (!window.ADSENSE_CONFIG || !window.ADSENSE_CONFIG.enabled || !window.ADSENSE_CONFIG.client) {
      // Intentionally do nothing. Containers stay `display: none`.
      return;
    }

    var adContainers = document.querySelectorAll('.ad-slot-container');
    adContainers.forEach(function (container) {
      container.classList.add('active');
    });
  }

})();

/**
 * Universal Utility Helpers
 */
window.SmartTools = {
  /**
   * Formats raw bytes into human-readable string (KB, MB, GB)
   */
  formatBytes: function (bytes, decimals) {
    if (bytes === 0) return '0 Bytes';
    var k = 1024;
    var dm = decimals < 0 ? 0 : (decimals || 2);
    var sizes = ['Bytes', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  /**
   * Secure clipboard copy with UI feedback
   */
  copyToClipboard: function (text, btnElement, feedbackMsg) {
    if (!navigator.clipboard) {
      // Fallback for older environments
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand('copy');
        this.showButtonFeedback(btnElement, feedbackMsg || 'Copied!');
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
      document.body.removeChild(textarea);
      return;
    }

    var self = this;
    navigator.clipboard.writeText(text).then(function () {
      self.showButtonFeedback(btnElement, feedbackMsg || 'Copied!');
    }).catch(function (err) {
      console.error('Clipboard copy failed: ', err);
    });
  },

  showButtonFeedback: function (btn, message) {
    if (!btn) return;
    var originalText = btn.innerHTML;
    btn.innerHTML = '<span style="color: #16a34a; font-weight: bold;">✔ ' + (message || 'Copied!') + '</span>';
    btn.disabled = true;
    setTimeout(function () {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 2000);
  },

  /**
   * Safe browser-side download of a Blob
   */
  downloadBlob: function (blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }
};
