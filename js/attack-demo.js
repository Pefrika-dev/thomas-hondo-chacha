/* ==========================================================================
   Standalone clickjacking awareness page.

   Shows a real website inside a sandboxed frame with a clearly labelled
   overlay. The overlay click is captured locally for teaching purposes only:
   no form is submitted, no script is injected and no data is sent anywhere.
   ========================================================================== */
(function () {
  'use strict';

  var form = document.getElementById('demoSetup');
  var input = document.getElementById('demoUrl');
  var consent = document.getElementById('demoConsent');
  var errorBox = document.getElementById('demoError');
  var stage = document.getElementById('attackerStage');
  var frame = document.getElementById('demoFrame');
  var bait = document.getElementById('demoBait');
  var feedback = document.getElementById('demoFeedback');
  var stop = document.getElementById('demoStop');
  var label = document.getElementById('attackerStageLabel');
  var timer = document.getElementById('demoTimer');

  function normalise(value) {
    var raw = String(value || '').trim();
    if (!raw) return '';
    if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
    try {
      var url = new URL(raw);
      if (!/^https:$/.test(url.protocol) || url.username || url.password) return '';
      var host = url.hostname.toLowerCase();
      if (host === 'localhost' || host.endsWith('.localhost') ||
          host.endsWith('.local') || host.endsWith('.internal') ||
          /^(127|10|192\.168|169\.254|172\.(1[6-9]|2\d|3[01]))\./.test(host) ||
          /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
        return '';
      }
      return 'https://' + host + (url.pathname === '/' ? '/' : url.pathname);
    } catch (error) {
      return '';
    }
  }

  function startClock() {
    if (!timer) return;
    var remaining = 599;
    timer.textContent = '00:09:59';
    var id = setInterval(function () {
      remaining -= 1;
      if (remaining < 0) {
        clearInterval(id);
        timer.textContent = '00:00:00';
        return;
      }
      var minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
      var seconds = String(remaining % 60).padStart(2, '0');
      timer.textContent = '00:' + minutes + ':' + seconds;
    }, 1000);
  }

  var params = new URLSearchParams(window.location.search);
  if (input && params.get('url')) input.value = params.get('url');

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var url = normalise(input ? input.value : '');
      if (!url) {
        errorBox.textContent = 'Enter a valid public https website address.';
        return;
      }
      if (!consent.checked) {
        errorBox.textContent = 'Confirm that you have permission to demonstrate this website.';
        return;
      }
      errorBox.textContent = '';
      if (label) label.textContent = 'Live website underneath: ' + url.replace(/^https:\/\//, '');
      if (frame) frame.src = url;
      if (stage) stage.hidden = false;
      if (feedback) feedback.textContent = 'Nothing has been submitted.';
      if (form) form.hidden = true;
      startClock();
    });
  }

  if (bait) {
    bait.addEventListener('click', function (event) {
      event.preventDefault();
      var x = event.clientX;
      var y = event.clientY;
      if (feedback) {
        feedback.textContent = 'Overlay click captured at ' + x + ', ' + y +
          '. A real malicious page could place this button over a dangerous control on the site below.';
      }
    });
  }

  if (stop) {
    stop.addEventListener('click', function () {
      if (stage) stage.hidden = true;
      if (frame) frame.removeAttribute('src');
      if (form) form.hidden = false;
      if (feedback) feedback.textContent = 'Nothing has been submitted.';
    });
  }
})();
