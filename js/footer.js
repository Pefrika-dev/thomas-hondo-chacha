/* Shared professional footer for all public pages. */
(function () {
  'use strict';

  var host = document.querySelector('[data-footer]');
  if (!host) return;

  var COPY = {
    en: {
      kicker: "Let's build something useful",
      role: 'Software Engineer',
      description: 'Software engineer building modern websites, web applications and practical digital solutions for businesses in Kenya and beyond.',
      status: 'Based in Migori, Kenya · Open to project conversations',
      ctaWhatsapp: 'Start a WhatsApp chat',
      ctaServices: 'See services',
      explore: 'Explore',
      services: 'Services',
      contact: 'Contact',
      home: 'Home',
      about: 'About',
      projects: 'Projects',
      blog: 'Blog',
      proposal: 'Proposal',
      audit: 'Audit',
      starter: 'Starter websites',
      business: 'Business websites',
      commerce: 'Commerce & M-Pesa',
      custom: 'Custom systems',
      freeAudit: 'Free website audit',
      instantProposal: 'Instant proposal',
      paymentTitle: 'M-Pesa accepted',
      paymentText: 'Buy Goods 8729928 · KCB Bank Business No. 522522 / Account 1321947844 · Send Money 0705023432',
      call: 'Call 0705023432',
      email: 'thomashondochacha@gmail.com',
      whatsapp: 'WhatsApp 0705023432',
      location: 'Migori, Kenya · East Africa Time',
      promise: 'One engineer. One accountable owner. No hand-offs.',
      rights: 'All rights reserved.',
      built: 'Designed and built by Thomas Hondo Chacha in Migori, Kenya.',
      privacy: 'This site stores only your language and theme preferences. Enquiries are saved securely for Thomas.',
      backToTop: 'Back to top',
      waText: 'Hello Thomas, I would like to discuss a website or software project.'
    },
    sw: {
      kicker: 'Wujenge kitu cha maana',
      role: 'Mhandisi wa Programu',
      description: 'Mhandisi wa programu anayejenga tovuti za kisasa, programu za wavuti na suluhisho la vitendo kwa biashara nchini Kenya na kwingineko.',
      status: 'Anakaa Migori, Kenya · Yuko tayari kuzungumza miradi',
      ctaWhatsapp: 'Anza mazungumzo kwa WhatsApp',
      ctaServices: 'Ona huduma',
      explore: 'Vinjari',
      services: 'Huduma',
      contact: 'Wasiliana',
      home: 'Nyumbani',
      about: 'Kuhusu',
      projects: 'Miradi',
      blog: 'Blogu',
      proposal: 'Pendekezo',
      audit: 'Uchambuzi',
      starter: 'Tovuti za Msingi',
      business: 'Tovuti za Biashara',
      commerce: 'Mauzo na M-Pesa',
      custom: 'Mifumo maalum',
      freeAudit: 'Uchambuzi wa bure',
      instantProposal: 'Pendekezo la haraka',
      paymentTitle: 'Malipo ya M-Pesa yanakubalika',
      paymentText: 'Lipa Bidhaa 8729928 · KCB Bank Biashara Na. 522522 / Akaunti 1321947844 · Tuma Pesa 0705023432',
      call: 'Piga 0705023432',
      email: 'thomashondochacha@gmail.com',
      whatsapp: 'WhatsApp 0705023432',
      location: 'Migori, Kenya · Saa za Afrika Mashariki',
      promise: 'Mhandisi mmoja. Mwenye jukumu mmoja. Hakuna kukabidhiana kwa watu wengine.',
      rights: 'Haki zote zimehifadhiwa.',
      built: 'Imeundwa na kujengwa na Thomas Hondo Chacha kutoka Migori, Kenya.',
      privacy: 'Tovuti hii huhifadhi tu lugha na mandhari unazochagua. Maswali yako huhifadhiwa salama kwa Thomas.',
      backToTop: 'Rudi juu',
      waText: 'Hujambo Thomas, ningependa kuzungumza kuhusu mradi wa tovuti au programu.'
    }
  };

  function copy() {
    var lang = 'en';
    if (window.Language && typeof window.Language.get === 'function') {
      lang = window.Language.get() === 'sw' ? 'sw' : 'en';
    }
    return COPY[lang] || COPY.en;
  }

  function link(href, text, modifier) {
    return '<a class="footer__link' + (modifier ? ' ' + modifier : '') + '" href="' + href + '">' + text + '</a>';
  }

  function render() {
    var c = copy();
    var year = new Date().getFullYear();
    var wa = 'https://wa.me/254705023432?text=' + encodeURIComponent(c.waText);

    host.innerHTML =
      '<div class="container">' +
        '<div class="footer__top">' +
          '<div class="footer__brand">' +
            '<a class="brand" href="/">' +
              '<span class="brand__mark" aria-hidden="true">THC</span>' +
              '<span class="brand__text">' +
                '<span class="brand__name">Thomas Hondo Chacha</span>' +
                '<span class="brand__role">' + c.role + '</span>' +
              '</span>' +
            '</a>' +
            '<p class="footer__kicker">' + c.kicker + '</p>' +
            '<p class="footer__description">' + c.description + '</p>' +
            '<p class="footer__status">' + c.status + '</p>' +
            '<div class="footer__actions">' +
              '<a class="button button--primary" href="' + wa + '" target="_blank" rel="noopener noreferrer" data-track="footer-whatsapp">' + c.ctaWhatsapp + '</a>' +
              '<a class="button button--ghost" href="/services.html">' + c.ctaServices + '</a>' +
            '</div>' +
          '</div>' +
          '<nav class="footer-nav" aria-label="' + c.explore + '">' +
            '<h2 class="footer__heading">' + c.explore + '</h2>' +
            '<div class="footer__links">' +
              link('/', c.home) + link('/about.html', c.about) + link('/projects.html', c.projects) +
              link('/blog.html', c.blog) + link('/services.html', c.services) +
              link('/proposal.html', c.proposal) + link('/audit.html', c.audit) +
              link('/contact.html', c.contact) +
            '</div>' +
          '</nav>' +
          '<nav class="footer-nav" aria-label="' + c.services + '">' +
            '<h2 class="footer__heading">' + c.services + '</h2>' +
            '<div class="footer__links">' +
              link('/services.html#packages', c.starter) + link('/services.html#packages', c.business) +
              link('/services.html#packages', c.commerce) + link('/services.html#packages', c.custom) +
              link('/audit.html', c.freeAudit) + link('/proposal.html', c.instantProposal) +
            '</div>' +
          '</nav>' +
          '<div class="footer-contact">' +
            '<h2 class="footer__heading">' + c.contact + '</h2>' +
            '<div class="footer__contact">' +
              '<a class="footer__contact-link" href="tel:+254705023432">' + c.call + '</a>' +
              '<a class="footer__contact-link" href="mailto:thomashondochacha@gmail.com">' + c.email + '</a>' +
              '<a class="footer__contact-link" href="' + wa + '" target="_blank" rel="noopener noreferrer">' + c.whatsapp + '</a>' +
              '<span class="footer__contact-link footer__contact-link--static">' + c.location + '</span>' +
            '</div>' +
            '<div class="footer__payment">' +
              '<strong>' + c.paymentTitle + '</strong>' +
              '<span>' + c.paymentText + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="footer__middle">' +
          '<p class="footer__promise">' + c.promise + '</p>' +
        '</div>' +
        '<div class="footer__bottom">' +
          '<div class="footer__legal">' +
            '<p>&copy; ' + year + ' Thomas Hondo Chacha. ' + c.rights + '</p>' +
            '<p>' + c.built + '</p>' +
            '<p class="footer__privacy">' + c.privacy + '</p>' +
          '</div>' +
          '<a class="back-to-top" href="#top">' + c.backToTop + ' <span aria-hidden="true">&uarr;</span></a>' +
        '</div>' +
      '</div>';
  }

  document.addEventListener('thc:languagechange', render);
  render();
})();
