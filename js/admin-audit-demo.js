/* ==========================================================================
   Admin-only clickjacking proof of concept.
   Shows a sandboxed frame of the last scanned domain only when that scan found
   a missing clickjacking header. Nothing is submitted or stored.
   ========================================================================== */
(function () {
  'use strict';

  var demo = document.getElementById('clickjackDemo');
  if (!demo) return;

  var checksBox = document.getElementById('audit-checks');
  var metaBox = document.getElementById('audit-meta');
  var consent = document.getElementById('auditDemoConsent');
  var frame = document.getElementById('auditDemoFrame');
  var frameWrap = document.getElementById('auditDemoFrameWrap');
  var protectedBox = document.getElementById('auditDemoProtected');
  var note = document.getElementById('auditDemoNote');
  var feedback = document.getElementById('auditDemoFeedback');
  var vulnerableBtn = document.getElementById('auditDemoVulnerable');
  var protectedBtn = document.getElementById('auditDemoProtectedBtn');
  var restoreBtn = document.getElementById('auditDemoRestore');
  var clickBtn = document.getElementById('auditDemoClick');

  var domain = '';
  var mode = 'vulnerable';

  function buttons() {
    return [vulnerableBtn, protectedBtn, restoreBtn].filter(Boolean);
  }

  function setEnabled(on) {
    buttons().forEach(function (button) { button.disabled = !on; });
  }

  function say(message) {
    if (feedback) feedback.textContent = message;
  }

  function validDomain(value) {
    return /^(?=.{4,253}$)(?!-)[a-z0-9.-]+\.[a-z]{2,}$/i.test(value) &&
      !/localhost|127\.|192\.168|10\.|169\.254/i.test(value);
  }

  function currentDomain() {
    var pills = metaBox ? metaBox.querySelectorAll('.audit-pill') : [];
    return pills.length ? pills[0].textContent.trim() : '';
  }

  function loadFrame() {
    if (consent && consent.checked && domain && frame) {
      frame.src = 'https://' + domain;
    }
  }

  function applyMode(next) {
    mode = next;
    var showProtected = next === 'protected';
    if (protectedBox) protectedBox.hidden = !showProtected;
    if (frameWrap) frameWrap.hidden = showProtected;
    if (vulnerableBtn) vulnerableBtn.classList.toggle('is-active', !showProtected);
    if (protectedBtn) protectedBtn.classList.toggle('is-active', showProtected);
  }

  function refresh() {
    var xfoCard = document.getElementById('audit-issue-xfo');
    var vulnerable = xfoCard && (xfoCard.classList.contains('audit-check--fail') ||
      xfoCard.classList.contains('audit-check--warn'));
    var nextDomain = currentDomain();

    if (!vulnerable || !validDomain(nextDomain)) {
      demo.hidden = true;
      domain = '';
      if (frame) frame.removeAttribute('src');
      return;
    }

    if (nextDomain !== domain) {
      domain = nextDomain;
      if (frame) frame.removeAttribute('src');
      if (note) note.textContent = domain + ' is missing clickjacking protection. This frame shows what another page could do.';
      loadFrame();
    }

    demo.hidden = false;
    setEnabled(Boolean(consent && consent.checked));
    applyMode(mode);
  }

  if (consent) {
    consent.addEventListener('change', function () {
      setEnabled(consent.checked);
      if (consent.checked) {
        loadFrame();
        say('Sandbox is on: scripts and forms are blocked; nothing is submitted.');
      } else {
        if (frame) frame.removeAttribute('src');
        say('Consent removed. Live preview unloaded.');
      }
    });
  }

  if (vulnerableBtn) {
    vulnerableBtn.addEventListener('click', function () {
      applyMode('vulnerable');
      loadFrame();
      say('Vulnerable view restored.');
    });
  }

  if (protectedBtn) {
    protectedBtn.addEventListener('click', function () {
      applyMode('protected');
      say('This is the fixed state: the frame would be blocked by the security header.');
    });
  }

  if (restoreBtn) {
    restoreBtn.addEventListener('click', function () {
      applyMode('vulnerable');
      if (frame) frame.removeAttribute('src');
      loadFrame();
      say('Live view reloaded from ' + domain + '.');
    });
  }

  if (clickBtn) {
    clickBtn.addEventListener('click', function (event) {
      event.preventDefault();
      say('Demo only — no form was submitted and no message was sent.');
    });
  }

  if (checksBox && window.MutationObserver) {
    new MutationObserver(refresh).observe(checksBox, { childList: true, subtree: true });
  }
  document.addEventListener('thc:languagechange', refresh);
  refresh();
})();
