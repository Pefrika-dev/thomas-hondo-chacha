/* ==========================================================================
   Thomas Hondo Chacha — instant project scope & proposal generator
   100% client-side. No data is stored or sent; the WhatsApp link is assembled
   from the current form state and the document is rendered for window.print().
   ========================================================================== */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "254705023432";
  var PACKAGE_KEYS = ["starter", "business", "commerce", "custom"];
  var ADDON_KEYS = ["domain", "mpesa", "booking", "copy"];

  var COPY = {
    en: {
      ui: {
        eyebrow: "Instant scope",
        title: "Scope it now. <em>Discuss it next.</em>",
        lede: "Choose a starting package, add the extras you need, and get a formal proposal you can print or send on WhatsApp. Prices shown are starting points — the final quote is confirmed after a short brief.",
        sideMeta1: "No account needed",
        sideMeta2: "Runs in your browser",
        formKicker: "01 / Your project",
        formTitle: "Build your scope",
        formLede: "Two details and a package are enough to start. Everything is calculated instantly on this page.",
        clientLabel: "Client / company name",
        clientPlaceholder: "e.g. Mama Fatha Enterprises",
        contactLabel: "Contact person",
        contactPlaceholder: "e.g. Amina Otieno",
        packageLabel: "Project package",
        packageHint: "Starting prices. Final scope and price are confirmed in writing.",
        addonsLegend: "Optional add-ons",
        addonsHint: "Tick anything you need. The total updates as you choose.",
        domainTitle: "Domain & hosting",
        domainHint: "KSh 10,000 a year",
        domainPrice: "KSh 10,000 / year",
        mpesaTitle: "M-Pesa Daraja integration",
        mpesaHint: "Outside the Commerce package",
        mpesaPrice: "KSh 30,000",
        bookingTitle: "Booking system",
        bookingHint: "KSh 25,000",
        bookingPrice: "KSh 25,000",
        copyTitle: "Copywriting",
        copyHint: "KSh 3,000 per page",
        copyPrice: "KSh 3,000 / page",
        pagesLabel: "Pages to write",
        pagesHint: "KSh 3,000 per page",
        note: "Nothing is stored or sent from this page. The proposal is generated locally in your browser.",
        print: "Download / Print PDF Proposal",
        whatsapp: "Confirm & discuss on WhatsApp"
      },
      packages: {
        starter: {
          name: "Starter — Website",
          description: "A clean, fast website that makes your business look credible and sends enquiries straight to your WhatsApp.",
          price: 25000,
          timeline: "About two weeks from the day your content and access are ready.",
          deliverables: [
            "4–5 mobile-first pages",
            "WhatsApp and contact form",
            "Basic SEO and fast loading",
            "One revision round"
          ]
        },
        business: {
          name: "Business — Website + Blog",
          description: "A custom site with a blog, English and Kiswahili, SEO and analytics, built to bring in enquiries month after month.",
          price: 55000,
          timeline: "Four to six weeks from the day your content and access are ready.",
          deliverables: [
            "Up to 10 custom pages",
            "Blog and content manager",
            "English and Kiswahili",
            "SEO, analytics and lead tracking"
          ]
        },
        commerce: {
          name: "Commerce — E-Commerce + M-Pesa",
          description: "Sell online with M-Pesa checkout, product management and an admin dashboard.",
          price: 120000,
          timeline: "Six to eight weeks from the day your content and access are ready.",
          deliverables: [
            "Product catalogue or shop",
            "M-Pesa (Daraja) checkout",
            "Order and product management",
            "Admin dashboard"
          ]
        },
        custom: {
          name: "Custom — Web App",
          description: "Booking systems, customer portals, dashboards and integrations, quoted after a written brief.",
          price: 150000,
          timeline: "Scheduled after the brief.",
          deliverables: [
            "Booking and enquiry systems",
            "Customer portals and dashboards",
            "Third-party integrations",
            "Quoted after a written brief"
          ]
        }
      },
      addons: {
        domain: { title: "Domain and hosting", price: 10000, deliverable: "Domain and hosting (KSh 10,000 a year)" },
        mpesa: { title: "M-Pesa Daraja integration", price: 30000, deliverable: "M-Pesa integration outside the Commerce package" },
        booking: { title: "Booking system", price: 25000, deliverable: "Booking system" },
        copy: { title: "Copywriting", price: 3000, deliverable: "Copywriting for {pages} page(s)" }
      },
      doc: {
        title: "Project scope & proposal",
        preparedFor: "Prepared for",
        preparedBy: "Prepared by",
        byName: "Thomas Hondo Chacha",
        byRole: "Software Engineer",
        dateLabel: "Date",
        packageLabel: "Selected package",
        scopeLabel: "Scope & deliverables",
        addonsLabel: "Optional add-ons",
        timelineLabel: "Estimated timeline",
        paymentLabel: "Payment terms",
        paymentText: "50% deposit to start and 50% before the site goes live.",
        paymentNote: "Projects above KSh 100,000 are split 40%, 30% and 30%. A 5% discount applies when the full amount is paid upfront.",
        investmentLabel: "Total investment",
        fromLabel: "From",
        fromInline: "from",
        commonDeliverable: "Written scope, testing, handover and a support period",
        fineprint: "The prices above are starting points for a defined scope, not fixed quotes. After a short conversation you receive a written scope and a final figure before any work begins.",
        foot: "Thomas Hondo Chacha · Software Engineer · Kenya · thomashondochacha@gmail.com · +254 705 023 432",
        notProvided: "To be confirmed",
        none: "No optional add-ons selected."
      },
      wa: {
        intro: "Hello Thomas, I generated this project scope on your website and would like to discuss it.",
        client: "Client / company",
        contact: "Contact person",
        package: "Package",
        addons: "Add-ons",
        scope: "Scope",
        timeline: "Timeline",
        total: "Indicative total",
        none: "None",
        closing: "Please confirm the final scope and price."
      }
    },

    sw: {
      ui: {
        eyebrow: "Upeo wa papo hapo",
        title: "Andaa upeo sasa. <em>Ujadili baadaye.</em>",
        lede: "Chagua kifurushi cha kuanzia, ongeza huduma unazohitaji, na upate pendekezo rasmi unaloweza kuchapisha au kutuma kwa WhatsApp. Bei zilizoonyeshwa ni za kuanzia — bei ya mwisho huthibitishwa baada ya maelezo mafupi.",
        sideMeta1: "Hakuna akaunti inayohitajika",
        sideMeta2: "Hufanya kazi kwenye kivinjari chako",
        formKicker: "01 / Mradi wako",
        formTitle: "Jenga upeo wako",
        formLede: "Maelezo mawili na kifurushi vinatosha kuanza. Kila kitu kinakokotolewa papo hapo hapa.",
        clientLabel: "Jina la mteja / kampuni",
        clientPlaceholder: "mf. Biashara ya Mama Fatha",
        contactLabel: "Mtu wa mawasiliano",
        contactPlaceholder: "mf. Amina Otieno",
        packageLabel: "Kifurushi cha mradi",
        packageHint: "Bei za kuanzia. Upeo na bei ya mwisho huthibitishwa kwa maandishi.",
        addonsLegend: "Huduma za ziada (hiari)",
        addonsHint: "Teua unachohitaji. Jumla hubadilika mara moja.",
        domainTitle: "Domain na hosting",
        domainHint: "KSh 10,000 kwa mwaka",
        domainPrice: "KSh 10,000 / mwaka",
        mpesaTitle: "Muunganisho wa M-Pesa Daraja",
        mpesaHint: "Nje ya kifurushi cha Mauzo",
        mpesaPrice: "KSh 30,000",
        bookingTitle: "Mfumo wa kuweka nafasi",
        bookingHint: "KSh 25,000",
        bookingPrice: "KSh 25,000",
        copyTitle: "Uandishi wa maudhui",
        copyHint: "KSh 3,000 kwa ukurasa",
        copyPrice: "KSh 3,000 / ukurasa",
        pagesLabel: "Idadi ya kurasa",
        pagesHint: "KSh 3,000 kwa ukurasa",
        note: "Hakuna kitu kinachohifadhiwa au kutumwa kutoka ukurasa huu. Pendekezo linatolewa ndani ya kivinjari chako.",
        print: "Pakua / Chapisha Pendekezo la PDF",
        whatsapp: "Thibitisha na ujadili kwa WhatsApp"
      },
      packages: {
        starter: {
          name: "Msingi — Tovuti",
          description: "Tovuti safi na yenye kasi inayofanya biashara yako ionekane ya kuaminika na kutumia maswali moja kwa moja kwenye WhatsApp yako.",
          price: 25000,
          timeline: "Takriban wiki mbili kuanzia siku maudhui na ufikiaji wako vikiwa tayari.",
          deliverables: [
            "Kurasa 4–5 zinazofaa simu",
            "WhatsApp na fomu ya mawasiliano",
            "Msingi wa SEO na upakiaji wa haraka",
            "Mzunguko mmoja wa marekebisho"
          ]
        },
        business: {
          name: "Biashara — Tovuti + Blogu",
          description: "Tovuti maalum yenye blogu, Kiingereza na Kiswahili, SEO na uchambuzi, iliyoundwa kuleta maswali mwezi hadi mwezi.",
          price: 55000,
          timeline: "Wiki nne hadi sita kuanzia siku maudhui na ufikiaji wako vikiwa tayari.",
          deliverables: [
            "Hadi kurasa 10 maalum",
            "Blogu na mfumo wa kusimamia maudhui",
            "Kiingereza na Kiswahili",
            "SEO, uchambuzi na ufuatiliaji wa maswali"
          ]
        },
        commerce: {
          name: "Mauzo — Biashara ya mtandaoni + M-Pesa",
          description: "Uza mtandaoni kwa malipo ya M-Pesa, usimamizi wa bidhaa na dashibodi ya msimamizi.",
          price: 120000,
          timeline: "Wiki sita hadi nane kuanzia siku maudhui na ufikiaji wako vikiwa tayari.",
          deliverables: [
            "Orodha ya bidhaa au duka",
            "Malipo ya M-Pesa (Daraja)",
            "Usimamizi wa oda na bidhaa",
            "Dashibodi ya msimamizi"
          ]
        },
        custom: {
          name: "Maalum — Mfumo wa wavuti",
          description: "Mifumo ya kuweka nafasi, lango la wateja, dashibodi na muunganisho wa mifumo mingine, bei hutolewa baada ya maelezo ya kazi.",
          price: 150000,
          timeline: "Hupangwa baada ya maelezo ya kazi.",
          deliverables: [
            "Mifumo ya kuweka nafasi na maswali",
            "Lango la wateja na dashibodi",
            "Muunganisho wa mifumo mingine",
            "Bei hutolewa baada ya maelezo ya kazi"
          ]
        }
      },
      addons: {
        domain: { title: "Domain na hosting", price: 10000, deliverable: "Domain na hosting (KSh 10,000 kwa mwaka)" },
        mpesa: { title: "Muunganisho wa M-Pesa Daraja", price: 30000, deliverable: "Muunganisho wa M-Pesa nje ya kifurushi cha Mauzo" },
        booking: { title: "Mfumo wa kuweka nafasi", price: 25000, deliverable: "Mfumo wa kuweka nafasi" },
        copy: { title: "Uandishi wa maudhui", price: 3000, deliverable: "Uandishi wa maudhui kwa kurasa {pages}" }
      },
      doc: {
        title: "Upeo wa mradi & pendekezo",
        preparedFor: "Liliandaliwa kwa",
        preparedBy: "Liliandaliwa na",
        byName: "Thomas Hondo Chacha",
        byRole: "Mhandisi wa Programu",
        dateLabel: "Tarehe",
        packageLabel: "Kifurushi kilichochaguliwa",
        scopeLabel: "Upeo na kazi za kutoa",
        addonsLabel: "Huduma za ziada",
        timelineLabel: "Muda unaokadiriwa",
        paymentLabel: "Masharti ya malipo",
        paymentText: "Asilimia 50 mwanzo na asilimia 50 kabla ya tovuti kuanza kufanya kazi.",
        paymentNote: "Miradi zaidi ya KSh 100,000 hugawanywa 40%, 30% na 30%. Punguzo la 5% hutolewa kwa malipo yote kabla ya kazi kuanza.",
        investmentLabel: "Jumla ya uwekezaji",
        fromLabel: "Kuanzia",
        fromInline: "kuanzia",
        commonDeliverable: "Maelezo ya kazi yaliyoandikwa, upimaji, makabidhiano na kipindi cha msaada",
        fineprint: "Bei zilizo juu ni mahali pa kuanzia kwa kazi iliyoelezwa wazi, si bei zisizobadilika. Baada ya mazungumzo mafupi unapokea maelezo ya kazi na bei ya mwisho kabla kazi yoyote kuanza.",
        foot: "Thomas Hondo Chacha · Mhandisi wa Programu · Kenya · thomashondochacha@gmail.com · +254 705 023 432",
        notProvided: "Bado kuthibitishwa",
        none: "Hakuna huduma za ziada zilizoteuliwa."
      },
      wa: {
        intro: "Hujambo Thomas, nimetayarisha upeo wa mradi kwenye tovuti yako na ningependa kujadili.",
        client: "Mteja / kampuni",
        contact: "Mtu wa mawasiliano",
        package: "Kifurushi",
        addons: "Huduma za ziada",
        scope: "Upeo",
        timeline: "Muda",
        total: "Jumla ya makadirio",
        none: "Hakuna",
        closing: "Tafadhali thibitisha upeo na bei ya mwisho."
      }
    }
  };

  function language() {
    return window.Language && window.Language.get() === "sw" ? "sw" : "en";
  }

  function copy() {
    return COPY[language()];
  }

  function money(value) {
    return "KSh " + Number(value).toLocaleString("en-KE");
  }

  function escapeHtml(value) {
    return String(value === null || typeof value === "undefined" ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function interpolate(text, values) {
    return String(text).replace(/\{([a-zA-Z0-9_]+)\}/g, function (match, key) {
      return Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match;
    });
  }

  function listItems(items) {
    return items.map(function (item) { return "<li>" + escapeHtml(item) + "</li>"; }).join("");
  }

  function addonQuantity(input) {
    var parsed = parseInt(input ? input.value : "1", 10);
    if (!Number.isFinite(parsed) || parsed < 1) return 1;
    return Math.min(parsed, 50);
  }

  function selectedState(form) {
    var c = copy();
    var packageKey = form.elements.namedItem("package").value;
    if (PACKAGE_KEYS.indexOf(packageKey) === -1) packageKey = "starter";

    var pagesInput = form.querySelector("#proposal-copy-pages");
    var selected = ADDON_KEYS.filter(function (key) {
      var field = form.elements.namedItem("addon-" + key);
      return Boolean(field && field.checked);
    });

    var rows = [];
    var deliverables = c.packages[packageKey].deliverables.concat([c.doc.commonDeliverable]);
    var total = c.packages[packageKey].price;

    selected.forEach(function (key) {
      var addon = c.addons[key];
      var amount = key === "copy" ? addon.price * addonQuantity(pagesInput) : addon.price;
      total += amount;
      rows.push({ label: addon.title, amount: amount });
      deliverables.push(interpolate(addon.deliverable, { pages: addonQuantity(pagesInput) }));
    });

    return {
      client: String(form.elements.namedItem("client").value || "").trim(),
      contact: String(form.elements.namedItem("contact").value || "").trim(),
      packageKey: packageKey,
      selected: selected,
      rows: rows,
      deliverables: deliverables,
      total: total
    };
  }

  function dateLabel() {
    return new Date().toLocaleDateString(language() === "sw" ? "sw-KE" : "en-KE", {
      day: "numeric", month: "long", year: "numeric"
    });
  }

  function renderDocument(form, target) {
    var c = copy();
    var doc = c.doc;
    var state = selectedState(form);
    var pkg = c.packages[state.packageKey];

    var summaryRows =
      '<tr><th scope="row">' + escapeHtml(doc.packageLabel) + '</th><td>' + money(pkg.price) + '</td></tr>' +
      state.rows.map(function (row) {
        return '<tr><th scope="row">' + escapeHtml(row.label) + '</th><td>' + money(row.amount) + '</td></tr>';
      }).join('');

    var addonBlock = state.rows.length
      ? '<div class="proposal-document__block"><h3>' + escapeHtml(doc.addonsLabel) + '</h3><ul>' + listItems(state.rows.map(function (row) { return row.label; })) + '</ul></div>'
      : '';

    target.innerHTML =
      '<div class="proposal-document__head">' +
        '<div class="proposal-document__brand">' +
          '<span class="proposal-document__mark" aria-hidden="true">THC</span>' +
          '<span><span class="proposal-document__brand-name">' + escapeHtml(doc.byName) + '</span>' +
          '<span class="proposal-document__brand-role">' + escapeHtml(doc.byRole) + '</span></span>' +
        '</div>' +
        '<div class="proposal-document__date"><span>' + escapeHtml(doc.dateLabel) + '</span><strong>' + escapeHtml(dateLabel()) + '</strong></div>' +
      '</div>' +
      '<h2>' + escapeHtml(doc.title) + '</h2>' +
      '<div class="proposal-document__block">' +
        '<h3>' + escapeHtml(doc.preparedFor) + ' / ' + escapeHtml(doc.preparedBy) + '</h3>' +
        '<div class="proposal-document__parties">' +
          '<div><span class="proposal-document__label">' + escapeHtml(doc.preparedFor) + '</span>' +
          '<strong class="proposal-document__value">' + escapeHtml(state.client || doc.notProvided) + '</strong>' +
          '<span class="proposal-document__label proposal-document__label--spaced">' + escapeHtml(c.wa.contact) + '</span>' +
          '<span class="proposal-document__value">' + escapeHtml(state.contact || doc.notProvided) + '</span></div>' +
          '<div><span class="proposal-document__label">' + escapeHtml(doc.preparedBy) + '</span>' +
          '<strong class="proposal-document__value">' + escapeHtml(doc.byName) + '</strong>' +
          '<span class="proposal-document__value">' + escapeHtml(doc.byRole) + '</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="proposal-document__block"><h3>' + escapeHtml(doc.packageLabel) + '</h3>' +
        '<p class="proposal-document__line"><strong>' + escapeHtml(pkg.name) + '</strong> — ' + escapeHtml(doc.fromInline) + ' ' + money(pkg.price) + '</p>' +
        '<p class="proposal-document__desc">' + escapeHtml(pkg.description) + '</p></div>' +
      '<div class="proposal-document__block"><h3>' + escapeHtml(doc.scopeLabel) + '</h3><ul>' + listItems(state.deliverables) + '</ul></div>' +
      addonBlock +
      '<div class="proposal-document__block"><h3>' + escapeHtml(doc.timelineLabel) + '</h3><p class="proposal-document__line">' + escapeHtml(pkg.timeline) + '</p></div>' +
      '<div class="proposal-document__block"><h3>' + escapeHtml(doc.paymentLabel) + '</h3>' +
        '<p class="proposal-document__line">' + escapeHtml(doc.paymentText) + '</p>' +
        '<p class="proposal-document__payment-note">' + escapeHtml(doc.paymentNote) + '</p></div>' +
      '<div class="proposal-document__block"><h3>' + escapeHtml(doc.investmentLabel) + '</h3>' +
        '<table class="proposal-document__summary"><tbody>' + summaryRows + '</tbody></table>' +
        '<div class="proposal-document__total"><span>' + escapeHtml(doc.investmentLabel) + ' (' + escapeHtml(doc.fromInline) + ')</span>' +
        '<strong>' + money(state.total) + '</strong></div>' +
        '<p class="proposal-document__fineprint">' + escapeHtml(doc.fineprint) + '</p></div>' +
      '<div class="proposal-document__foot">' + escapeHtml(doc.foot) + '</div>';
  }

  function whatsappMessage(form) {
    var c = copy();
    var state = selectedState(form);
    var pkg = c.packages[state.packageKey];
    var lines = [
      c.wa.intro,
      '',
      c.wa.client + ': ' + (state.client || c.doc.notProvided),
      c.wa.contact + ': ' + (state.contact || c.doc.notProvided),
      c.wa.package + ': ' + pkg.name + ' (' + c.doc.fromInline + ' ' + money(pkg.price) + ')',
      c.wa.addons + ': ' + (state.rows.length ? state.rows.map(function (row) { return row.label; }).join(', ') : c.wa.none),
      c.wa.scope + ':',
    ];
    state.deliverables.forEach(function (item) { lines.push('- ' + item); });
    lines.push('');
    lines.push(c.wa.timeline + ': ' + pkg.timeline);
    lines.push(c.wa.total + ': ' + c.doc.fromInline + ' ' + money(state.total));
    lines.push('');
    lines.push(c.wa.closing);
    return lines.join('\n');
  }

  function applyCopy(form) {
    var c = copy();
    document.querySelectorAll("[data-proposal-i18n]").forEach(function (element) {
      var value = c.ui[element.getAttribute("data-proposal-i18n")];
      if (typeof value === "string") element.textContent = value;
    });
    document.querySelectorAll("[data-proposal-i18n-html]").forEach(function (element) {
      var value = c.ui[element.getAttribute("data-proposal-i18n-html")];
      if (typeof value === "string") element.innerHTML = value;
    });
    document.querySelectorAll("[data-proposal-placeholder]").forEach(function (element) {
      var value = c.ui[element.getAttribute("data-proposal-placeholder")];
      if (typeof value === "string") element.setAttribute("placeholder", value);
    });
    document.querySelectorAll("[data-proposal-i18n-aria]").forEach(function (element) {
      var value = c.ui[element.getAttribute("data-proposal-i18n-aria")];
      if (typeof value === "string") element.setAttribute("aria-label", value);
    });

    var select = form.elements.namedItem("package");
    var current = select.value;
    select.innerHTML = PACKAGE_KEYS.map(function (key) {
      return '<option value="' + key + '">' + escapeHtml(c.packages[key].name + ' — ' + c.doc.fromLabel + ' ' + money(c.packages[key].price)) + '</option>';
    }).join('');
    if (PACKAGE_KEYS.indexOf(current) !== -1) select.value = current;
  }

  function update(form, documentTarget, whatsappLink) {
    applyCopy(form);
    renderDocument(form, documentTarget);
    whatsappLink.href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(whatsappMessage(form));

    ADDON_KEYS.forEach(function (key) {
      var field = form.elements.namedItem("addon-" + key);
      if (field && field.closest) {
        field.closest(".addon-option").classList.toggle("is-selected", Boolean(field.checked));
      }
    });

    var quantity = document.getElementById("proposal-copy-pages");
    var copyField = form.elements.namedItem("addon-copy");
    if (quantity && copyField) quantity.disabled = !copyField.checked;
  }

  function init() {
    var form = document.getElementById("proposal-form");
    var documentTarget = document.getElementById("proposal-document");
    var whatsappLink = document.getElementById("proposal-whatsapp");
    var printButton = document.getElementById("proposal-print");
    if (!form || !documentTarget || !whatsappLink) return;

    ADDON_KEYS.forEach(function (key) {
      var field = form.elements.namedItem("addon-" + key);
      if (field) {
        field.addEventListener("change", function () {
          update(form, documentTarget, whatsappLink);
        });
      }
    });

    form.addEventListener("input", function () { update(form, documentTarget, whatsappLink); });
    form.addEventListener("change", function () { update(form, documentTarget, whatsappLink); });

    document.addEventListener("thc:languagechange", function () {
      update(form, documentTarget, whatsappLink);
    });

    if (printButton) {
      printButton.addEventListener("click", function () {
        if (window.thcTrack) window.thcTrack("cta_click", { placement: "proposal-print" });
        window.print();
      });
    }

    update(form, documentTarget, whatsappLink);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
