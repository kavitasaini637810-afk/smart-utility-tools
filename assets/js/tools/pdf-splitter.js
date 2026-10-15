/**
 * Tool 9: PDF Splitter
 * Extracts specific pages and ranges (e.g., "1-3, 5, 8-10") from a PDF document
 * using local browser-based PDFLib processing with range validation.
 */

var PDFSplitter = (function () {
  'use strict';

  function parsePageRanges(rangeStr, maxPages) {
    if (!rangeStr || typeof rangeStr !== 'string' || rangeStr.trim() === '') {
      return { error: 'Please enter at least one page number or range (e.g., 1-3, 5).' };
    }

    var tokens = rangeStr.split(',');
    var selectedPages = [];
    var seen = {};

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i].trim();
      if (!token) continue;

      if (token.indexOf('-') !== -1) {
        var parts = token.split('-');
        if (parts.length !== 2) {
          return { error: 'Invalid range format: "' + token + '". Use format like "1-5".' };
        }

        var start = parseInt(parts[0].trim(), 10);
        var end = parseInt(parts[1].trim(), 10);

        if (isNaN(start) || isNaN(end)) {
          return { error: 'Invalid numbers in range: "' + token + '".' };
        }

        if (start < 1) {
          return { error: 'Page numbers must be 1 or greater. Found: ' + start };
        }

        if (start > end) {
          return { error: 'Invalid range "' + token + '": Start page (' + start + ') cannot be greater than end page (' + end + ').' };
        }

        if (maxPages && (start > maxPages || end > maxPages)) {
          return { error: 'Range "' + token + '" exceeds document length (' + maxPages + ' pages).' };
        }

        for (var p = start; p <= end; p++) {
          if (!seen[p]) {
            seen[p] = true;
            selectedPages.push(p);
          }
        }
      } else {
        var single = parseInt(token, 10);
        if (isNaN(single)) {
          return { error: 'Invalid page number: "' + token + '".' };
        }

        if (single < 1) {
          return { error: 'Page numbers must be 1 or greater. Found: ' + single };
        }

        if (maxPages && single > maxPages) {
          return { error: 'Page ' + single + ' exceeds document length (' + maxPages + ' pages).' };
        }

        if (!seen[single]) {
          seen[single] = true;
          selectedPages.push(single);
        }
      }
    }

    if (selectedPages.length === 0) {
      return { error: 'No valid pages selected.' };
    }

    // Sort in ascending order
    selectedPages.sort(function (a, b) { return a - b; });

    return {
      pages: selectedPages, // 1-based
      indices: selectedPages.map(function (p) { return p - 1; }) // 0-based for PDF-Lib
    };
  }

  // DOM Event Binding
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      var dropzone = document.getElementById('splitDropzone');
      var fileInput = document.getElementById('splitFileInput');
      var controls = document.getElementById('splitControls');
      var docMeta = document.getElementById('splitDocMeta');
      var rangeInput = document.getElementById('pageRangeInput');
      var splitBtn = document.getElementById('splitBtn');
      var errorAlert = document.getElementById('splitError');
      var successAlert = document.getElementById('splitSuccess');
      var downloadBtn = document.getElementById('downloadSplitPdfBtn');

      var currentFile = null;
      var currentBuffer = null;
      var totalPages = 0;
      var splitPdfBlob = null;

      if (!dropzone || !fileInput) return;

      function showError(msg) {
        if (errorAlert) {
          errorAlert.textContent = msg;
          errorAlert.style.display = 'block';
        }
      }

      function clearMessages() {
        if (errorAlert) errorAlert.style.display = 'none';
        if (successAlert) successAlert.style.display = 'none';
      }

      function getPdfLib() {
        if (typeof PDFLib !== 'undefined') return PDFLib;
        if (typeof window.PDFLib !== 'undefined') return window.PDFLib;
        return null;
      }

      // Drag and drop handlers
      ['dragenter', 'dragover'].forEach(function (eventName) {
        dropzone.addEventListener(eventName, function (e) {
          e.preventDefault();
          dropzone.classList.add('drag-active');
        }, false);
      });

      ['dragleave', 'drop'].forEach(function (eventName) {
        dropzone.addEventListener(eventName, function (e) {
          e.preventDefault();
          dropzone.classList.remove('drag-active');
        }, false);
      });

      dropzone.addEventListener('drop', function (e) {
        var dt = e.dataTransfer;
        if (dt.files && dt.files.length > 0) {
          handleFile(dt.files[0]);
        }
      });

      fileInput.addEventListener('change', function () {
        if (fileInput.files && fileInput.files.length > 0) {
          handleFile(fileInput.files[0]);
        }
      });

      async function handleFile(file) {
        clearMessages();
        var pdfLib = getPdfLib();

        if (!pdfLib) {
          showError('PDF library is not loaded.');
          return;
        }

        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
          showError('Please upload a valid PDF document.');
          return;
        }

        try {
          var buffer = await file.arrayBuffer();
          var doc = await pdfLib.PDFDocument.load(buffer, { ignoreEncryption: true });
          totalPages = doc.getPageCount();
          currentFile = file;
          currentBuffer = buffer;

          if (docMeta) {
            docMeta.textContent = file.name + ' (' + window.SmartTools.formatBytes(file.size) + ' • ' + totalPages + ' pages total)';
          }

          if (rangeInput) {
            rangeInput.value = totalPages > 1 ? '1-' + Math.min(totalPages, 3) : '1';
          }

          if (controls) controls.style.display = 'block';
        } catch (err) {
          showError('Could not read PDF: ' + (err.message || 'The file may be encrypted or corrupted.'));
        }
      }

      if (splitBtn) {
        splitBtn.addEventListener('click', async function () {
          clearMessages();
          var pdfLib = getPdfLib();

          if (!pdfLib || !currentBuffer) {
            showError('Please upload a PDF document first.');
            return;
          }

          var rangeResult = parsePageRanges(rangeInput.value, totalPages);
          if (rangeResult.error) {
            showError(rangeResult.error);
            return;
          }

          try {
            splitBtn.disabled = true;
            splitBtn.textContent = 'Extracting pages...';

            var srcDoc = await pdfLib.PDFDocument.load(currentBuffer, { ignoreEncryption: true });
            var newDoc = await pdfLib.PDFDocument.create();

            var copiedPages = await newDoc.copyPages(srcDoc, rangeResult.indices);
            copiedPages.forEach(function (page) {
              newDoc.addPage(page);
            });

            var newPdfBytes = await newDoc.save();
            splitPdfBlob = new Blob([newPdfBytes], { type: 'application/pdf' });

            if (successAlert) {
              successAlert.innerHTML = '<strong>Success!</strong> Extracted ' + rangeResult.pages.length + ' page(s) [' + rangeResult.pages.join(', ') + '] (' + window.SmartTools.formatBytes(splitPdfBlob.size) + ').';
              successAlert.style.display = 'block';
            }

            splitBtn.disabled = false;
            splitBtn.textContent = 'Extract Selected Pages';
          } catch (err) {
            console.error('Split error:', err);
            showError('Failed to extract pages: ' + (err.message || 'Unknown error'));
            splitBtn.disabled = false;
            splitBtn.textContent = 'Extract Selected Pages';
          }
        });
      }

      if (downloadBtn) {
        downloadBtn.addEventListener('click', function () {
          if (splitPdfBlob && window.SmartTools && window.SmartTools.downloadBlob) {
            var filename = (currentFile ? currentFile.name.replace(/\.[^/.]+$/, '') : 'document') + '-extracted.pdf';
            window.SmartTools.downloadBlob(splitPdfBlob, filename);
          }
        });
      }
    });
  }

  return {
    parsePageRanges: parsePageRanges
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PDFSplitter;
}

