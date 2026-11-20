/* ==========================================================================
   Website audit checker — client UI.
   Calls our own /api/audit route and never sends data to a third party.
   ========================================================================== */
(function () {
  'use strict';

  var form = document.getElementById('audit-form');
  if (!form) return;

  var input = document.getElementById('audit-url');
  var button = document.getElementById('audit-submit');
  var buttonLabel = document.getElementById('audit-button-label');
  var empty = document.getElementById('audit-empty');
  var loading = document.getElementById('audit-loading');
  var errorBox = document.getElementById('audit-error');
  var errorMessage = document.getElementById('audit-error-message');
  var results = document.getElementById('audit-results');
  var summary = document.getElementById('audit-summary');
  var checksBox = document.getElementById('audit-checks');
  var scoreNumber = document.getElementById('audit-score-number');
  var scoreLabel = document.getElementById('audit-score-label');
  var metaBox = document.getElementById('audit-meta');
  var ctaMessage = document.getElementById('audit-cta-message');
  var whatsapp = document.getElementById('audit-whatsapp');

  var lastResult = null;

  function T(path, values) {
    return window.Language && window.Language.t ? window.Language.t(path, values) : path;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text !== 'undefined' && text !== null) node.textContent = String(text);
    return node;
  }

  function setState(state) {
    var states = { empty: empty, loading: loading, error: errorBox, results: results };
    Object.keys(states).forEach(function (key) {
      if (states[key]) states[key].hidden = key !== state;
    });
  }

  function setBusy(busy) {
    if (!button) return;
    button.disabled = busy;
    button.setAttribute('aria-busy', busy ? 'true' : 'false');
    if (buttonLabel) {
      buttonLabel.textContent = busy ? T('auditPage.analyzing') : T('auditPage.analyze');
    }
  }

  function statusInfo(status) {
    if (status === 'pass') return { cls: 'pass', label: T('auditPage.status.pass'), badge: '\u2713' };
    if (status === 'warn') return { cls: 'warn', label: T('auditPage.status.warn'), badge: '!' };
    return { cls: 'fail', label: T('auditPage.status.fail'), badge: '\u00d7' };
  }

  function groupLabel(group) {
    var map = {
      'Security': 'auditPage.group.security',
      'Speed': 'auditPage.group.speed',
      'Google basics': 'auditPage.group.seo'
    };
    return map[group] ? T(map[group]) : group;
  }

  function renderCard(item) {
    var status = statusInfo(item.status);
    var card = el('article', 'audit-check audit-check--' + status.cls);

    var head = el('div', 'audit-check__head');
    var title = el('h4', 'audit-check__title');
    title.appendChild(el('span', 'audit-check__badge', status.badge));
    title.appendChild(el('span', '', item.label));
    head.appendChild(title);
    head.appendChild(el('span', 'audit-check__status', status.label));
    card.appendChild(head);

    card.appendChild(el('p', 'audit-check__group', groupLabel(item.group)));
    card.appendChild(el('p', '', item.detail));
    if (item.fix) card.appendChild(el('p', 'audit-check__fix', item.fix));
    return card;
  }

  function renderSummary(data) {
    if (scoreNumber) {
      scoreNumber.innerHTML = '';
      scoreNumber.appendChild(document.createTextNode(String(data.score)));
      scoreNumber.appendChild(el('span', '', '/100'));
    }
    if (scoreLabel) {
      scoreLabel.innerHTML = '';
      scoreLabel.appendChild(el('strong', '', data.overallLabel));
      scoreLabel.appendChild(el('small', '', T('auditPage.scannedDomain', { domain: data.domain })));
    }
    if (metaBox) {
      metaBox.innerHTML = '';
      metaBox.appendChild(el('span', 'audit-pill', data.domain));
      metaBox.appendChild(el('span', 'audit-pill',
        T('auditPage.responseTime', { ms: Number(data.responseTimeMs).toLocaleString() })));
      metaBox.appendChild(el('span', 'audit-pill',
        T('auditPage.checksPassed', { count: data.summary.passed, total: data.summary.total })));
    }
    if (summary) {
      summary.classList.remove('audit-score--good', 'audit-score--warn', 'audit-score--bad');
      var tone = data.score >= 80 ? 'good' : (data.score >= 50 ? 'warn' : 'bad');
      summary.classList.add('audit-score--' + tone);
    }
  }

  function whatsappLink(data) {
    var lines = [
      T('auditPage.waGreeting'),
      T('auditPage.waScore', { domain: data.domain, score: data.score })
    ];
    if (data.failedIssues && data.failedIssues.length) {
      lines.push(T('auditPage.waIssues') + ' ' + data.failedIssues.join(', ') + '.');
      lines.push(T('auditPage.waAskFix'));
    } else {
      lines.push(T('auditPage.waAskReview'));
    }
    return 'https://wa.me/254705023432?text=' + encodeURIComponent(lines.join('\n'));
  }

  function renderResult(data) {
    lastResult = data;
    renderSummary(data);

    if (checksBox) {
      checksBox.innerHTML = '';
      data.checks.forEach(function (item) { checksBox.appendChild(renderCard(item)); });
    }

    if (ctaMessage) {
      ctaMessage.textContent = data.failedIssues && data.failedIssues.length
        ? T('auditPage.ctaBodyWithIssues', { count: data.failedIssues.length })
        : T('auditPage.ctaBodyClear');
    }
    if (whatsapp) whatsapp.href = whatsappLink(data);

    setState('results');
  }

  function renderError(message) {
    lastResult = null;
    if (errorMessage) errorMessage.textContent = message || T('auditPage.errorFallback');
    setState('error');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var url = input ? input.value.trim() : '';
    if (!url) {
      renderError(T('auditPage.enterUrl'));
      if (input) input.focus();
      return;
    }

    if (!window.fetch) {
      renderError(T('auditPage.errorFallback'));
      return;
    }

    setState('loading');
    setBusy(true);
    if (window.thcTrack) {
      window.thcTrack('cta_click', { placement: 'audit-analyze' });
    }

    fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url, lang: window.Language ? window.Language.get() : 'en' })
    })
      .then(function (response) {
        return response.json().catch(function () {
          throw new Error(T('auditPage.errorFallback'));
        }).then(function (data) {
          if (!response.ok || !data.ok) throw new Error(data.error || T('auditPage.errorFallback'));
          return data;
        });
      })
      .then(renderResult)
      .catch(function (error) {
        renderError(error && error.message ? error.message : T('auditPage.errorFallback'));
      })
      .then(function () {
        setBusy(false);
      }, function () {
        setBusy(false);
      });
  });

  var resetButton = document.querySelector('[data-audit-reset]');
  if (resetButton) {
    resetButton.addEventListener('click', function () {
      setState('empty');
      if (input) input.focus();
    });
  }

  document.addEventListener('thc:languagechange', function () {
    setBusy(false);
    if (lastResult) {
      whatsapp.href = whatsappLink(lastResult);
      ctaMessage.textContent = lastResult.failedIssues && lastResult.failedIssues.length
        ? T('auditPage.ctaBodyWithIssues', { count: lastResult.failedIssues.length })
        : T('auditPage.ctaBodyClear');
      renderSummary(lastResult);
      if (checksBox) {
        checksBox.innerHTML = '';
        lastResult.checks.forEach(function (item) { checksBox.appendChild(renderCard(item)); });
      }
    }
  });

  setState('empty');
})();
