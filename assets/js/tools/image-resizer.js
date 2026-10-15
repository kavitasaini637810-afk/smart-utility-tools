/**
 * Tool 6: Image Resizer
 * Local browser canvas-based image resizing with aspect-ratio preservation,
 * dimension controls, format validation, and genuine Blob downloads.
 */

(function () {
  'use strict';

  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var resizeControls = document.getElementById('resizeControls');
  var originalPreview = document.getElementById('originalPreview');
  var originalMeta = document.getElementById('originalMeta');
  var widthInput = document.getElementById('resizeWidth');
  var heightInput = document.getElementById('resizeHeight');
  var lockAspectCheckbox = document.getElementById('lockAspect');
  var formatSelect = document.getElementById('outputFormat');
  var resizeBtn = document.getElementById('resizeBtn');
  var resizerResult = document.getElementById('resizerResult');
  var resizedPreview = document.getElementById('resizedPreview');
  var resizedMeta = document.getElementById('resizedMeta');
  var downloadBtn = document.getElementById('downloadResizedBtn');
  var errorAlert = document.getElementById('resizerError');

  var currentFile = null;
  var currentImage = null;
  var originalWidth = 0;
  var originalHeight = 0;
  var aspectRatio = 1;
  var resizedBlob = null;
  var resizedFilename = 'resized-image.png';

  if (!dropzone || !fileInput) return;

  function showError(msg) {
    if (errorAlert) {
      errorAlert.textContent = msg;
      errorAlert.style.display = 'block';
    }
  }

  function clearError() {
    if (errorAlert) {
      errorAlert.style.display = 'none';
      errorAlert.textContent = '';
    }
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
    var files = dt.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });

  fileInput.addEventListener('change', function () {
    if (fileInput.files.length > 0) {
      handleFile(fileInput.files[0]);
    }
  });

  function handleFile(file) {
    clearError();
    if (!file || !file.type.match(/^image\/(jpeg|png|webp|gif|svg\+xml)$/)) {
      showError('Please select a valid image file (JPEG, PNG, WebP, GIF, or SVG).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showError('Image file is larger than 25MB limit. Please select a smaller image.');
      return;
    }

    currentFile = file;

    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        currentImage = img;
        originalWidth = img.naturalWidth || img.width;
        originalHeight = img.naturalHeight || img.height;
        aspectRatio = originalWidth / originalHeight;

        if (originalPreview) originalPreview.src = e.target.result;
        if (originalMeta) {
          originalMeta.textContent = originalWidth + ' × ' + originalHeight + ' px (' + window.SmartTools.formatBytes(file.size) + ')';
        }

        if (widthInput) widthInput.value = originalWidth;
        if (heightInput) heightInput.value = originalHeight;

        if (resizeControls) resizeControls.style.display = 'block';
        if (resizerResult) resizerResult.style.display = 'none';
      };
      img.onerror = function () {
        showError('Could not decode the image. The file may be corrupted.');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Maintain aspect ratio during input
  if (widthInput && heightInput) {
    widthInput.addEventListener('input', function () {
      if (lockAspectCheckbox && lockAspectCheckbox.checked && aspectRatio > 0) {
        var w = parseFloat(widthInput.value);
        if (!isNaN(w) && w > 0) {
          heightInput.value = Math.round(w / aspectRatio);
        }
      }
    });

    heightInput.addEventListener('input', function () {
      if (lockAspectCheckbox && lockAspectCheckbox.checked && aspectRatio > 0) {
        var h = parseFloat(heightInput.value);
        if (!isNaN(h) && h > 0) {
          widthInput.value = Math.round(h * aspectRatio);
        }
      }
    });
  }

  // Resizing trigger
  if (resizeBtn) {
    resizeBtn.addEventListener('click', function () {
      clearError();
      if (!currentImage) {
        showError('Please upload an image first.');
        return;
      }

      var targetWidth = parseInt(widthInput.value, 10);
      var targetHeight = parseInt(heightInput.value, 10);

      if (isNaN(targetWidth) || targetWidth <= 0 || isNaN(targetHeight) || targetHeight <= 0) {
        showError('Please enter positive numbers for width and height.');
        return;
      }

      if (targetWidth > 8000 || targetHeight > 8000) {
        showError('Dimensions cannot exceed 8,000 pixels to prevent browser memory exhaustion.');
        return;
      }

      var canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      var ctx = canvas.getContext('2d');

      // High quality smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(currentImage, 0, 0, targetWidth, targetHeight);

      var format = formatSelect ? formatSelect.value : 'image/png';
      var ext = format === 'image/jpeg' ? '.jpg' : (format === 'image/webp' ? '.webp' : '.png');
      resizedFilename = (currentFile.name.replace(/\.[^/.]+$/, '') || 'resized') + '-resized' + ext;

      canvas.toBlob(function (blob) {
        if (!blob) {
          showError('Failed to generate resized image from canvas.');
          return;
        }

        resizedBlob = blob;
        var url = URL.createObjectURL(blob);

        if (resizedPreview) {
          resizedPreview.src = url;
        }

        if (resizedMeta) {
          resizedMeta.textContent = targetWidth + ' × ' + targetHeight + ' px (' + window.SmartTools.formatBytes(blob.size) + ')';
        }

        if (resizerResult) resizerResult.style.display = 'block';
      }, format, 0.92);
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', function () {
      if (resizedBlob && window.SmartTools && window.SmartTools.downloadBlob) {
        window.SmartTools.downloadBlob(resizedBlob, resizedFilename);
      }
    });
  }
})();
