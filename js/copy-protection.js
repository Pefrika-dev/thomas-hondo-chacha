/* ==========================================================================
   Copy / drag deterrent for public pages.
   Blocks casual right-click, selection, drag and Ctrl/Cmd copy shortcuts.
   Inputs, textareas, selects and contenteditable areas are untouched.
   ========================================================================== */
(function () {
  'use strict';

  if (document.body && document.body.getAttribute('data-page') === 'admin') return;
  if (/\/admin\.html$/.test(window.location.pathname)) return;

  var toast = null;
  var hideTimer = null;

  function notice() {
    if (window.Language && typeof window.Language.t === 'function') {
      return window.Language.t('protection.toast');
    }
    return 'This content is protected. Please ask Thomas for permission before reusing it.';
  }

  function showToast() {
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'copy-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = notice();
    toast.classList.add('is-visible');
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2400);
  }

  function isEditable(target) {
    var node = target;
    while (node && node.nodeType === 1) {
      var tag = node.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || node.isContentEditable) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  function block(event) {
    if (isEditable(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    showToast();
  }

  ['contextmenu', 'selectstart', 'copy', 'cut', 'dragstart'].forEach(function (type) {
    document.addEventListener(type, block, { passive: false });
  });

  document.addEventListener('keydown', function (event) {
    if (isEditable(event.target)) return;
    var key = String(event.key || '').toLowerCase();
    var mod = event.ctrlKey || event.metaKey;

    if (mod && ['a', 'c', 'x', 'u', 's'].indexOf(key) !== -1) {
      block(event);
      return;
    }
    if (key === 'f12' || (mod && event.shiftKey && ['i', 'j', 'c'].indexOf(key) !== -1)) {
      block(event);
    }
  }, { passive: false });
})();
