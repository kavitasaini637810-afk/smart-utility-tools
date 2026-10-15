/**
 * Tool 7: Image Compressor
 * Client-side lossy/lossless image compression using HTML5 Canvas toBlob.
 * Accurate byte difference, compression percentage, WebP & JPEG support detection,
 * and honest reporting when output does not reduce file size.
 */

(function () {
  'use strict';

  var dropzone = document.getElementById('compressDropzone');
  var fileInput = document.getElementById('compressFileInput');
  var controls = document.getElementById('compressControls');
  var qualitySlider = document.getElementById('qualitySlider');
  var qualityValue = document.getElementById('qualityValue');
  var formatSelect = document.getElementById('compressFormat');
  var compressBtn = document.getElementById('compressBtn');
  var resultBox = document.getElementById('compressResult');
  var origPreview = document.getElementById('compressOrigPreview');
  var origMeta = document.getElementById('compressOrigMeta');
  var compPreview = document.getElementById('compressCompPreview');
  var compMeta = document.getElementById('compressCompMeta');
  var savingsAlert = document.getElementById('compressSavings');
  var downloadBtn = document.getElementById('downloadCompressedBtn');
  var errorAlert = document.getElementById('compressError');

  var currentFile = null;
  var currentImage = null;
  var compressedBlob = null;
  var compressedFilename = 'compressed-image.jpg';

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

  // Check WebP canvas export support
  function isWebPSupported() {
    var c = document.createElement('canvas');
    c.width = 1;
    c.height = 1;
    return c.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  // Update slider label
  if (qualitySlider && qualityValue) {
    qualitySlider.addEventListener('input', function () {
      qualityValue.textContent = qualitySlider.value + '%';
    });
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
    if (dt.files.length > 0) {
      handleFile(dt.files[0]);
    }
  });

  fileInput.addEventListener('change', function () {
    if (fileInput.files.length > 0) {
      handleFile(fileInput.files[0]);
    }
  });

  function handleFile(file) {
    clearError();
    if (!file || !file.type.match(/^image\/(jpeg|png|webp|bmp)$/)) {
      showError('Please select a valid image file (JPEG, PNG, WebP, or BMP).');
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      showError('Image file is larger than 30MB limit. Please select a smaller file.');
      return;
    }

    currentFile = file;

    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        currentImage = img;
        if (origPreview) origPreview.src = e.target.result;
        if (origMeta) {
          origMeta.textContent = (img.naturalWidth || img.width) + ' × ' + (img.naturalHeight || img.height) + ' px | ' + window.SmartTools.formatBytes(file.size);
        }

        if (controls) controls.style.display = 'block';
        if (resultBox) resultBox.style.display = 'none';
      };
      img.onerror = function () {
        showError('Could not decode the image file.');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  if (compressBtn) {
    compressBtn.addEventListener('click', function () {
      clearError();
      if (!currentImage || !currentFile) {
        showError('Please select an image first.');
        return;
      }

      var quality = parseInt(qualitySlider ? qualitySlider.value : '75', 10) / 100;
      var format = formatSelect ? formatSelect.value : 'image/jpeg';

      if (format === 'image/webp' && !isWebPSupported()) {
        showError('WebP export is not supported in this browser. Defaulting to JPEG.');
        format = 'image/jpeg';
      }

      var width = currentImage.naturalWidth || currentImage.width;
      var height = currentImage.naturalHeight || currentImage.height;

      var canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext('2d');

      // For JPEG, fill transparent background with white
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(currentImage, 0, 0, width, height);

      canvas.toBlob(function (blob) {
        if (!blob) {
          showError('Browser failed to encode compressed image.');
          return;
        }

        compressedBlob = blob;
        var ext = format === 'image/webp' ? '.webp' : '.jpg';
        compressedFilename = (currentFile.name.replace(/\.[^/.]+$/, '') || 'image') + '-compressed' + ext;

        if (compPreview) {
          compPreview.src = URL.createObjectURL(blob);
        }

        if (compMeta) {
          compMeta.textContent = width + ' × ' + height + ' px | ' + window.SmartTools.formatBytes(blob.size);
        }

        var origBytes = currentFile.size;
        var compBytes = blob.size;
        var diff = origBytes - compBytes;
        var percent = ((diff / origBytes) * 100).toFixed(1);

        if (savingsAlert) {
          if (diff > 0) {
            savingsAlert.className = 'alert alert-success';
            savingsAlert.innerHTML = '<strong>Successfully compressed!</strong> Reduced by ' + percent + '% (Saved ' + window.SmartTools.formatBytes(diff) + ')';
          } else if (diff === 0) {
            savingsAlert.className = 'alert alert-info';
            savingsAlert.textContent = 'The file size remained unchanged. The original was already well-optimized for this quality setting.';
          } else {
            var increasePercent = (Math.abs(diff) / origBytes * 100).toFixed(1);
            savingsAlert.className = 'alert alert-warning';
            savingsAlert.innerHTML = '<strong>File size increased by ' + increasePercent + '% (' + window.SmartTools.formatBytes(Math.abs(diff)) + ').</strong> The original image is already heavily compressed. Try choosing a lower quality percentage or converting to WebP.';
          }
        }

        if (resultBox) resultBox.style.display = 'block';
      }, format, quality);
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', function () {
      if (compressedBlob && window.SmartTools && window.SmartTools.downloadBlob) {
        window.SmartTools.downloadBlob(compressedBlob, compressedFilename);
      }
    });
  }
})();
