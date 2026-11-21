/* Admin audit workbench: paid gate, fix split, copy-ready client message, job save. */
(function () {
  'use strict';

  var root = document.querySelector('[data-audit-workbench]');
  if (!root) return;

  var TABLE = 'client_audit_jobs';
  var DRAFT_KEY = 'thcAdminAuditJobDraft';
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

  var COPY = {
    en: {
      checking: 'Checking Supabase…',
      ready: 'Supabase ready',
      missing: 'Run supabase/client-audit-jobs.sql',
      loginRequired: 'Log in to the admin first',
      noSession: 'Log in to the admin first',
      gate: 'Payment is not marked yet. Mark the client as paid to unlock the fix plan and the message.',
      runFirst: 'Run the audit first.',
      markPaid: 'Mark payment first.',
      saved: 'Job saved.',
      saveFail: 'Could not save. Check Supabase setup and try again.',
      handle: 'I handle these',
      needsClient: 'Needs client help',
      none: 'No issues in this group.',
      todo: 'To do',
      doing: 'In progress',
      done: 'Done',
      waiting: 'Waiting for client',
      copyInstruction: 'Copy instruction',
      fixThis: 'Fix this',
      askClient: 'Ask client',
      prepAll: 'Prepare all auto fixes',
      autoNote: 'Click Fix this to copy the exact instruction. Apply it in hosting/CMS, then set Done.',
      collabNote: 'Click Ask client to copy the request. Send it yourself, then set Waiting for client.',
      prepDone: 'Instruction copied. Apply it, then set Done.',
      askDone: 'Client request copied. Send it yourself, then set Waiting for client.',
      allDone: 'All auto-fix instructions copied. Apply them, then set Done.',
      copied: 'Copied.',
      selectText: 'Select the text above and copy it.',
      generate: 'Generate message',
      rescan: 'Re-run scan',
      save: 'Save job',
      saving: 'Saving…',
      note: 'Edit this message, then copy and send it yourself. Nothing is sent automatically.',
      auditTitle: 'Audit result',
      score: 'Score',
      payment: 'Payment',
      noPayment: 'not specified',
      confirmed: 'Payment marked as received manually by Thomas. Automatic checkout is not active yet.',
      intro: 'Hello {name},',
      introNoName: 'Hello,',
      summary: 'I finished the audit of {domain} on {date}. Current score: {score}/100 ({label}).',
      autoIntro: 'I can handle these without anything from you:',
      collabIntro: 'I need your help with these:',
      evidence: 'Evidence',
      next: 'Where to do it',
      closing: 'After the changes I will re-run the same audit and send you the updated score. The final scope and price are confirmed in writing before work starts.',
      signoff: 'Thomas Hondo Chacha\n+254705023432',
      payments: {
        mpesa_buy_goods: 'M-Pesa Buy Goods Till 8729928',
        kcb_bank: 'KCB Bank Business No. 522522 / Account 1321947844',
        mpesa_send_money: 'M-Pesa Send Money 0705023432',
        other: 'payment confirmed manually',
        '': 'not specified'
      }
    },
    sw: {
      checking: 'Inakagua Supabase…',
      ready: 'Supabase iko tayari',
      missing: 'Endesha supabase/client-audit-jobs.sql',
      loginRequired: 'Ingia kwanza kwenye admin',
      noSession: 'Ingia kwanza kwenye admin',
      gate: 'Malipo bado hayaija alama. Weka alama kuwa client amelipa ili uone mpango wa kurekebisha na ujumbe.',
      runFirst: 'Endesha uchambuzi kwanza.',
      markPaid: 'Weka alama ya malipo kwanza.',
      saved: 'Job imehifadhiwa.',
      saveFail: 'Imeshindwa kuhifadhi. Angalia Supabase kisha ujaribu tena.',
      handle: 'Ninazofanya mimi',
      needsClient: 'Zinazohitaji client',
      none: 'Hakuna masuala katika kikundi hiki.',
      todo: 'Ya kufanya',
      doing: 'Inafanywa',
      done: 'Imekamilika',
      waiting: 'Inasubiri client',
      copyInstruction: 'Nakili maelekezo',
      fixThis: 'Rekebisha hii',
      askClient: 'Muulize client',
      prepAll: 'Andaa marekebisho yote',
      autoNote: 'Bonyeza Rekebisha hii ili kunakili maelekezo. Yafanye kwenye hosting/CMS, kisha weka Imekamilika.',
      collabNote: 'Bonyeza Muulize client ili kunakili ombi. Litume mwenyewe, kisha weka Inasubiri client.',
      prepDone: 'Maelekezo yamenakiliwa. Yafanye, kisha weka Imekamilika.',
      askDone: 'Ombi la client limenakiliwa. Litume mwenyewe, kisha weka Inasubiri client.',
      allDone: 'Maelekezo yote yamenakiliwa. Yafanye, kisha weka Imekamilika.',
      copied: 'Imenakiliwa.',
      selectText: 'Chagua maandishi hapo jua na uyanakili.',
      generate: 'Tengeneza ujumbe',
      rescan: 'Rudia uchambuzi',
      save: 'Hifadhi job',
      saving: 'Inahifadhi…',
      note: 'Hariri ujumbe huu, kisha uunakili na uutume mwenyewe. Hakuna kinachotumwa kiotomatiki.',
      auditTitle: 'Matokeo ya uchambuzi',
      score: 'Alama',
      payment: 'Malipo',
      noPayment: 'hayajatajwa',
      confirmed: 'Malipo yamewekwa alama kuwa yalipokelewa na Thomas kwa mkono. Malipo ya moja kwa moja bado hayafanyi kazi.',
      intro: 'Habari {name},',
      introNoName: 'Habari,',
      summary: 'Nimemaliza uchambuzi wa {domain} tarehe {date}. Alama ya sasa: {score}/100 ({label}).',
      autoIntro: 'Ninaweza kufanya hizi bila kuhitaji chochote kutoka kwako:',
      collabIntro: 'Nahitaji msaada wako kwa hizi:',
      evidence: 'Ushahidi',
      next: 'Mahali pa kufanya',
      closing: 'Baada ya mabadiliko nitarudia uchambuzi huu na kukutumia alama mpya. Kazi na bei ya mwisho zinathibitishwa kwa maandishi kabla ya kuanza.',
      signoff: 'Thomas Hondo Chacha\n+254705023432',
      payments: {
        mpesa_buy_goods: 'M-Pesa Lipa Bidhaa 8729928',
        kcb_bank: 'KCB Bank Biashara Na. 522522 / Akaunti 1321947844',
        mpesa_send_money: 'M-Pesa Tuma Pesa 0705023432',
        other: 'malipo yamethibitishwa kwa mkono',
        '': 'hayajatajwa'
      }
    }
  };

  var GUIDE = {
    en: {
      ssl: { where: 'Hosting control panel → SSL/TLS, or your CDN settings.', action: 'Install an SSL certificate and redirect http:// to https://.' },
      speed: { where: 'Image library, theme/build pipeline, hosting cache or CDN.', action: 'Compress images, remove heavy scripts and enable caching.' },
      hsts: { where: 'Hosting/CDN headers or web server configuration.', action: 'Send Strict-Transport-Security on HTTPS responses, starting with a short max-age.' },
      xfo: { where: 'Hosting/CDN headers or web server configuration.', action: 'Send X-Frame-Options: DENY or SAMEORIGIN.' },
      xcto: { where: 'Hosting/CDN headers or web server configuration.', action: 'Send X-Content-Type-Options: nosniff.' },
      csp: { where: 'Hosting/CDN headers or web server configuration.', action: 'Add a Content-Security-Policy that fits the site scripts and styles.' },
      title: { where: 'Page template, SEO plugin or CMS settings.', action: 'Add a unique, descriptive <title> to the homepage.' },
      description: { where: 'Page template, SEO plugin or CMS settings.', action: 'Add a clear meta description of about 150–160 characters.' },
      viewport: { where: 'The <head> of every page template.', action: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.' }
    },
    sw: {
      ssl: { where: 'Paneli ya hosting → SSL/TLS, au mipangilio ya CDN.', action: 'Sakinisha cheti cha SSL na uelekeze http:// kwenda https://.' },
      speed: { where: 'Maktaba ya picha, theme/build, cache ya hosting au CDN.', action: 'Finya picha, ondoa scripts nzito na washa caching.' },
      hsts: { where: 'Headers za hosting/CDN au usanidi wa server.', action: 'Tuma Strict-Transport-Security kwenye majibu ya HTTPS, uanze na max-age mfupi.' },
      xfo: { where: 'Headers za hosting/CDN au usanidi wa server.', action: 'Tuma X-Frame-Options: DENY au SAMEORIGIN.' },
      xcto: { where: 'Headers za hosting/CDN au usanidi wa server.', action: 'Tuma X-Content-Type-Options: nosniff.' },
      csp: { where: 'Headers za hosting/CDN au usanidi wa server.', action: 'Ongeza Content-Security-Policy inayolingana na scripts na styles za tovuti.' },
      title: { where: 'Template ya ukurasa, plugin ya SEO au CMS.', action: 'Ongeza <title> ya kipekee na yenye maana kwenye ukurasa wa nyumbani.' },
      description: { where: 'Template ya ukurasa, plugin ya SEO au CMS.', action: 'Ongeza meta description wazi ya takriban herufi 150–160.' },
      viewport: { where: 'Sehemu ya <head> ya kila template ya ukurasa.', action: 'Ongeza <meta name="viewport" content="width=device-width, initial-scale=1">.' }
    }
  };

  var el = {
    setup: root.querySelector('[data-wm-setup]'),
    name: root.querySelector('[data-wm-name]'),
    phone: root.querySelector('[data-wm-phone]'),
    email: root.querySelector('[data-wm-email]'),
    payment: root.querySelector('[data-wm-payment]'),
    amount: root.querySelector('[data-wm-amount]'),
    paid: root.querySelector('[data-wm-paid]'),
    save: root.querySelector('[data-wm-save]'),
    feedback: root.querySelector('[data-wm-feedback]'),
    gate: root.querySelector('[data-wm-gate]'),
    plan: root.querySelector('[data-wm-plan]'),
    rescan: root.querySelector('[data-wm-rescan]'),
    generate: root.querySelector('[data-wm-generate]'),
    prepAll: root.querySelector('[data-wm-prep-all]'),
    autoCount: root.querySelector('[data-wm-auto-count]'),
    collabCount: root.querySelector('[data-wm-collab-count]'),
    autoNote: root.querySelector('[data-wm-auto-note]'),
    collabNote: root.querySelector('[data-wm-collab-note]'),
    autoList: root.querySelector('[data-wm-auto-list]'),
    collabList: root.querySelector('[data-wm-collab-list]'),
    message: root.querySelector('[data-wm-message]'),
    copyMessage: root.querySelector('[data-wm-copy-message]'),
    langEn: root.querySelector('[data-wm-lang="en"]'),
    langSw: root.querySelector('[data-wm-lang="sw"]')
  };

  var state = {
    result: null,
    jobId: null,
    paid: false,
    statuses: {},
    messages: {},
    edited: { en: false, sw: false },
    messageLang: 'en',
    saving: false,
    tableReady: false
  };

  function c(lang) { return COPY[lang] || COPY.en; }

  function esc(value) {
    return String(value === null || typeof value === 'undefined' ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function money(value) {
    var number = Number(value) || 0;
    return number.toLocaleString('en-KE');
  }

  function labelFor(lang, value) {
    var text = String(value || '');
    if (lang !== 'sw') return text;
    if (/^good$/i.test(text)) return 'Nzuri';
    if (/^needs attention$/i.test(text)) return 'Inahitaji umakini';
    if (/^poor$/i.test(text)) return 'Duni';
    return text;
  }

  function feedback(text, isError) {
    if (!el.feedback) return;
    el.feedback.textContent = text || '';
    el.feedback.classList.toggle('is-error', Boolean(isError));
  }

  function supabase() { return window.thcSupabase || null; }

  function readFields() {
    state.paid = Boolean(el.paid && el.paid.checked);
  }

  function saveDraft() {
    readFields();
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        clientName: el.name.value,
        clientPhone: el.phone.value,
        clientEmail: el.email.value,
        paymentMethod: el.payment.value,
        amount: el.amount.value,
        paid: state.paid,
        statuses: state.statuses,
        messages: state.messages,
        messageLang: state.messageLang,
        jobId: state.jobId
      }));
    } catch (error) { /* Draft is a convenience only. */ }
  }

  function restoreDraft() {
    try {
      var raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      var draft = JSON.parse(raw);
      if (draft.clientName) el.name.value = draft.clientName;
      if (draft.clientPhone) el.phone.value = draft.clientPhone;
      if (draft.clientEmail) el.email.value = draft.clientEmail;
      if (draft.paymentMethod) el.payment.value = draft.paymentMethod;
      if (draft.amount) el.amount.value = draft.amount;
      state.paid = Boolean(draft.paid);
      state.statuses = draft.statuses && typeof draft.statuses === 'object' ? draft.statuses : {};
      state.messages = draft.messages && typeof draft.messages === 'object' ? draft.messages : {};
      state.edited = { en: Boolean(state.messages.en), sw: Boolean(state.messages.sw) };
      state.messageLang = draft.messageLang === 'sw' ? 'sw' : 'en';
      state.jobId = draft.jobId || null;
      el.paid.checked = state.paid;
    } catch (error) { /* Ignore a broken draft. */ }
  }

  function issues() {
    if (!state.result || !Array.isArray(state.result.checks)) return [];
    return state.result.checks.filter(function (check) { return check.status !== 'pass'; });
  }

  function modeFor(id) {
    return FIXES[id] && FIXES[id].mode === 'auto' ? 'auto' : 'collab';
  }

  function split() {
    var auto = [];
    var collab = [];
    issues().forEach(function (check) {
      (modeFor(check.id) === 'auto' ? auto : collab).push(check);
    });
    return { auto: auto, collab: collab };
  }

  function evidenceFor(check) {
    return String(check.evidence || check.detail || '').trim();
  }

  function statusOptions(lang) {
    var words = c(lang);
    return [
      ['todo', words.todo], ['doing', words.doing], ['done', words.done], ['waiting', words.waiting]
    ].map(function (pair) {
      return '<option value="' + pair[0] + '">' + esc(pair[1]) + '</option>';
    }).join('');
  }

  function renderRow(check, lang, mode) {
    var words = c(lang);
    var action = mode === 'auto' ? 'fix' : 'ask';
    var actionLabel = mode === 'auto' ? words.fixThis : words.askClient;
    var status = state.statuses[check.id] || 'todo';
    var guide = (GUIDE[lang] || GUIDE.en)[check.id] || { where: '', action: '' };
    var price = FIXES[check.id] ? 'from KSh ' + money(FIXES[check.id].price) : '';
    return '' +
      '<div class="audit-workbench__row">' +
        '<div class="audit-workbench__rowTop">' +
          '<strong class="audit-workbench__rowTitle">' + esc(check.label || check.id) + '</strong>' +
          '<span class="audit-workbench__price">' + esc(price) + '</span>' +
        '</div>' +
        (evidenceFor(check) ? '<p class="audit-workbench__evidence">' + esc(evidenceFor(check)) + '</p>' : '') +
        (guide.action ? '<p class="audit-workbench__evidence">' + esc(guide.action) + '</p>' : '') +
        '<div class="audit-workbench__rowActions">' +
          '<select data-status="' + esc(check.id) + '" aria-label="Status for ' + esc(check.label || check.id) + '">' +
            statusOptions(lang).replace('value="' + status + '"', 'value="' + status + '" selected') +
          '</select>' +
          '<button class="button button--ghost button--tiny" type="button" data-action="' + action + '" data-issue="' + esc(check.id) + '">' +
            esc(actionLabel) +
          '</button>' +
        '</div>' +
      '</div>';
  }

  function instruction(check, lang) {
    var words = c(lang);
    var guide = (GUIDE[lang] || GUIDE.en)[check.id] || { where: '', action: '' };
    var lines = [
      words.auditTitle + ': ' + (check.label || check.id),
      words.score + ': ' + check.points + '/' + check.maxPoints,
      words.evidence + ': ' + (evidenceFor(check) || '—'),
      guide.action ? 'Action: ' + guide.action : '',
      guide.where ? words.next + ': ' + guide.where : ''
    ];
    return lines.filter(Boolean).join('\n');
  }

  function combinedAutoInstructions(lang) {
    var list = split().auto;
    if (!list.length) return c(lang).none;
    return list.map(function (check, index) {
      return (index + 1) + '. ' + instruction(check, lang);
    }).join('\n\n');
  }

  function issueLines(list, lang) {
    if (!list.length) return '  - ' + c(lang).none;
    return list.map(function (check) {
      var guide = (GUIDE[lang] || GUIDE.en)[check.id] || { where: '' };
      var price = FIXES[check.id] ? ' — from KSh ' + money(FIXES[check.id].price) : '';
      return '  - ' + (check.label || check.id) + price + '\n' +
        '    ' + c(lang).evidence + ': ' + (evidenceFor(check) || '—') + '\n' +
        (guide.where ? '    ' + c(lang).next + ': ' + guide.where : '');
    }).join('\n');
  }

  function buildMessage(lang) {
    var words = c(lang);
    var data = state.result;
    if (!data) return '';
    var groups = split();
    var name = el.name.value.trim();
    var method = words.payments[el.payment.value] || words.noPayment;
    var amount = Number(el.amount.value) ? ' — KSh ' + money(el.amount.value) : '';
    var date = String(data.checkedAt || '').slice(0, 10) || new Date().toISOString().slice(0, 10);
    return [
      name ? words.intro.replace('{name}', name) : words.introNoName,
      '',
      words.summary
        .replace('{domain}', data.domain || data.scannedUrl || '')
        .replace('{date}', date)
        .replace('{score}', data.score)
        .replace('{label}', labelFor(lang, data.overallLabel)),
      '',
      words.autoIntro,
      issueLines(groups.auto, lang),
      '',
      words.collabIntro,
      issueLines(groups.collab, lang),
      '',
      words.payment + ': ' + method + amount + '.',
      words.confirmed,
      '',
      words.closing,
      '',
      words.signoff
    ].join('\n');
  }

  function ensureMessages() {
    if (!state.result) return;
    if (!state.messages.en) state.messages.en = buildMessage('en');
    if (!state.messages.sw) state.messages.sw = buildMessage('sw');
  }

  function refreshGenerated() {
    if (!state.result) return;
    ['en', 'sw'].forEach(function (lang) {
      if (!state.edited[lang]) state.messages[lang] = buildMessage(lang);
    });
    if (!state.edited[state.messageLang]) el.message.value = state.messages[state.messageLang] || '';
  }

  function setLang(lang) {
    if (state.messageLang === lang) return;
    state.messages[state.messageLang] = el.message.value;
    state.messageLang = lang;
    ensureMessages();
    el.message.value = state.messages[lang] || '';
    el.langEn.classList.toggle('is-active', lang === 'en');
    el.langSw.classList.toggle('is-active', lang === 'sw');
    saveDraft();
    render();
  }

  function render() {
    readFields();
    if (!state.result) {
      el.gate.hidden = true;
      el.plan.hidden = true;
      return;
    }
    if (!state.paid) {
      el.gate.hidden = false;
      el.plan.hidden = true;
      return;
    }

    ensureMessages();
    var words = c(state.messageLang);
    var groups = split();
    el.gate.hidden = true;
    el.plan.hidden = false;
    el.autoCount.textContent = groups.auto.length;
    el.collabCount.textContent = groups.collab.length;
    if (el.autoNote) el.autoNote.textContent = words.autoNote;
    if (el.collabNote) el.collabNote.textContent = words.collabNote;
    if (el.prepAll) el.prepAll.disabled = groups.auto.length === 0;
    el.autoList.innerHTML = groups.auto.length
      ? groups.auto.map(function (check) { return renderRow(check, state.messageLang, 'auto'); }).join('')
      : '<p class="audit-workbench__empty">' + esc(words.none) + '</p>';
    el.collabList.innerHTML = groups.collab.length
      ? groups.collab.map(function (check) { return renderRow(check, state.messageLang, 'collab'); }).join('')
      : '<p class="audit-workbench__empty">' + esc(words.none) + '</p>';
    if (el.message.value !== state.messages[state.messageLang]) {
      el.message.value = state.messages[state.messageLang] || '';
    }
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return Promise.reject(new Error('clipboard unavailable'));
  }

  function checkSetup() {
    var client = supabase();
    if (!client) {
      if (el.setup) {
        el.setup.textContent = c(state.messageLang).noSession;
        el.setup.classList.remove('is-ready');
      }
      return;
    }
    client.from(TABLE).select('id').limit(1).then(function (response) {
      var words = c(state.messageLang);
      state.tableReady = !response.error;
      if (!el.setup) return;
      if (!response.error) {
        el.setup.textContent = words.ready;
        el.setup.classList.add('is-ready');
        return;
      }
      var message = String(response.error.message || '');
      el.setup.textContent = /client_audit_jobs|42P01|relation/i.test(message)
        ? words.missing
        : words.loginRequired;
      el.setup.classList.remove('is-ready');
    });
  }

  function watchAuth() {
    var client = supabase();
    if (!client || !client.auth || !client.auth.onAuthStateChange) return;
    client.auth.onAuthStateChange(function (event, session) {
      if (session) checkSetup();
    });
  }

  function loadJob(domain) {
    var client = supabase();
    if (!client || !domain) return;
    client.from(TABLE).select('*').eq('domain', domain).order('created_at', { ascending: false }).limit(1).then(function (response) {
      if (response.error || !response.data || !response.data.length) return;
      var row = response.data[0];
      state.jobId = row.id;
      state.statuses = row.issue_status && typeof row.issue_status === 'object' ? row.issue_status : {};
      if (row.client_name) el.name.value = row.client_name;
      if (row.client_phone) el.phone.value = row.client_phone;
      if (row.client_email) el.email.value = row.client_email;
      if (row.payment_method) el.payment.value = row.payment_method;
      if (row.amount_ksh) el.amount.value = row.amount_ksh;
      if (typeof row.paid === 'boolean') {
        state.paid = row.paid;
        el.paid.checked = row.paid;
      }
      if (row.client_message) {
        state.messages[state.messageLang] = row.client_message;
        state.edited[state.messageLang] = true;
      }
      saveDraft();
      render();
    });
  }

  function saveJob() {
    if (state.saving) return;
    readFields();
    var words = c(state.messageLang);
    if (!state.result) { feedback(words.runFirst, true); return; }
    if (!state.paid) { feedback(words.markPaid, true); return; }
    var client = supabase();
    if (!client) { feedback(words.noSession, true); return; }

    ensureMessages();
    state.messages[state.messageLang] = el.message.value || state.messages[state.messageLang];
    var payload = {
      client_name: el.name.value.trim(),
      client_phone: el.phone.value.trim(),
      client_email: el.email.value.trim(),
      domain: state.result.domain || '',
      scanned_url: state.result.scannedUrl || '',
      paid: true,
      paid_at: new Date().toISOString(),
      payment_method: el.payment.value,
      amount_ksh: Number(el.amount.value) || null,
      score: Number(state.result.score) || 0,
      overall_label: state.result.overallLabel || '',
      checks: state.result.checks || [],
      issue_status: state.statuses,
      client_message: state.messages[state.messageLang],
      notes: ''
    };
    if (!payload.domain) { feedback(words.runFirst, true); return; }

    state.saving = true;
    el.save.disabled = true;
    el.save.textContent = words.saving;
    var query = state.jobId
      ? client.from(TABLE).update(payload).eq('id', state.jobId).select('id').single()
      : client.from(TABLE).insert(payload).select('id').single();

    query.then(function (response) {
      state.saving = false;
      el.save.disabled = false;
      el.save.textContent = words.save;
      if (response.error) {
        var message = String(response.error.message || '');
        feedback(/client_audit_jobs|42P01|relation/i.test(message) ? words.missing : words.saveFail, true);
        return;
      }
      if (response.data && response.data.id) state.jobId = response.data.id;
      state.tableReady = true;
      if (el.setup) {
        el.setup.textContent = words.ready;
        el.setup.classList.add('is-ready');
      }
      feedback(words.saved, false);
      saveDraft();
    });
  }

  function bind() {
    el.paid.addEventListener('change', function () { readFields(); saveDraft(); render(); });
    [el.name, el.phone, el.email, el.payment, el.amount].forEach(function (field) {
      var handler = function () { refreshGenerated(); saveDraft(); };
      field.addEventListener('input', handler);
      field.addEventListener('change', handler);
    });
    el.message.addEventListener('input', function () {
      state.messages[state.messageLang] = el.message.value;
      state.edited[state.messageLang] = true;
      saveDraft();
    });
    el.langEn.addEventListener('click', function () { setLang('en'); });
    el.langSw.addEventListener('click', function () { setLang('sw'); });
    el.generate.addEventListener('click', function () {
      state.edited = { en: false, sw: false };
      ['en', 'sw'].forEach(function (lang) { state.messages[lang] = buildMessage(lang); });
      el.message.value = state.messages[state.messageLang] || '';
      saveDraft();
    });
    el.copyMessage.addEventListener('click', function () {
      copyText(el.message.value).then(
        function () { feedback(c(state.messageLang).copied, false); },
        function () { feedback(c(state.messageLang).selectText, true); }
      );
    });
    el.save.addEventListener('click', saveJob);
    el.rescan.addEventListener('click', function () {
      var submit = document.getElementById('audit-submit');
      if (submit) submit.click();
    });
    var openWorkbench = document.querySelector('[data-audit-open-workbench]');
    if (openWorkbench) {
      openWorkbench.addEventListener('click', function () {
        if (root.scrollIntoView) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
    if (el.prepAll) {
      el.prepAll.addEventListener('click', function () {
        var groups = split();
        if (!groups.auto.length) return;
        groups.auto.forEach(function (check) { state.statuses[check.id] = 'doing'; });
        saveDraft();
        render();
        copyText(combinedAutoInstructions(state.messageLang)).then(
          function () { feedback(c(state.messageLang).allDone, false); },
          function () { feedback(c(state.messageLang).selectText, true); }
        );
      });
    }
    [el.autoList, el.collabList].forEach(function (list) {
      list.addEventListener('change', function (event) {
        var select = event.target.closest('[data-status]');
        if (!select) return;
        state.statuses[select.getAttribute('data-status')] = select.value;
        saveDraft();
      });
      list.addEventListener('click', function (event) {
        var button = event.target.closest('[data-action][data-issue]');
        if (!button) return;
        var action = button.getAttribute('data-action');
        var id = button.getAttribute('data-issue');
        var check = issues().filter(function (item) { return item.id === id; })[0];
        if (!check) return;
        state.statuses[id] = action === 'fix' ? 'doing' : 'waiting';
        saveDraft();
        render();
        copyText(instruction(check, state.messageLang)).then(
          function () { feedback(c(state.messageLang)[action === 'fix' ? 'prepDone' : 'askDone'], false); },
          function () { feedback(c(state.messageLang).selectText, true); }
        );
      });
    });
    document.addEventListener('thc:auditresult', function (event) {
      state.result = event.detail && event.detail.ok ? event.detail : null;
      if (!state.result) { render(); return; }
      state.messages = {};
      state.edited = { en: false, sw: false };
      ensureMessages();
      el.message.value = state.messages[state.messageLang];
      render();
      loadJob(state.result.domain);
    });
  }

  restoreDraft();
  bind();
  checkSetup();
  watchAuth();
  render();
})();
