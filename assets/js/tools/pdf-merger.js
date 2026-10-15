/**
 * Tool 8: PDF Merger
 * Client-side PDF merging using PDF-Lib.
 * Allows file selection, reordering, deletion, page count inspection,
 * and local browser-based compilation into a single PDF document.
 */

(function () {
  'use strict';

  var dropzone = document.getElementById('pdfDropzone');
  var fileInput = document.getElementById('pdfFileInput');
  var fileListContainer = document.getElementById('pdfFileList');
  var mergeControls = document.getElementById('mergeControls');
  var mergeBtn = document.getElementById('mergeBtn');
  var mergeStatus = document.getElementById('mergeStatus');
  var progressBar = document.getElementById('mergeProgressBar');
  var progressContainer = document.getElementById('mergeProgressContainer');
  var errorAlert = document.getElementById('mergeError');
  var successAlert = document.getElementById('mergeSuccess');
  var downloadBtn = document.getElementById('downloadMergedPdfBtn');

  var pdfFiles = []; // Array of { file: File, arrayBuffer: ArrayBuffer, pageCount: number, id: string }
  var mergedPdfBlob = null;

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
    if (mergeStatus) mergeStatus.textContent = '';
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
      handleFiles(Array.from(dt.files));
    }
  });

  fileInput.addEventListener('change', function () {
    if (fileInput.files && fileInput.files.length > 0) {
      handleFiles(Array.from(fileInput.files));
      fileInput.value = ''; // reset so same files can be re-selected if desired
    }
  });

  async function handleFiles(files) {
    clearMessages();
    var pdfLib = getPdfLib();

    if (!pdfLib) {
      showError('PDF processing engine (pdf-lib) is still loading or could not be initialized.');
      return;
    }

    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        showError('Skipping "' + file.name + '": Only PDF documents are supported.');
        continue;
      }

      try {
        var buffer = await file.arrayBuffer();
        var doc = await pdfLib.PDFDocument.load(buffer, { ignoreEncryption: true });
        var pageCount = doc.getPageCount();

        pdfFiles.push({
          id: 'pdf_' + Math.random().toString(36).substring(2, 9),
          file: file,
          arrayBuffer: buffer,
          pageCount: pageCount
        });
      } catch (err) {
        showError('Could not read "' + file.name + '". It may be password protected or corrupted.');
      }
    }

    renderFileList();
  }

  function renderFileList() {
    if (!fileListContainer) return;
    fileListContainer.innerHTML = '';

    if (pdfFiles.length === 0) {
      if (mergeControls) mergeControls.style.display = 'none';
      return;
    }

    if (mergeControls) mergeControls.style.display = 'block';

    pdfFiles.forEach(function (item, index) {
      var li = document.createElement('li');
      li.className = 'file-item';

      li.innerHTML =
        '<div class="file-item-info">' +
          '<span class="badge badge-primary">' + (index + 1) + '</span>' +
          '<div>' +
            '<div class="file-item-name" title="' + item.file.name + '">' + item.file.name + '</div>' +
            '<div class="file-item-meta">' + window.SmartTools.formatBytes(item.file.size) + ' • ' + item.pageCount + ' page' + (item.pageCount === 1 ? '' : 's') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="file-item-actions">' +
          '<button type="button" class="btn-icon" data-action="up" data-index="' + index + '" title="Move Up" ' + (index === 0 ? 'disabled' : '') + '>▲</button>' +
          '<button type="button" class="btn-icon" data-action="down" data-index="' + index + '" title="Move Down" ' + (index === pdfFiles.length - 1 ? 'disabled' : '') + '>▼</button>' +
          '<button type="button" class="btn-icon" data-action="remove" data-index="' + index + '" title="Remove" style="color: #dc2626;">✖</button>' +
        '</div>';

      fileListContainer.appendChild(li);
    });

    // Bind action buttons
    fileListContainer.querySelectorAll('button[data-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = btn.getAttribute('data-action');
        var idx = parseInt(btn.getAttribute('data-index'), 10);

        if (action === 'remove') {
          pdfFiles.splice(idx, 1);
          renderFileList();
        } else if (action === 'up' && idx > 0) {
          var temp = pdfFiles[idx - 1];
          pdfFiles[idx - 1] = pdfFiles[idx];
          pdfFiles[idx] = temp;
          renderFileList();
        } else if (action === 'down' && idx < pdfFiles.length - 1) {
          var temp2 = pdfFiles[idx + 1];
          pdfFiles[idx + 1] = pdfFiles[idx];
          pdfFiles[idx] = temp2;
          renderFileList();
        }
      });
    });

    if (mergeBtn) {
      mergeBtn.disabled = pdfFiles.length < 2;
    }
  }

  if (mergeBtn) {
    mergeBtn.addEventListener('click', async function () {
      clearMessages();
      var pdfLib = getPdfLib();

      if (!pdfLib) {
        showError('PDF library is unavailable.');
        return;
      }

      if (pdfFiles.length < 2) {
        showError('Please add at least 2 PDF documents to merge.');
        return;
      }

      try {
        mergeBtn.disabled = true;
        if (progressContainer) progressContainer.style.display = 'block';
        if (progressBar) progressBar.style.width = '10%';
        if (mergeStatus) mergeStatus.textContent = 'Initializing merged document...';

        var mergedDoc = await pdfLib.PDFDocument.create();
        var totalInputFiles = pdfFiles.length;
        var totalPages = 0;

        for (var i = 0; i < totalInputFiles; i++) {
          if (mergeStatus) {
            mergeStatus.textContent = 'Merging document ' + (i + 1) + ' of ' + totalInputFiles + ' (' + pdfFiles[i].file.name + ')...';
          }
          if (progressBar) {
            progressBar.style.width = Math.round(((i + 1) / totalInputFiles) * 80) + '%';
          }

          var doc = await pdfLib.PDFDocument.load(pdfFiles[i].arrayBuffer, { ignoreEncryption: true });
          var pageIndices = doc.getPageIndices();
          totalPages += pageIndices.length;
          var copiedPages = await mergedDoc.copyPages(doc, pageIndices);
          copiedPages.forEach(function (p) {
            mergedDoc.addPage(p);
          });
        }

        if (mergeStatus) mergeStatus.textContent = 'Finalizing PDF output...';
        if (progressBar) progressBar.style.width = '95%';

        var mergedBytes = await mergedDoc.save();
        mergedPdfBlob = new Blob([mergedBytes], { type: 'application/pdf' });

        if (progressBar) progressBar.style.width = '100%';
        setTimeout(function () {
          if (progressContainer) progressContainer.style.display = 'none';
        }, 500);

        if (successAlert) {
          successAlert.innerHTML = '<strong>Success!</strong> Merged ' + totalInputFiles + ' documents (' + totalPages + ' pages total, ' + window.SmartTools.formatBytes(mergedPdfBlob.size) + ').';
          successAlert.style.display = 'block';
        }

        mergeBtn.disabled = false;
      } catch (err) {
        console.error('Merge error:', err);
        showError('Failed to merge PDFs: ' + (err.message || 'Unknown processing error'));
        mergeBtn.disabled = false;
        if (progressContainer) progressContainer.style.display = 'none';
      }
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', function () {
      if (mergedPdfBlob && window.SmartTools && window.SmartTools.downloadBlob) {
        window.SmartTools.downloadBlob(mergedPdfBlob, 'smart-utility-tools-merged.pdf');
      }
    });
  }
})();
