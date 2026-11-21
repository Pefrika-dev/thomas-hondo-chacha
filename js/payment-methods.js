/* Renders the shared M-Pesa payment card into [data-payment-methods] hosts. */
(function () {
  'use strict';

  var hosts = document.querySelectorAll('[data-payment-methods]');
  if (!hosts.length) return;

  var COPY = {
    en: {
      kicker: 'Payment options',
      title: 'Pay Thomas directly by M-Pesa or KCB Bank',
      badge: 'Automatic payment coming soon',
      tillLabel: 'Buy Goods Till',
      tillValue: '8729928 — Thomas Hondo Chacha',
      bankLabel: 'KCB Bank',
      bankValue: 'Business No. 522522 · Account 1321947844 — Thomas Hondo Chacha',
      sendLabel: 'Send Money',
      sendValue: '0705023432 — Thomas Hondo Chacha',
      note: 'Pay after the scope and price are agreed. Thomas confirms the payment manually. Nothing is deducted automatically by this website.',
      noteProposal: 'Use the amount in your proposal. Thomas confirms the payment manually — automatic checkout is coming soon.'
    },
    sw: {
      kicker: 'Njia za malipo',
      title: 'Mlipie Thomas kwa M-Pesa au KCB Bank',
      badge: 'Malipo ya moja kwa moja yanakuja hivi karibuni',
      tillLabel: 'Lipa Bidhaa — Till',
      tillValue: '8729928 — Thomas Hondo Chacha',
      bankLabel: 'KCB Bank',
      bankValue: 'Biashara Na. 522522 · Akaunti 1321947844 — Thomas Hondo Chacha',
      sendLabel: 'Tuma Pesa',
      sendValue: '0705023432 — Thomas Hondo Chacha',
      note: 'Lipa baada ya kukubaliana kuhusu kazi na bei. Thomas anathibitisha malipo kwa mkono. Tovuti hii haitoi pesa yoyote otomatiki.',
      noteProposal: 'Tumia kiasi kilicho kwenye pendekezo lako. Thomas anathibitisha malipo kwa mkono — malipo ya moja kwa moja yanakuja hivi karibuni.'
    }
  };

  var total = 0;

  function copy() {
    var lang = 'en';
    if (window.Language && typeof window.Language.get === 'function') {
      lang = window.Language.get() === 'sw' ? 'sw' : 'en';
    }
    return COPY[lang] || COPY.en;
  }

  function money(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function field(label, value) {
    return '<div class="payment-methods__item">' +
      '<span class="payment-methods__label">' + label + '</span>' +
      '<input class="payment-methods__value" type="text" readonly value="' + value + '" aria-label="' + label + ': ' + value + '">' +
      '</div>';
  }

  function render() {
    var c = copy();
    Array.prototype.forEach.call(hosts, function (host) {
      var isProposal = host.getAttribute('data-payment-context') === 'proposal';
      var note = isProposal ? c.noteProposal : c.note;
      var totalLine = (isProposal && total)
        ? '<p class="payment-methods__total">Your proposal total — KSh ' + money(total) + '</p>'
        : '';
      host.innerHTML =
        '<div class="payment-methods__head">' +
          '<div><p class="payment-methods__kicker">' + c.kicker + '</p>' +
          '<h3 class="payment-methods__title">' + c.title + '</h3></div>' +
          '<span class="payment-methods__badge">' + c.badge + '</span>' +
        '</div>' +
        totalLine +
        '<div class="payment-methods__grid">' +
          field(c.tillLabel, c.tillValue) +
          field(c.bankLabel, c.bankValue) +
          field(c.sendLabel, c.sendValue) +
        '</div>' +
        '<p class="payment-methods__note">' + note + '</p>';
    });
  }

  document.addEventListener('thc:languagechange', render);
  document.addEventListener('thc:proposaltotal', function (event) {
    total = Number(event && event.detail && event.detail.total) || 0;
    render();
  });
  render();
})();
