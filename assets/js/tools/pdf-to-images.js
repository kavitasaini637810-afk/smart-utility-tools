/**
 * Tool 10: PDF to Images Converter
 * Converts PDF pages into high-resolution PNG images using PDF.js and HTML5 Canvas.
 * Supports individual image downloads and batch ZIP archive creation with JSZip.
 */

(function () {
  'use strict';

  var dropzone = document.getElementById('pdfImgDropzone');
  var fileInput = document.getElementById('pdfImgFileInput');
  var controls = document.getElementById('pdfImgControls');
  var docMeta = document.getElementById('pdfImgDocMeta');
  var rangeInput = document.getElementById('pdfImgRangeInput');
  var scaleSelect = document.getElementById('pdfImgScale');
  var convertBtn = document.getElementById('pdfImgConvertBtn');
  var statusText = document.getElementById('pdfImgStatus');
  var progressBar = document.getElementById('pdfImgProgressBar');
  var progressContainer = document.getElementById('pdfImgProgressContainer');
  var errorAlert = document.getElementById('pdfImgError');
  var resultBox = document.getElementById('pdfImgResult');
  var imagesGrid = document.getElementById('pdfImagesGrid');
  var downloadZipBtn = document.getElementById('downloadAllZipBtn');

  var currentFile = null;
  var currentBuffer = null;
  var totalDocPages = 0;
  var renderedImages = []; // Array of { pageNum: number, blob: Blob, dataUrl: string, filename: string }

  if (!dropzone || !fileInput) return;

  function showError(msg) {
    if (errorAlert) {
      errorAlert.textContent = msg;
      errorAlert.style.display = 'block';
    }
  }

  function clearMessages() {
    if (errorAlert) errorAlert.style.display = 'none';
    if (statusText) statusText.textContent = '';
  }

  function getPdfJs() {
    if (typeof window.pdfjsLib !== 'undefined') return window.pdfjsLib;
    if (typeof pdfjsLib !== 'undefined') return pdfjsLib;
    return null;
  }

  function configurePdfWorker() {
    var lib = getPdfJs();
    if (!lib) return null;
    if (!lib.GlobalWorkerOptions.workerSrc) {
      var isSubDir = window.location.pathname.indexOf('/tools/') !== -1;
      lib.GlobalWorkerOptions.workerSrc = isSubDir ? '../assets/vendor/pdf.worker.min.js' : './assets/vendor/pdf.worker.min.js';
    }
    return lib;
  }

  // Parse ranges (same helper logic or reference)
  function parseRanges(str, max) {
    if (!str || str.trim() === '' || str.trim().toLowerCase() === 'all') {
      var all = [];
      for (var i = 1; i <= max; i++) all.push(i);
      return { pages: all };
    }
    var tokens = str.split(',');
    var pages = [];
    var seen = {};

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i].trim();
      if (!token) continue;
      if (token.indexOf('-') !== -1) {
        var parts = token.split('-');
        var s = parseInt(parts[0], 10);
        var e = parseInt(parts[1], 10);
        if (isNaN(s) || isNaN(e) || s < 1 || s > e || s > max || e > max) {
          return { error: 'Invalid range: "' + token + '" (Max: ' + max + ')' };
        }
        for (var p = s; p <= e; p++) {
          if (!seen[p]) { seen[p] = true; pages.push(p); }
        }
      } else {
        var num = parseInt(token, 10);
        if (isNaN(num) || num < 1 || num > max) {
          return { error: 'Invalid page number: "' + token + '" (Max: ' + max + ')' };
        }
        if (!seen[num]) { seen[num] = true; pages.push(num); }
      }
    }
    pages.sort(function (a, b) { return a - b; });
    return { pages: pages };
  }

  // Drag & Drop
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
    var pdfjs = configurePdfWorker();

    if (!pdfjs) {
      showError('PDF rendering engine (PDF.js) could not be loaded.');
      return;
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showError('Please upload a valid PDF document.');
      return;
    }

    try {
      var buffer = await file.arrayBuffer();
      var loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
      var pdfDoc = await loadingTask.promise;

      totalDocPages = pdfDoc.numPages;
      currentFile = file;
      currentBuffer = buffer;

      if (docMeta) {
        docMeta.textContent = file.name + ' (' + window.SmartTools.formatBytes(file.size) + ' • ' + totalDocPages + ' pages total)';
      }

      if (rangeInput) {
        rangeInput.value = '1-' + Math.min(totalDocPages, 5);
      }

      if (controls) controls.style.display = 'block';
      if (resultBox) resultBox.style.display = 'none';
    } catch (err) {
      console.error('PDF load error:', err);
      showError('Could not read PDF document: ' + (err.message || 'File may be corrupted or encrypted.'));
    }
  }

  if (convertBtn) {
    convertBtn.addEventListener('click', async function () {
      clearMessages();
      var pdfjs = configurePdfWorker();

      if (!pdfjs || !currentBuffer) {
        showError('Please select a PDF document first.');
        return;
      }

      var rangeResult = parseRanges(rangeInput.value, totalDocPages);
      if (rangeResult.error) {
        showError(rangeResult.error);
        return;
      }

      var pagesToRender = rangeResult.pages;
      if (pagesToRender.length === 0) {
        showError('No pages selected for conversion.');
        return;
      }

      try {
        convertBtn.disabled = true;
        if (progressContainer) progressContainer.style.display = 'block';
        if (progressBar) progressBar.style.width = '5%';
        if (imagesGrid) imagesGrid.innerHTML = '';
        renderedImages = [];

        var scale = parseFloat(scaleSelect ? scaleSelect.value : '1.5');
        var loadingTask = pdfjs.getDocument({ data: new Uint8Array(currentBuffer) });
        var pdfDoc = await loadingTask.promise;

        for (var i = 0; i < pagesToRender.length; i++) {
          var pageNum = pagesToRender[i];
          if (statusText) statusText.textContent = 'Rendering page ' + pageNum + ' (' + (i + 1) + ' of ' + pagesToRender.length + ')...';
          if (progressBar) progressBar.style.width = Math.round(((i + 1) / pagesToRender.length) * 90) + '%';

          var page = await pdfDoc.getPage(pageNum);
          var viewport = page.getViewport({ scale: scale });

          var canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          var ctx = canvas.getContext('2d');

          await page.render({
            canvasContext: ctx,
            viewport: viewport
          }).promise;

          // Convert canvas to blob
          var blob = await new Promise(function (resolve) {
            canvas.toBlob(resolve, 'image/png');
          });

          var dataUrl = canvas.toDataURL('image/png');
          var baseName = currentFile.name.replace(/\.[^/.]+$/, '');
          var filename = baseName + '-page-' + pageNum + '.png';

          renderedImages.push({
            pageNum: pageNum,
            blob: blob,
            dataUrl: dataUrl,
            filename: filename
          });

          // Render preview card into grid
          if (imagesGrid) {
            var card = document.createElement('div');
            card.className = 'preview-box';
            card.innerHTML =
              '<img src="' + dataUrl + '" alt="Page ' + pageNum + '">' +
              '<div class="preview-meta"><strong>Page ' + pageNum + '</strong> • ' + Math.round(viewport.width) + ' × ' + Math.round(viewport.height) + ' px (' + window.SmartTools.formatBytes(blob.size) + ')</div>' +
              '<div style="margin-top: 0.5rem;"><button type="button" class="btn btn-secondary btn-sm" data-img-idx="' + (renderedImages.length - 1) + '">Download PNG</button></div>';
            imagesGrid.appendChild(card);
          }
        }

        if (progressBar) progressBar.style.width = '100%';
        if (statusText) statusText.textContent = 'Finished converting ' + pagesToRender.length + ' pages!';
        setTimeout(function () {
          if (progressContainer) progressContainer.style.display = 'none';
        }, 600);

        // Bind single download buttons
        if (imagesGrid) {
          imagesGrid.querySelectorAll('button[data-img-idx]').forEach(function (btn) {
            btn.addEventListener('click', function () {
              var idx = parseInt(btn.getAttribute('data-img-idx'), 10);
              var item = renderedImages[idx];
              if (item && window.SmartTools && window.SmartTools.downloadBlob) {
                window.SmartTools.downloadBlob(item.blob, item.filename);
              }
            });
          });
        }

        if (resultBox) resultBox.style.display = 'block';
        convertBtn.disabled = false;
      } catch (err) {
        console.error('Render error:', err);
        showError('Rendering failed: ' + (err.message || 'Unknown canvas rendering error.'));
        convertBtn.disabled = false;
        if (progressContainer) progressContainer.style.display = 'none';
      }
    });
  }

  // ZIP download for multiple images
  if (downloadZipBtn) {
    downloadZipBtn.addEventListener('click', async function () {
      if (renderedImages.length === 0) return;

      var JSZip = typeof window.JSZip !== 'undefined' ? window.JSZip : (typeof JSZip !== 'undefined' ? JSZip : null);
      if (!JSZip) {
        showError('JSZip library is unavailable. Please download individual images instead.');
        return;
      }

      try {
        downloadZipBtn.disabled = true;
        downloadZipBtn.textContent = 'Creating ZIP file...';

        var zip = new JSZip();
        renderedImages.forEach(function (item) {
          zip.file(item.filename, item.blob);
        });

        var zipBlob = await zip.generateAsync({ type: 'blob' });
        var zipName = (currentFile ? currentFile.name.replace(/\.[^/.]+$/, '') : 'pdf-images') + '-images.zip';

        if (window.SmartTools && window.SmartTools.downloadBlob) {
          window.SmartTools.downloadBlob(zipBlob, zipName);
        }

        downloadZipBtn.disabled = false;
        downloadZipBtn.textContent = 'Download All as ZIP (.zip)';
      } catch (err) {
        showError('Failed to generate ZIP archive: ' + err.message);
        downloadZipBtn.disabled = false;
        downloadZipBtn.textContent = 'Download All as ZIP (.zip)';
      }
    });
  }
})();
