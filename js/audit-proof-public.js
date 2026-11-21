/* ==========================================================================
   Public live-proof + lead capture for audit.html.

   Uses the real audit result already shown on the page. The form posts to the
   hardened /api/submit-contact endpoint. Nothing is auto-sent on WhatsApp.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.getElementById('auditPublicProof');
  if (!root) return;

  var COPY = {
    en: {
      title: 'See the proof live',
      intro: 'Pick any issue below to see the real evidence, then leave your details if you want Thomas to fix it.',
      attack: 'Open full attack demo',
      notice: 'Safe proof of concept. The framed website is sandboxed and no form is submitted from this preview.',
      failed: 'Failed',
      attention: 'Needs attention',
      show: 'Show live',
      clear: 'No failing checks on this scan. You can still leave your details for a maintenance review.',
      previewTitle: 'Live preview',
      close: 'Close',
      formTitle: 'Save my details for a free follow-up',
      name: 'Full name',
      phone: 'Phone number',
      email: 'Email address',
      package: 'Suggested package',
      contact: 'Preferred follow-up',
      consent: 'I agree to be contacted about this audit.',
      save: 'Send my details',
      proposal: 'Open my ready proposal',
      saving: 'Saving…',
      needName: 'Enter your full name.',
      needPhone: 'Enter a valid phone number.',
      needEmail: 'Enter a valid email address.',
      needConsent: 'Confirm that you agree to be contacted.',
      saved: 'Saved. Thomas will contact you via',
      saveError: 'Could not save right now. Please try the WhatsApp button below instead.',
      xfoTitle: 'Live site framed by another page',
      xfoNote: 'The real site is inside the frame with an overlay on top. In a real clickjacking attack, a click here could reach the site. Nothing is submitted in this safe proof.',
      viewportTitle: 'Live mobile view — no viewport tag',
      viewportNote: 'This is the live page at phone width. Without a viewport tag, phones shrink the desktop layout.',
      speedNote: 'This is the measured response of the real homepage, not an estimate.',
      genericNote: 'This is the real value returned by the live scan above.',
      clickDemo: 'Overlay click captured locally. Nothing was sent to the website.',
      from: 'from'
    },
    sw: {
      title: 'Ona ushahidi moja kwa moja',
      intro: 'Chagua tatizo lolote hapa chini kuona ushahidi halisi, kisha uache maelezo yako kama unataka Thomas akusaidie.',
      attack: 'Fungua demo kamili ya shambulio',
      notice: 'Ushahidi salama. Tovuti iliyo kwenye frame iko sandbox na hakuna fomu inayotumwa kutoka kwenye preview hii.',
      failed: 'Imeshindwa',
      attention: 'Inahitaji umakini',
      show: 'Ona live',
      clear: 'Hakuna matatizo kwenye uchambuzi huu. Bado unaweza kuacha maelezo kwa ukaguzi wa matengenezo.',
      previewTitle: 'Preview halisi',
      close: 'Funga',
      formTitle: 'Hifadhi maelezo yangu kwa mfuatilio wa bure',
      name: 'Jina kamili',
      phone: 'Namba ya simu',
      email: 'Barua pepe',
      package: 'Kifurushi kinachopendekezwa',
      contact: 'Njia unayopendelea ya kuwasiliana',
      consent: 'Nakubali kuwasiliana nami kuhusu uchambuzi huu.',
      save: 'Tuma maelezo yangu',
      proposal: 'Fungua pendekezo langu lililotayarika',
      saving: 'Inahifadhi…',
      needName: 'Weka jina lako kamili.',
      needPhone: 'Weka namba sahihi ya simu.',
      needEmail: 'Weka barua pepe sahihi.',
      needConsent: 'Thibitisha kuwa unakubali kuwasiliana naye.',
      saved: 'Imehifadhiwa. Thomas atawasiliana nawe kupitia',
      saveError: 'Imeshindwa kuhifadhi kwa sasa. Tafadhali tumia kitufe cha WhatsApp hapa chini.',
      xfoTitle: 'Tovuti halisi ndani ya ukurasa mwingine',
      xfoNote: 'Tovuti halisi iko kwenye frame na overlay juu yake. Katika shambulio halisi la clickjacking, bonyezo hapa linaweza kufikia tovuti. Hakuna kitu kinachotumwa kwenye uchambuzi salama huu.',
      viewportTitle: 'Mwonekano wa simu — hakuna viewport tag',
      viewportNote: 'Hii ni ukurasa halisi kwa upana wa simu. Bila viewport tag, simu hupunguza muundo wa desktop.',
      speedNote: 'Hii ni kipimo halisi cha ukurasa wa nyumbani, si makadirio.',
      genericNote: 'Hii ni thamani halisi iliyorudishwa na uchambuzi hapo juu.',
      clickDemo: 'Bonyezo la overlay limeshwa hapa local. Hakuna kilichotumwa kwenye tovuti.',
      from: 'kuanzia'
    }
  };

  var scoreBox = document.getElementById('appScore');
  var evidenceBox = document.getElementById('appEvidence');
  var preview = document.getElementById('appPreview');
  var previewTitle = document.getElementById('appPreviewTitle');
  var previewNote = document.getElementById('appPreviewNote');
  var frame = document.getElementById('appFrame');
  var frameWrap = document.getElementById('appFrameWrap');
  var overlay = document.getElementById('appOverlay');
  var closeButton = document.getElementById('appPreviewClose');
  var attackLink = document.getElementById('appAttackLink');
  var form = document.getElementById('appForm');
  var nameInput = document.getElementById('appName');
  var phoneInput = document.getElementById('appPhone');
  var emailInput = document.getElementById('appEmail');
  var packageInput = document.getElementById('appPackage');
  var contactInput = document.getElementById('appContact');
  var consentInput = document.getElementById('appConsent');
  var saveButton = document.getElementById('appSave');
  var proposalLink = document.getElementById('appProposal');
  var feedback = document.getElementById('appFeedback');

  var data = null;

  function t() {
    var lang = 'en';
    if (window.Language && typeof window.Language.get === 'function') {
      lang = window.Language.get() === 'sw' ? 'sw' : 'en';
    }
    return COPY[lang] || COPY.en;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function applyCopy() {
    var c = t();
    var set = function (id, value) {
      var node = document.getElementById(id);
      if (node) node.textContent = value;
    };
    set('appTitle', c.title);
    set('appIntro', c.intro);
    set('appAttackLabel', c.attack);
    set('appNotice', c.notice);
    set('appPreviewTitle', c.previewTitle);
    set('appCloseLabel', c.close);
    set('appFormTitle', c.formTitle);
    set('appNameLabel', c.name);
    set('appPhoneLabel', c.phone);
    set('appEmailLabel', c.email);
    set('appPackageLabel', c.package);
    set('appContactLabel', c.contact);
    set('appConsentLabel', c.consent);
    set('appSaveLabel', c.save);
    set('appProposalLabel', c.proposal);

    if (packageInput) {
      var packages = ['starter', 'business', 'commerce', 'custom'];
      Array.prototype.forEach.call(packageInput.options, function (option, index) {
        var key = packages[index];
        if (!key) return;
        var prices = { starter: '25,000', business: '55,000', commerce: '120,000', custom: '150,000' };
        option.textContent = key.charAt(0).toUpperCase() + key.slice(1) + ' — ' + c.from + ' KSh ' + prices[key];
      });
    }
  }

  function issues() {
    if (!data || !data.checks) return [];
    return data.checks.filter(function (item) { return item.status !== 'pass'; });
  }

  function description() {
    var lines = [
      'Public website audit captured on thomashondochacha.co.ke.',
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
    var c = t();
    preview.hidden = false;
    frameWrap.classList.remove('is-mobile');
    overlay.hidden = false;
    overlay.innerHTML = '';
    frame.src = data.finalUrl || ('https://' + data.domain);

    if (item.id === 'xfo') {
      overlay.appendChild(el('strong', '', c.title));
      overlay.appendChild(el('span', '', c.xfoNote));
      previewTitle.textContent = c.xfoTitle;
      previewNote.textContent = c.xfoNote;
      return;
    }

    if (item.id === 'viewport') {
      frameWrap.classList.add('is-mobile');
      previewTitle.textContent = c.viewportTitle;
      previewNote.textContent = c.viewportNote;
      return;
    }

    overlay.appendChild(el('strong', '', item.label));
    overlay.appendChild(el('span', '', item.evidence || item.detail));
    previewTitle.textContent = item.label;
    previewNote.textContent = item.id === 'speed' ? c.speedNote : c.genericNote;
  }

  function render() {
    if (!data || !data.checks) return;
    var c = t();
    var found = issues();
    if (scoreBox) scoreBox.textContent = data.score + '/100';
    if (attackLink) {
      attackLink.href = 'attack-demo.html?url=' +
        encodeURIComponent(data.finalUrl || ('https://' + data.domain));
    }
    evidenceBox.innerHTML = '';

    if (!found.length) {
      evidenceBox.appendChild(el('p', '', c.clear));
      return;
    }

    found.forEach(function (item) {
      var row = el('div', 'audit-public-proof__row');
      var top = el('div', 'audit-public-proof__rowTop');
      top.appendChild(el('span', 'audit-public-proof__badge',
        item.status === 'warn' ? c.attention : c.failed));
      top.appendChild(el('strong', '', item.label));
      top.appendChild(el('span', 'audit-public-proof__points',
        '-' + (item.maxPoints - item.points) + ' pts'));
      row.appendChild(top);
      row.appendChild(el('code', 'audit-public-proof__raw', item.evidence || item.detail));
      row.appendChild(el('p', 'audit-public-proof__why', item.detail));

      var actions = el('div', 'audit-public-proof__rowActions');
      var button = el('button', 'button button--ghost', c.show);
      button.type = 'button';
      button.addEventListener('click', function () { showPreview(item); });
      actions.appendChild(button);
      row.appendChild(actions);
      evidenceBox.appendChild(row);
    });
  }

  if (closeButton) {
    closeButton.addEventListener('click', function () {
      preview.hidden = true;
      frame.removeAttribute('src');
      overlay.hidden = true;
      overlay.innerHTML = '';
      frameWrap.classList.remove('is-mobile');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', function (event) {
      event.preventDefault();
      feedback.textContent = t().clickDemo;
    });
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var c = t();
      if (!data) return;

      var fullName = nameInput.value.trim();
      var phone = phoneInput.value.trim();
      var email = emailInput.value.trim();
      var contact = contactInput.value;

      if (fullName.length < 2) {
        feedback.textContent = c.needName;
        nameInput.focus();
        return;
      }
      if (!/^\+?[0-9][0-9\s()-]{6,24}$/.test(phone)) {
        feedback.textContent = c.needPhone;
        phoneInput.focus();
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) {
        feedback.textContent = c.needEmail;
        emailInput.focus();
        return;
      }
      if (!consentInput.checked) {
        feedback.textContent = c.needConsent;
        consentInput.focus();
        return;
      }

      saveButton.disabled = true;
      feedback.textContent = c.saving;

      fetch('/api/submit-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          phone: phone,
          company_website: document.getElementById('appHoneypot').value,
          project_type: 'Website audit follow-up',
          project_description: description(),
          preferred_contact: contact
        })
      }).then(function (response) {
        if (!response.ok) throw new Error('bad response');
        return response.json();
      }).then(function () {
        var method = contact === 'phone' ? 'phone' : (contact === 'email' ? 'email' : 'WhatsApp');
        feedback.textContent = c.saved + ' ' + method + '.';
        proposalLink.href = 'proposal.html?client=' + encodeURIComponent(fullName) +
          '&contact=' + encodeURIComponent(phone + ' · ' + email) +
          '&package=' + encodeURIComponent(packageInput.value) +
          '&domain=' + encodeURIComponent(data.domain || '') +
          '&score=' + encodeURIComponent(data.score) +
          '&issues=' + encodeURIComponent(issues().map(function (item) { return item.label; }).join(' | '));
        proposalLink.hidden = false;
        form.reset();
      }).catch(function () {
        feedback.textContent = c.saveError;
      }).then(function () {
        saveButton.disabled = false;
      }, function () {
        saveButton.disabled = false;
      });
    });
  }

  document.addEventListener('thc:auditresult', function (event) {
    data = event.detail;
    preview.hidden = true;
    frame.removeAttribute('src');
    overlay.hidden = true;
    overlay.innerHTML = '';
    frameWrap.classList.remove('is-mobile');
    if (form) form.reset();
    if (proposalLink) proposalLink.hidden = true;
    if (feedback) feedback.textContent = '';
    applyCopy();
    render();
  });

  document.addEventListener('thc:languagechange', function () {
    applyCopy();
    render();
  });

  applyCopy();
})();
