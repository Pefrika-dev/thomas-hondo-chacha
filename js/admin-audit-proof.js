/* ==========================================================================
   Admin-only live proof for every audit issue + immediate client capture.
   Uses the real audit result already shown on screen. No data is changed on
   the scanned website; the framed preview is sandboxed.
   ========================================================================== */
(function () {
  'use strict';

  var card = document.getElementById('auditLive');
  if (!card) return;

  var context = document.getElementById('auditLiveContext');
  var scoreBox = document.getElementById('auditLiveScore');
  var evidenceBox = document.getElementById('auditLiveEvidence');
  var preview = document.getElementById('auditLivePreview');
  var previewTitle = document.getElementById('auditLivePreviewTitle');
  var previewNote = document.getElementById('auditLivePreviewNote');
  var frame = document.getElementById('auditLiveFrame');
  var frameWrap = document.getElementById('auditLiveFrameWrap');
  var overlay = document.getElementById('auditLiveOverlay');
  var closePreview = document.getElementById('auditLivePreviewClose');
  var form = document.getElementById('auditLeadForm');
  var nameInput = document.getElementById('leadName');
  var phoneInput = document.getElementById('leadPhone');
  var emailInput = document.getElementById('leadEmail');
  var contactInput = document.getElementById('leadContact');
  var packageInput = document.getElementById('leadPackage');
  var consentInput = document.getElementById('leadConsent');
  var proposalLink = document.getElementById('auditProposalLink');
  var saveBtn = document.getElementById('leadSaveBtn');
  var feedback = document.getElementById('leadFeedback');

  var data = null;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function issues() {
    if (!data || !data.checks) return [];
    return data.checks.filter(function (item) { return item.status !== 'pass'; });
  }

  function labelForContact(value) {
    if (value === 'phone') return 'phone';
    if (value === 'email') return 'email';
    return 'WhatsApp';
  }

  function buildDescription() {
    var lines = [
      'Live website audit captured in admin.',
      'Website: ' + (data.domain || 'n/a'),
      'Final URL: ' + (data.finalUrl || 'n/a'),
      'Score: ' + data.score + '/100 (' + data.overallLabel + ')',
      'Suggested package: ' + (packageInput ? packageInput.value : 'business'),
      'Checked at: ' + (data.checkedAt || 'n/a')
    ];
    issues().forEach(function (item) {
      lines.push('- ' + item.label + ': ' + (item.evidence || item.detail));
    });
    return lines.join('\n').slice(0, 3900);
  }

  function showPreview(item) {
    if (!preview) return;
    preview.hidden = false;
    frameWrap.classList.remove('audit-live__frameWrap--mobile');
    overlay.hidden = false;
    overlay.innerHTML = '';
    frame.src = data.finalUrl || ('https://' + data.domain);

    if (item.id === 'xfo') {
      overlay.appendChild(el('span', 'audit-live__overlayTag', 'Hidden overlay — proof of concept'));
      var bait = el('button', 'audit-live__bait', 'Claim free gift');
      bait.type = 'button';
      bait.tabIndex = -1;
      bait.addEventListener('click', function (event) {
        event.preventDefault();
        previewNote.textContent = 'Demo only — that click was not sent to the website.';
      });
      overlay.appendChild(bait);
      previewTitle.textContent = 'Live site framed by another page';
      previewNote.textContent = 'The real site is inside the frame. The red button sits on top; in a real clickjacking attack a click here would reach the site. Nothing is submitted in this protected proof.';
      return;
    }

    if (item.id === 'viewport') {
      frameWrap.classList.add('audit-live__frameWrap--mobile');
      overlay.appendChild(el('span', 'audit-live__overlayTag', '360px phone width'));
      previewTitle.textContent = 'Live mobile view — no viewport tag';
      previewNote.textContent = 'This is the live page at phone width. Without a viewport tag, phones shrink the desktop layout and visitors have to pinch and zoom.';
      return;
    }

    overlay.appendChild(el('strong', '', item.label));
    overlay.appendChild(el('span', '', item.evidence || item.detail));
    previewTitle.textContent = item.label + ' — live proof';
    previewNote.textContent = item.id === 'speed'
      ? 'This is the measured response of the real homepage, not an estimate.'
      : 'This is the real value returned by the live scan above.';
  }

  function render() {
    if (!data || !data.checks) {
      card.hidden = true;
      return;
    }

    var found = issues();
    card.hidden = false;
    var attackLink = document.getElementById('auditOpenAttack');
    if (attackLink) {
      attackLink.href = 'attack-demo.html?url=' +
        encodeURIComponent(data.finalUrl || ('https://' + data.domain));
    }
    context.textContent = data.domain + ' · ' + data.score + '/100 · ' + found.length +
      (found.length === 1 ? ' issue found live.' : ' issues found live.');
    if (scoreBox) scoreBox.textContent = data.score + '/100';
    evidenceBox.innerHTML = '';

    if (!found.length) {
      evidenceBox.appendChild(el('p', 'audit-live__clear', 'No failing checks on this scan. You can still save the client for a maintenance review.'));
      return;
    }

    found.forEach(function (item) {
      var row = el('div', 'audit-live__row audit-live__row--' + item.status);
      var top = el('div', 'audit-live__rowTop');
      top.appendChild(el('span', 'audit-live__badge', item.status === 'warn' ? 'Needs attention' : 'Failed'));
      top.appendChild(el('strong', '', item.label));
      top.appendChild(el('span', 'audit-live__points', '-' + (item.maxPoints - item.points) + ' pts'));
      row.appendChild(top);

      row.appendChild(el('code', 'audit-live__raw', item.evidence || item.detail));
      row.appendChild(el('p', 'audit-live__why', item.detail));

      var actions = el('div', 'audit-live__rowActions');
      var button = el('button', 'btn-secondary', 'Show live');
      button.type = 'button';
      button.addEventListener('click', function () { showPreview(item); });
      actions.appendChild(button);
      row.appendChild(actions);
      evidenceBox.appendChild(row);
    });
  }

  if (closePreview) {
    closePreview.addEventListener('click', function () {
      preview.hidden = true;
      frame.removeAttribute('src');
      overlay.hidden = true;
      overlay.innerHTML = '';
      frameWrap.classList.remove('audit-live__frameWrap--mobile');
    });
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!data) {
        feedback.textContent = 'Run an audit first.';
        return;
      }

      var fullName = nameInput.value.trim();
      var phone = phoneInput.value.trim();
      var email = emailInput.value.trim();
      var contact = contactInput.value;

      if (fullName.length < 2) {
        feedback.textContent = 'Enter the client’s full name.';
        nameInput.focus();
        return;
      }
      if (!/^\+?[0-9][0-9\s()-]{6,24}$/.test(phone)) {
        feedback.textContent = 'Enter a valid phone number.';
        phoneInput.focus();
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) {
        feedback.textContent = 'Enter a valid email address.';
        emailInput.focus();
        return;
      }
      if (!consentInput.checked) {
        feedback.textContent = 'Confirm the client agrees to be contacted.';
        consentInput.focus();
        return;
      }

      var payload = {
        full_name: fullName,
        email: email,
        phone: phone,
        project_type: 'Website audit follow-up',
        project_description: buildDescription(),
        preferred_contact: contact
      };

      var db = window.thcSupabase;
      if (!db || !db.from) {
        feedback.textContent = 'Supabase is not ready. Refresh the page and try again.';
        return;
      }

      saveBtn.disabled = true;
      feedback.textContent = 'Saving…';

      db.from('contact_submissions').insert([payload]).then(function (result) {
        if (result && result.error) throw result.error;
        feedback.textContent = 'Saved. Follow up with ' + fullName + ' via ' + labelForContact(contact) + '.';

        if (proposalLink && window.URLSearchParams) {
          var params = new URLSearchParams();
          params.set('client', fullName);
          params.set('contact', phone + ' · ' + email);
          params.set('package', packageInput ? packageInput.value : 'business');
          params.set('domain', data.domain || '');
          params.set('score', String(data.score));
          params.set('issues', issues().map(function (item) { return item.label; }).join(' | '));
          proposalLink.href = 'proposal.html?' + params.toString();
          proposalLink.hidden = false;
        }

        form.reset();
      }, function (error) {
        feedback.textContent = 'Could not save: ' + (error && error.message ? error.message : 'please try again.');
      }).then(function () {
        saveBtn.disabled = false;
      }, function () {
        saveBtn.disabled = false;
      });
    });
  }

  document.addEventListener('thc:auditresult', function (event) {
    data = event.detail;
    preview.hidden = true;
    frame.removeAttribute('src');
    overlay.hidden = true;
    overlay.innerHTML = '';
    if (form) form.reset();
    if (feedback) feedback.textContent = '';
    if (proposalLink) proposalLink.hidden = true;
    render();
  });
})();
