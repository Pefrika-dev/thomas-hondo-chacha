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
  var roadmapBox = document.getElementById('audit-roadmap');
  var printButton = document.querySelector('[data-audit-print]');

  var lastResult = null;

  var PRIORITY = {
    ssl: 'critical',
    speed: 'high',
    hsts: 'high',
    xfo: 'medium',
    xcto: 'medium',
    csp: 'medium',
    title: 'medium',
    description: 'low',
    viewport: 'high'
  };
  var PRIORITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 };

  function T(path, values) {
    return window.Language && window.Language.t ? window.Language.t(path, values) : path;
  }

  function RAW(path) {
    return window.Language && window.Language.raw ? window.Language.raw(path) : undefined;
  }

  function priorityFor(item) {
    if (item.id === 'speed' && item.status === 'warn') return 'medium';
    return PRIORITY[item.id] || 'medium';
  }

  function lostPoints(item) {
    return Math.max(0, Number(item.maxPoints || 0) - Number(item.points || 0));
  }

  function guideFor(item) {
    var base = 'auditPage.guide.' + item.id;
    var steps = RAW(base + '.steps');
    return {
      why: T(base + '.why'),
      steps: Array.isArray(steps) ? steps : [],
      where: T(base + '.where'),
      verify: T(base + '.verify')
    };
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
    card.id = 'audit-issue-' + item.id;

    var head = el('div', 'audit-check__head');
    var title = el('h4', 'audit-check__title');
    title.appendChild(el('span', 'audit-check__badge', status.badge));
    title.appendChild(el('span', '', item.label));
    head.appendChild(title);

    var tags = el('div', 'audit-check__tags');
    if (item.status !== 'pass') {
      var priority = priorityFor(item);
      tags.appendChild(el('span', 'audit-check__priority audit-check__priority--' + priority,
        T('auditPage.priority.' + priority)));
      tags.appendChild(el('span', 'audit-check__points',
        T('auditPage.pointsLost', { count: lostPoints(item) })));
    }
    tags.appendChild(el('span', 'audit-check__status', status.label));
    head.appendChild(tags);
    card.appendChild(head);

    card.appendChild(el('p', 'audit-check__group', groupLabel(item.group)));
    card.appendChild(el('p', '', item.detail));
    if (item.fix) card.appendChild(el('p', 'audit-check__fix', item.fix));

    if (item.status !== 'pass') {
      var guide = guideFor(item);
      var block = el('div', 'audit-fix');
      block.appendChild(el('h5', 'audit-fix__title', T('auditPage.howToFix')));

      block.appendChild(el('p', 'audit-fix__label', T('auditPage.whyItMatters')));
      block.appendChild(el('p', 'audit-fix__body', guide.why));

      block.appendChild(el('p', 'audit-fix__label', T('auditPage.stepsTitle')));
      if (guide.steps.length) {
        var stepList = el('ol', 'audit-fix__steps');
        guide.steps.forEach(function (step) { stepList.appendChild(el('li', '', step)); });
        block.appendChild(stepList);
      }

      var details = el('details', 'audit-fix__details');
      details.appendChild(el('summary', '', T('auditPage.whereTitle')));
      details.appendChild(el('p', '', guide.where));
      block.appendChild(details);

      block.appendChild(el('p', 'audit-fix__label', T('auditPage.verifyTitle')));
      block.appendChild(el('p', 'audit-fix__body', guide.verify));
      card.appendChild(block);
    }

    return card;
  }

  function renderRoadmap(data) {
    if (!roadmapBox) return;
    roadmapBox.innerHTML = '';

    var head = el('div', 'audit-roadmap__head');
    head.appendChild(el('h3', 'audit-roadmap__title', T('auditPage.roadmapTitle')));
    head.appendChild(el('p', 'audit-roadmap__hint', T('auditPage.roadmapHint')));
    roadmapBox.appendChild(head);

    var issues = data.checks.filter(function (item) { return item.status !== 'pass'; });
    issues.sort(function (a, b) {
      var rank = PRIORITY_RANK[priorityFor(a)] - PRIORITY_RANK[priorityFor(b)];
      if (rank !== 0) return rank;
      return lostPoints(b) - lostPoints(a);
    });

    if (!issues.length) {
      roadmapBox.appendChild(el('p', 'audit-roadmap__clear', T('auditPage.roadmapClear')));
      return;
    }

    var list = el('ol', 'audit-roadmap__list');
    issues.forEach(function (item, index) {
      var priority = priorityFor(item);
      var itemNode = el('li', 'audit-roadmap__item audit-roadmap__item--' + priority);
      var link = el('a', 'audit-roadmap__link');
      link.href = '#audit-issue-' + item.id;
      link.appendChild(el('span', 'audit-roadmap__index', String(index + 1)));
      link.appendChild(el('span', 'audit-roadmap__name', item.label));

      var tags = el('span', 'audit-roadmap__tags');
      tags.appendChild(el('span', 'audit-roadmap__priority audit-roadmap__priority--' + priority,
        T('auditPage.priority.' + priority)));
      tags.appendChild(el('span', 'audit-roadmap__points',
        T('auditPage.pointsLost', { count: lostPoints(item) })));
      link.appendChild(tags);

      itemNode.appendChild(link);
      list.appendChild(itemNode);
    });
    roadmapBox.appendChild(list);
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
      var checked = data.checkedAt ? new Date(data.checkedAt) : null;
      if (checked && !isNaN(checked.getTime())) {
        metaBox.appendChild(el('span', 'audit-pill',
          T('auditPage.checkedAt', { date: checked.toLocaleString() })));
      }
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
    renderRoadmap(data);

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
      renderRoadmap(lastResult);
      if (checksBox) {
        checksBox.innerHTML = '';
        lastResult.checks.forEach(function (item) { checksBox.appendChild(renderCard(item)); });
      }
    }
  });

  setState('empty');
})();
