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
      notice: 'See the real evidence, choose the fixes you want, then pay using the M-Pesa options below. Automatic payment is coming soon.',
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
      frameNote: 'If the frame is blank, the site is refusing to be embedded — that is the protection working. The evidence above still applies.',
      blockedTitle: 'This site blocks embedding',
      blockedText: 'The live header says this site refuses to be framed. That is clickjacking protection working, so the preview is intentionally empty. You can still open the real site in a new tab.',
      openLive: 'Open live site in a new tab',
      clickDemo: 'Overlay click captured locally. Nothing was sent to the website.',
      from: 'from',
      fix: 'Fix',
      auto: 'Automatic',
      collab: 'Needs collaboration',
      add: 'Add to my plan',
      added: 'Added to plan',
      remove: 'Remove',
      fixIntro: 'This fix can be prepared and applied as a small configuration change once access is confirmed.',
      collabIntro: 'This fix needs your input or access to your hosting/DNS. Thomas will guide you or do it with you.',
      fixSummaryEmpty: 'Pick the fixes you want. Prices are starting points and are confirmed in writing.',
      fixSummary: '{count} fix(es) selected — from KSh {total}.',
      payTitle: 'Pay for the fixes you choose',
      payBadge: 'Automatic payment coming soon',
      payEmpty: 'Choose fixes above to see your total.',
      payTotal: 'Selected fixes total — from KSh {total}',
      payTillTitle: 'M-Pesa Buy Goods',
      payTill: 'Till No. 8729928 — Thomas Hondo Chacha',
      payBankTitle: 'KCB Bank',
      payBank: '522522 · Account No. 1321947844 — Thomas Hondo Chacha',
      paySendTitle: 'Send Money',
      paySend: '0705023432 — Thomas Hondo Chacha',
      payNote: 'After paying, send your details below. Thomas confirms the payment manually and starts the work.',
      included: 'Selected fixes'
    },
    sw: {
      title: 'Ona ushahidi moja kwa moja',
      intro: 'Chagua tatizo lolote hapa chini kuona ushahidi halisi, kisha uache maelezo yako kama unataka Thomas akusaidie.',
      attack: 'Fungua demo kamili ya shambulio',
      notice: 'Ona ushahidi halisi, chagua marekebisho unayotaka, kisha lipa kwa njia za M-Pesa hapo chini. Malipo ya moja kwa moja yanakuja hivi karibuni.',
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
      frameNote: 'Kama frame ni tupu, tovuti inakataa kuwekwa ndani — hiyo ni ulinzi ukifanya kazi. Ushahidi hapo juu bado unatumika.',
      blockedTitle: 'Tovuti hii inazuia kuwekwa ndani',
      blockedText: 'Header halisi inasema tovuti hii inakataa kuwekwa kwenye frame. Hiyo ni ulinzi wa clickjacking ukifanya kazi, kwa hiyo preview imeachwa tupu makusudi. Bado unaweza kufungua tovuti halisi kwenye tab mpya.',
      openLive: 'Fungua tovuti halisi kwenye tab mpya',
      clickDemo: 'Bonyezo la overlay limeshwa hapa local. Hakuna kilichotumwa kwenye tovuti.',
      from: 'kuanzia',
      fix: 'Rekebisha',
      auto: 'Moja kwa moja',
      collab: 'Inahitaji ushirikiano',
      add: 'Ongeza kwenye mpango wangu',
      added: 'Imeongezwa',
      remove: 'Ondoa',
      fixIntro: 'Marekebisho haya yanaweza kuandaliwa na kufanywa kama mabadiliko madogo ya configuration mara ufikiaji utakapothibitishwa.',
      collabIntro: 'Marekebisho haya yanahitaji maelezo yako au ufikiaji wa hosting/DNS. Thomas atakuongoza au atafanya na wewe.',
      fixSummaryEmpty: 'Chagua marekebisho unayotaka. Bei ni za kuanzia na zinathibitishwa kwa maandishi.',
      fixSummary: 'Marekebisho {count} yaliyochaguliwa — kuanzia KSh {total}.',
      payTitle: 'Lipa kwa marekebisho uliyochagua',
      payBadge: 'Malipo ya moja kwa moja yanakuja hivi karibuni',
      payEmpty: 'Chagua marekebisho hapo juu ili uone jumla.',
      payTotal: 'Jumla ya marekebisho yaliyochaguliwa — kuanzia KSh {total}',
      payTillTitle: 'M-Pesa Lipa Bidhaa',
      payTill: 'Namba ya Till 8729928 — Thomas Hondo Chacha',
      payBankTitle: 'KCB Bank',
      payBank: '522522 · Namba ya Akaunti 1321947844 — Thomas Hondo Chacha',
      paySendTitle: 'Tuma Pesa',
      paySend: '0705023432 — Thomas Hondo Chacha',
      payNote: 'Baada ya kulipa, tuma maelezo yako hapo chini. Thomas athibitisha malipo kwa mkono na kuanza kazi.',
      included: 'Marekebisho yaliyochaguliwa'
    }
  };

  var FIXES = {
    ssl: { price: 8000, mode: 'collab' },
    speed: { price: 12000, mode: 'collab' },
    hsts: { price: 3000, mode: 'auto' },
    xfo: { price: 3000, mode: 'auto' },
    xcto: { price: 3000, mode: 'auto' },
    csp: { price: 8000, mode: 'collab' },
    title: { price: 2500, mode: 'auto' },
    description: { price: 2500, mode: 'auto' },
    viewport: { price: 2500, mode: 'auto' }
  };

  var selectedFixes = {};

  var scoreBox = document.getElementById('appScore');
  var evidenceBox = document.getElementById('appEvidence');
  var fixSummary = document.getElementById('appFixSummary');
  var preview = document.getElementById('appPreview');
  var previewHomeParent = preview ? preview.parentNode : null;
  var previewHomeNext = preview ? preview.nextSibling : null;
  var previewTitle = document.getElementById('appPreviewTitle');
  var previewNote = document.getElementById('appPreviewNote');
  var frame = document.getElementById('appFrame');
  var frameWrap = document.getElementById('appFrameWrap');
  var frameBlocked = document.getElementById('appFrameBlocked');
  var openLive = document.getElementById('appOpenLive');
  var overlay = document.getElementById('appOverlay');
  var closeButton = document.getElementById('appPreviewClose');
  var attackLink = document.getElementById('appAttackLink');
  var form = document.getElementById('appForm');
  var nameInput = document.getElementById('appName');
  var phoneInput = document.getElementById('appPhone');
  var emailInput = document.getElementById('appEmail');
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
    set('appContactLabel', c.contact);
    set('appConsentLabel', c.consent);
    set('appSaveLabel', c.save);
    set('appProposalLabel', c.proposal);
    set('appOpenLiveLabel', c.openLive);
    set('appPayTitle', c.payTitle);
    set('appPayBadge', c.payBadge);
    set('appPayTillTitle', c.payTillTitle);
    set('appPayTill', c.payTill);
    set('appPayBankTitle', c.payBankTitle);
    set('appPayBank', c.payBank);
    set('appPaySendTitle', c.paySendTitle);
    set('appPaySend', c.paySend);
    set('appPayNote', c.payNote);
  }

  function issues() {
    if (!data || !data.checks) return [];
    return data.checks.filter(function (item) { return item.status !== 'pass'; });
  }

  function frameBlockReason() {
    if (!data || !data.checks) return '';
    for (var i = 0; i < data.checks.length; i += 1) {
      var check = data.checks[i];
      var evidence = String(check.evidence || '');
      if (check.id === 'xfo' && /sameorigin|deny|allow-from/i.test(evidence)) return evidence;
      if (check.id === 'csp' && /frame-ancestors/i.test(evidence) && !/frame-ancestors\s+'none'/i.test(evidence)) return evidence;
    }
    return '';
  }

  function money(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function selectedFixList() {
    return Object.keys(selectedFixes).map(function (id) {
      var info = FIXES[id];
      var item = issues().filter(function (issue) { return issue.id === id; })[0];
      return {
        id: id,
        label: item ? item.label : id,
        price: info ? info.price : 0,
        mode: info ? info.mode : 'collab'
      };
    });
  }

  function updateFixSummary() {
    var c = t();
    var list = selectedFixList();
    var payTotal = document.getElementById('appPayTotal');
    if (!list.length) {
      if (fixSummary) fixSummary.textContent = c.fixSummaryEmpty;
      if (payTotal) payTotal.textContent = c.payEmpty;
      return;
    }
    var total = list.reduce(function (sum, item) { return sum + item.price; }, 0);
    if (fixSummary) {
      fixSummary.textContent = c.fixSummary
        .replace('{count}', String(list.length))
        .replace('{total}', money(total));
    }
    if (payTotal) payTotal.textContent = c.payTotal.replace('{total}', money(total));
  }

  function description() {
    var lines = [
      'Public website audit captured on thomashondochacha.co.ke.',
      'Website: ' + (data.domain || 'n/a'),
      'Final URL: ' + (data.finalUrl || 'n/a'),
      'Score: ' + data.score + '/100 (' + data.overallLabel + ')',
      'Checked at: ' + (data.checkedAt || 'n/a')
    ];
    issues().forEach(function (item) {
      lines.push('- ' + item.label + ': ' + (item.evidence || item.detail));
    });
    var chosen = selectedFixList();
    if (chosen.length) {
      lines.push('');
      lines.push(t().included + ':');
      chosen.forEach(function (item) {
        lines.push('- ' + item.label + ' — ' + t().from + ' KSh ' + money(item.price) + ' (' + item.mode + ')');
      });
    }
    return lines.join('\n').slice(0, 3900);
  }

  function mountPreview(row) {
    if (!preview) return;
    if (row && row.appendChild) {
      row.appendChild(preview);
    } else if (previewHomeParent) {
      previewHomeParent.insertBefore(preview, previewHomeNext);
    }
  }

  function revealPreview(row) {
    mountPreview(row);
    preview.hidden = false;
    preview.classList.add('is-open');
    if (preview.scrollIntoView) {
      window.setTimeout(function () {
        preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 40);
    }
  }

  function showPreview(item, row) {
    var c = t();
    revealPreview(row);
    frameWrap.classList.remove('is-mobile');
    overlay.hidden = false;
    overlay.innerHTML = '';
    frame.src = data.finalUrl || ('https://' + data.domain);

    var reason = frameBlockReason();
    frameWrap.hidden = Boolean(reason);
    frameBlocked.hidden = !reason;
    if (reason) {
      document.getElementById('appBlockedTitle').textContent = t().blockedTitle;
      document.getElementById('appBlockedText').textContent = t().blockedText;
      document.getElementById('appBlockedEvidence').textContent = reason;
      openLive.href = data.finalUrl || ('https://' + data.domain);
    }

    if (item.id === 'xfo') {
      overlay.appendChild(el('strong', '', c.title));
      overlay.appendChild(el('span', '', c.xfoNote));
      previewTitle.textContent = c.xfoTitle;
      previewNote.textContent = c.xfoNote + ' ' + c.frameNote;
      return;
    }

    if (item.id === 'viewport') {
      frameWrap.classList.add('is-mobile');
      previewTitle.textContent = c.viewportTitle;
      previewNote.textContent = c.viewportNote + ' ' + c.frameNote;
      return;
    }

    overlay.appendChild(el('strong', '', item.label));
    overlay.appendChild(el('span', '', item.evidence || item.detail));
    previewTitle.textContent = item.label;
    previewNote.textContent = (item.id === 'speed' ? c.speedNote : c.genericNote) + ' ' + c.frameNote;
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
      updateFixSummary();
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
      button.addEventListener('click', function () { showPreview(item, row); });
      actions.appendChild(button);

      var fixInfo = FIXES[item.id];
      if (fixInfo) {
        var fixButton = el('button', 'button button--primary', c.fix);
        fixButton.type = 'button';
        actions.appendChild(fixButton);

        var panel = el('div', 'audit-public-proof__fix');
        panel.hidden = true;
        panel.appendChild(el('span', 'audit-public-proof__fixMode',
          fixInfo.mode === 'auto' ? c.auto : c.collab));
        panel.appendChild(el('strong', '', c.from + ' KSh ' + money(fixInfo.price)));
        panel.appendChild(el('p', '', fixInfo.mode === 'auto' ? c.fixIntro : c.collabIntro));

        var addButton = el('button', 'button button--ghost', c.add);
        addButton.type = 'button';
        if (selectedFixes[item.id]) addButton.textContent = c.added;
        addButton.addEventListener('click', function () {
          if (selectedFixes[item.id]) {
            delete selectedFixes[item.id];
            addButton.textContent = c.add;
          } else {
            selectedFixes[item.id] = true;
            addButton.textContent = c.added;
          }
          updateFixSummary();
        });
        panel.appendChild(addButton);
        row.appendChild(panel);

        fixButton.addEventListener('click', function () {
          panel.hidden = !panel.hidden;
        });
      }

      row.appendChild(actions);
      evidenceBox.appendChild(row);
    });
    updateFixSummary();
  }

  if (closeButton) {
    closeButton.addEventListener('click', function () {
      preview.hidden = true;
      preview.classList.remove('is-open');
      mountPreview(null);
      frame.removeAttribute('src');
      frameWrap.hidden = false;
      frameBlocked.hidden = true;
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
          '&domain=' + encodeURIComponent(data.domain || '') +
          '&score=' + encodeURIComponent(data.score) +
          '&issues=' + encodeURIComponent(issues().map(function (item) { return item.label; }).join(' | ')) +
          '&fixes=' + encodeURIComponent(selectedFixList().map(function (item) {
            return item.label + ' (' + t().from + ' KSh ' + money(item.price) + ')';
          }).join(' | '));
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
    preview.classList.remove('is-open');
    mountPreview(null);
    frame.removeAttribute('src');
    frameWrap.hidden = false;
    frameBlocked.hidden = true;
    overlay.hidden = true;
    overlay.innerHTML = '';
    frameWrap.classList.remove('is-mobile');
    if (form) form.reset();
    selectedFixes = {};
    if (proposalLink) proposalLink.hidden = true;
    if (feedback) feedback.textContent = '';
    applyCopy();
    render();
  });

  document.addEventListener('thc:languagechange', function () {
    applyCopy();
    render();
    updateFixSummary();
  });

  applyCopy();
})();
