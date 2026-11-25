/* ==========================================================================
   Thomas Hondo Chacha — instant project scope & proposal generator
   100% client-side. No data is stored or sent; the WhatsApp link is assembled
   from the current form state and the document is rendered for window.print().
   ========================================================================== */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "254705023432";
  var PACKAGE_KEYS = ["starter", "business", "commerce", "custom"];
  var BRIEF_SELECTS = {
    need: [
      ["new", "needNew"], ["redesign", "needRedesign"], ["commerce", "needCommerce"],
      ["app", "needApp"], ["booking", "needBooking"], ["other", "needOther"]
    ],
    timeline: [
      ["asap", "timelineAsap"], ["month", "timelineMonth"],
      ["quarter", "timelineQuarter"], ["flexible", "timelineFlexible"]
    ],
    contact_method: [
      ["whatsapp", "contactWa"], ["phone", "contactPhone"], ["email", "contactEmail"]
    ]
  };

  var COPY = {
    en: {
      ui: {
        eyebrow: "Live-scoped proposal",
        title: "Built by one engineer. <em>Approved by you.</em>",
        lede: "Start with live evidence, choose a package, add what you need, and get a formal proposal you can print or send on WhatsApp. Prices shown are starting points — the final quote is confirmed after a short brief.",
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
        note: "Your details are saved only when you click “Send this proposal to Thomas”. Otherwise the proposal is generated locally in your browser.",
        print: "Download / Print PDF Proposal",
        whatsapp: "Confirm & discuss on WhatsApp",
        powerKicker: "Built different",
        powerTitle: "One engineer. One accountable owner. No hand-offs.",
        powerBody: "You are not buying a template from a marketplace. Thomas diagnoses the real problem, shows you the live proof, builds the fix and hands over a working system you can measure.",
        power1Title: "Proof before promise",
        power1Body: "Live audit and real evidence, not a polished screenshot.",
        power2Title: "One point of contact",
        power2Body: "You talk directly to the engineer doing the work.",
        power3Title: "Built to convert",
        power3Body: "WhatsApp enquiries, speed and bilingual copy from day one.",
        power4Title: "Measured handover",
        power4Body: "Testing, a written scope and a support window after launch.",
        powerFoot: "No subcontractors. No guesswork. No vanity metrics.",
        powerLink: "Run a live website check",
        briefTitle: "Tell me what you are building",
        briefLede: "A few practical details help me quote the real work, not a guess.",
        industryLabel: "Business / industry",
        industryPlaceholder: "e.g. Hotel, school, retail shop",
        currentSiteLabel: "Current website",
        currentSitePlaceholder: "example.co.ke",
        needLabel: "What do you need?",
        needNew: "A new website",
        needRedesign: "Redesign / improve my current site",
        needCommerce: "Online shop with M-Pesa",
        needApp: "Web app or customer portal",
        needBooking: "Booking or enquiry system",
        needOther: "Something else",
        sitePagesLabel: "Approx. number of pages",
        timelineLabel: "When do you want to start?",
        timelineAsap: "As soon as possible",
        timelineMonth: "Within a month",
        timelineQuarter: "In 2–3 months",
        timelineFlexible: "I am flexible",
        contactMethodLabel: "How should Thomas reply?",
        contactWa: "WhatsApp",
        contactPhone: "Phone call",
        contactEmail: "Email",
        goalsLabel: "What should this project achieve?",
        goalsPlaceholder: "e.g. More WhatsApp enquiries, online bookings, faster loading, a clean brand image...",
        emailLabel: "Email address",
        emailPlaceholder: "you@business.co.ke",
        phoneLabel: "Phone / WhatsApp",
        phonePlaceholder: "+254712345678",
        consentLabel: "I agree that Thomas may contact me about this proposal.",
        sendLabel: "Send this proposal to Thomas",
        sending: "Saving…",
        sent: "Saved. Thomas will see it in Submissions.",
        needName: "Enter the client or company name.",
        needContact: "Enter the contact person's name.",
        needEmail: "Enter a valid email address.",
        needPhone: "Enter a valid phone number.",
        needConsent: "Confirm that you agree to be contacted.",
        sendError: "Could not save right now. Please use the WhatsApp button instead."
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
        paymentText: "M-Pesa Buy Goods Till 8729928 · KCB Bank Business No. 522522, Account 1321947844 · Send Money 0705023432 — Thomas Hondo Chacha.",
        paymentNote: "Prices are per issue and confirmed in writing before work starts. Pay using the M-Pesa or bank details on this site after scope is agreed. Thomas confirms payment manually; automatic checkout is coming soon. No auto-debit, gateway or unlock flow.",
        investmentLabel: "Total investment",
        fromLabel: "From",
        fromInline: "from",
        commonDeliverable: "Written scope, testing, handover and a support period",
        fineprint: "The prices above are starting points for a defined scope, not fixed quotes. After a short conversation you receive a written scope and a final figure before any work begins.",
        foot: "Thomas Hondo Chacha · Software Engineer · Kenya · thomashondochacha@gmail.com · +254 705 023 432",
        notProvided: "To be confirmed",
        none: "No optional add-ons selected.",
        auditTitle: "Website audit snapshot",
        auditScore: "Live score",
        auditIssues: "Issues found",
        powerKicker: "Why this proposal is different",
        powerTitle: "One engineer. One accountable owner. No hand-offs.",
        powerBody: "This scope is prepared after live diagnosis, not from a generic template. The same engineer who writes the proposal builds, tests and hands over the work.",
        powerItems: [
          "Live proof before any promise",
          "Direct access to the engineer doing the work",
          "Built for enquiries, speed and bilingual users",
          "Written scope, testing and support after launch"
        ],
        briefTitle: "Client brief",
        industry: "Business / industry",
        currentWebsite: "Current website",
        need: "Main need",
        sitePages: "Approx. pages",
        timeline: "Preferred start",
        contactMethod: "Reply via",
        goals: "What success looks like"
      },
      wa: {
        intro: "Hello Thomas, I generated this project scope on your website and would like to discuss it.",
        client: "Client / company",
        contact: "Contact person",
        package: "Package",
        audit: "Website audit",
        addons: "Add-ons",
        scope: "Scope",
        timeline: "Timeline",
        total: "Indicative total",
        none: "None",
        closing: "Please confirm the final scope and price.",
        brief: "Project brief",
        industry: "Business",
        currentWebsite: "Current website",
        need: "Need",
        sitePages: "Pages",
        timeline: "Start",
        contactMethod: "Reply via",
        goals: "Goals"
      }
    },

    sw: {
      ui: {
        eyebrow: "Pendekezo lenye ushahidi halisi",
        title: "Imejengwa na mhandisi mmoja. <em>Wewe unaidhinisha.</em>",
        lede: "Anza na ushahidi halisi, chagua kifurushi, ongeza unachohitaji, na upate pendekezo rasmi unaloweza kuchapisha au kutuma kwa WhatsApp. Bei zilizoonyeshwa ni za kuanzia — bei ya mwisho huthibitishwa baada ya maelezo mafupi.",
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
        note: "Maelezo yako huhifadhiwa tu unapobonyeza “Tuma pendekezo hili kwa Thomas”. Vinginevyo pendekezo linatolewa ndani ya kivinjari chako.",
        print: "Pakua / Chapisha Pendekezo la PDF",
        whatsapp: "Thibitisha na ujadili kwa WhatsApp",
        powerKicker: "Imejengwa tofauti",
        powerTitle: "Mhandisi mmoja. Mtu mmoja anayewajibika. Hakuna kukabidhiwa kwa wengine.",
        powerBody: "Hununui template kutoka sokoni. Thomas hutambua tatizo halisi, hukuonyesha ushahidi halisi, hujenga suluhisho na hukabidhi mfumo unaofanya kazi na unaopimika.",
        power1Title: "Ushahidi kabla ya ahadi",
        power1Body: "Audit halisi na ushahidi wa moja kwa moja, si picha iliyopambwa.",
        power2Title: "Mtu mmoja wa mawasiliano",
        power2Body: "Unazungumza moja kwa moja na mhandisi anayefanya kazi.",
        power3Title: "Imejengwa kuleta wateja",
        power3Body: "WhatsApp, kasi na maandishi ya lugha mbili tangu siku ya kwanza.",
        power4Title: "Kabidhiwa linalopimika",
        power4Body: "Upimaji, upeo ulioandikwa na muda wa usaidizi baada ya kuzindua.",
        powerFoot: "Hakuna wakandarasi wa chini. Hakuna nadhani. Hakuna takwimu za bandia.",
        powerLink: "Fanya ukaguzi halisi wa tovuti",
        briefTitle: "Niambia unachojenga",
        briefLede: "Maelezo machache ya vitendo hunisaidia kutoa bei ya kazi halisi, si nadhani.",
        industryLabel: "Biashara / sekta",
        industryPlaceholder: "mf. Hoteli, shule, duka la rejareja",
        currentSiteLabel: "Tovuti ya sasa",
        currentSitePlaceholder: "example.co.ke",
        needLabel: "Unahitaji nini?",
        needNew: "Tovuti mpya",
        needRedesign: "Kuboresha tovuti iliyopo",
        needCommerce: "Duka la mtandaoni lenye M-Pesa",
        needApp: "Web app au portal ya wateja",
        needBooking: "Mfumo wa kuweka nafasi au maombi",
        needOther: "Kitu kingine",
        sitePagesLabel: "Idadi takriban ya kurasa",
        timelineLabel: "Unataka kuanza lini?",
        timelineAsap: "Haraka iwezekanavyo",
        timelineMonth: "Ndani ya mwezi",
        timelineQuarter: "Baada ya miezi 2–3",
        timelineFlexible: "Sina haraka sana",
        contactMethodLabel: "Thomas akujibu vipi?",
        contactWa: "WhatsApp",
        contactPhone: "Simu",
        contactEmail: "Barua pepe",
        goalsLabel: "Mradi huu unapaswa kufanikisha nini?",
        goalsPlaceholder: "mf. Maombi zaidi ya WhatsApp, kuweka nafasi mtandaoni, kasi zaidi, picha safi ya biashara...",
        emailLabel: "Barua pepe",
        emailPlaceholder: "wewe@biashara.co.ke",
        phoneLabel: "Simu / WhatsApp",
        phonePlaceholder: "+254712345678",
        consentLabel: "Nakubali Thomas aniwasiliane kuhusu pendekezo hili.",
        sendLabel: "Tuma pendekezo hili kwa Thomas",
        sending: "Inahifadhi…",
        sent: "Imehifadhiwa. Thomas ataiona kwenye Submissions.",
        needName: "Weka jina la mteja au kampuni.",
        needContact: "Weka jina la mtu wa mawasiliano.",
        needEmail: "Weka barua pepe sahihi.",
        needPhone: "Weka namba sahihi ya simu.",
        needConsent: "Thibitisha kuwa unakubali kuwasiliana naye.",
        sendError: "Imeshindwa kuhifadhi kwa sasa. Tafadhali tumia kitufe cha WhatsApp."
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
        paymentText: "M-Pesa Lipa Bidhaa Till 8729928 · KCB Bank Biashara Na. 522522, Akaunti 1321947844 · Tuma Pesa 0705023432 — Thomas Hondo Chacha.",
        paymentNote: "Bei ni kwa kila suala na huthibitishwa kwa maandishi kabla ya kazi kuanza. Lipa kwa kutumia maelezo ya M-Pesa au benki yaliyopo kwenye tovuti hii baada ya kukubaliana kuhusu kazi. Thomas anathibitisha malipo kwa mkono; malipo ya moja kwa moja yanakuja hivi karibuni. Hakuna utozaji otomatiki, lango wala mfumo wa kufungua baada ya malipo.",
        investmentLabel: "Jumla ya uwekezaji",
        fromLabel: "Kuanzia",
        fromInline: "kuanzia",
        commonDeliverable: "Maelezo ya kazi yaliyoandikwa, upimaji, makabidhiano na kipindi cha msaada",
        fineprint: "Bei zilizo juu ni mahali pa kuanzia kwa kazi iliyoelezwa wazi, si bei zisizobadilika. Baada ya mazungumzo mafupi unapokea maelezo ya kazi na bei ya mwisho kabla kazi yoyote kuanza.",
        foot: "Thomas Hondo Chacha · Mhandisi wa Programu · Kenya · thomashondochacha@gmail.com · +254 705 023 432",
        notProvided: "Bado kuthibitishwa",
        none: "Hakuna huduma za ziada zilizoteuliwa.",
        auditTitle: "Matokeo ya uchambuzi wa tovuti",
        auditScore: "Alama halisi",
        auditIssues: "Matatizo yaliyopatikana",
        powerKicker: "Kwa nini pendekezo hili ni tofauti",
        powerTitle: "Mhandisi mmoja. Mtu mmoja anayewajibika. Hakuna kukabidhiwa kwa wengine.",
        powerBody: "Upeo huu umeandaliwa baada ya uchambuzi halisi, si kutoka kwenye template ya jumla. Mhandisi yule yule aliyeandika pendekezo hujenga, hupima na hukabidhi kazi.",
        powerItems: [
          "Ushahidi halisi kabla ya ahadi yoyote",
          "Mawasiliano ya moja kwa moja na mhandisi anayefanya kazi",
          "Imejengwa kwa wateja, kasi na watumiaji wa lugha mbili",
          "Upeo ulioandikwa, upimaji na usaidizi baada ya kuzindua"
        ],
        briefTitle: "Maelezo ya mteja",
        industry: "Biashara / sekta",
        currentWebsite: "Tovuti ya sasa",
        need: "Hitaji kuu",
        sitePages: "Idadi ya kurasa",
        timeline: "Kuanza lini",
        contactMethod: "Ajibu kupitia",
        goals: "Mafanikio yanaonekana vipi"
      },
      wa: {
        intro: "Hujambo Thomas, nimetayarisha upeo wa mradi kwenye tovuti yako na ningependa kujadili.",
        client: "Mteja / kampuni",
        contact: "Mtu wa mawasiliano",
        package: "Kifurushi",
        audit: "Uchambuzi wa tovuti",
        addons: "Huduma za ziada",
        scope: "Upeo",
        timeline: "Muda",
        total: "Jumla ya makadirio",
        none: "Hakuna",
        closing: "Tafadhali thibitisha upeo na bei ya mwisho.",
        brief: "Maelezo ya mradi",
        industry: "Biashara",
        currentWebsite: "Tovuti ya sasa",
        need: "Hitaji",
        sitePages: "Kurasa",
        timeline: "Kuanza",
        contactMethod: "Jibu kupitia",
        goals: "Malengo"
      }
    }
  };

  function language() {
    return window.Language && window.Language.get() === "sw" ? "sw" : "en";
  }

  function copy() {
    return COPY[language()];
  }

  function optionLabel(name, value, c) {
    var options = BRIEF_SELECTS[name] || [];
    for (var i = 0; i < options.length; i += 1) {
      if (options[i][0] === value) return c.ui[options[i][1]] || value;
    }
    return value || c.doc.notProvided;
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

  function listItems(items) {
    return items.map(function (item) { return "<li>" + escapeHtml(item) + "</li>"; }).join("");
  }

  function fieldValue(form, name) {
    var field = form.elements.namedItem(name);
    return field ? String(field.value || "").trim() : "";
  }

  function selectedState(form) {
    var c = copy();
    var packageKey = form.elements.namedItem("package").value;
    if (PACKAGE_KEYS.indexOf(packageKey) === -1) packageKey = "starter";

    var deliverables = c.packages[packageKey].deliverables.concat([c.doc.commonDeliverable]);
    var total = c.packages[packageKey].price;

    return {
      client: String(form.elements.namedItem("client").value || "").trim(),
      contact: String(form.elements.namedItem("contact").value || "").trim(),
      packageKey: packageKey,
      deliverables: deliverables,
      total: total,
      industry: fieldValue(form, "industry"),
      currentSite: fieldValue(form, "current_site"),
      need: fieldValue(form, "need"),
      sitePages: fieldValue(form, "site_pages"),
      timeline: fieldValue(form, "timeline"),
      contactMethod: fieldValue(form, "contact_method"),
      goals: fieldValue(form, "goals"),
      auditDomain: form.dataset.auditDomain || "",
      auditScore: form.dataset.auditScore || "",
      auditIssues: form.dataset.auditIssues || ""
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

    var auditPoints = state.auditIssues.split("|").map(function (issue) {
      return issue.trim();
    }).filter(Boolean);
    var auditBlock = state.auditDomain
      ? '<div class="proposal-document__block"><h3>' + escapeHtml(doc.auditTitle) + '</h3>' +
        '<p class="proposal-document__line"><strong>' + escapeHtml(state.auditDomain) + '</strong> — ' +
        escapeHtml(doc.auditScore) + ': ' + escapeHtml(state.auditScore || "0") + '/100</p>' +
        (auditPoints.length ? '<ul>' + listItems(auditPoints) + '</ul>' : '') + '</div>'
      : '';

    var powerBlock =
      '<div class="proposal-document__power">' +
        '<span class="proposal-document__power-kicker">' + escapeHtml(doc.powerKicker) + '</span>' +
        '<h3>' + escapeHtml(doc.powerTitle) + '</h3>' +
        '<p>' + escapeHtml(doc.powerBody) + '</p>' +
        '<ul>' + listItems(doc.powerItems) + '</ul>' +
      '</div>';

    var briefRows = [
      [doc.industry, state.industry],
      [doc.currentWebsite, state.currentSite],
      [doc.need, optionLabel("need", state.need, c)],
      [doc.sitePages, state.sitePages],
      [doc.timeline, optionLabel("timeline", state.timeline, c)],
      [doc.contactMethod, optionLabel("contact_method", state.contactMethod, c)]
    ];
    var briefBlock =
      '<div class="proposal-document__block proposal-document__brief"><h3>' + escapeHtml(doc.briefTitle) + '</h3>' +
        '<div class="proposal-document__brief-grid">' + briefRows.map(function (row) {
          return '<div><span>' + escapeHtml(row[0]) + '</span><strong>' +
            escapeHtml(row[1] || doc.notProvided) + '</strong></div>';
        }).join('') + '</div>' +
        (state.goals ? '<p class="proposal-document__goals"><span>' + escapeHtml(doc.goals) +
          ':</span> ' + escapeHtml(state.goals) + '</p>' : '') +
      '</div>';

    var summaryRows =
      '<tr><th scope="row">' + escapeHtml(doc.packageLabel) + '</th><td>' + money(pkg.price) + '</td></tr>';

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
      powerBlock +
      auditBlock +
      briefBlock +
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
      '',
      c.wa.brief + ':',
      '- ' + c.wa.industry + ': ' + (state.industry || c.doc.notProvided),
      '- ' + c.wa.currentWebsite + ': ' + (state.currentSite || c.doc.notProvided),
      '- ' + c.wa.need + ': ' + optionLabel("need", state.need, c),
      '- ' + c.wa.sitePages + ': ' + (state.sitePages || c.doc.notProvided),
      '- ' + c.wa.timeline + ': ' + optionLabel("timeline", state.timeline, c),
      '- ' + c.wa.contactMethod + ': ' + optionLabel("contact_method", state.contactMethod, c)
    ];

    if (state.goals) lines.push('- ' + c.wa.goals + ': ' + state.goals);

    if (state.auditDomain) {
      lines.push(c.wa.audit + ': ' + state.auditDomain + ' — ' + state.auditScore + '/100');
      if (state.auditIssues) lines.push(c.doc.auditIssues + ': ' + state.auditIssues);
    }

    lines.push(c.wa.scope + ':');
    state.deliverables.forEach(function (item) { lines.push('- ' + item); });
    lines.push('');
    lines.push(c.wa.timeline + ': ' + pkg.timeline);
    lines.push(c.wa.total + ': ' + c.doc.fromInline + ' ' + money(state.total));
    lines.push('');
    lines.push(c.wa.closing);
    return lines.join('\n');
  }

  function sendProposal(form) {
    var c = copy();
    var button = document.getElementById("proposal-send");
    var feedback = document.getElementById("proposal-send-feedback");
    var state = selectedState(form);
    var fullName = state.contact || state.client;
    var email = fieldValue(form, "email");
    var phone = fieldValue(form, "phone");
    var consent = form.elements.namedItem("consent");
    var honeypot = document.getElementById("proposal-honeypot");

    if (state.client.length < 2) {
      feedback.textContent = c.ui.needName;
      form.elements.namedItem("client").focus();
      return;
    }
    if (fullName.length < 2) {
      feedback.textContent = c.ui.needContact;
      form.elements.namedItem("contact").focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) {
      feedback.textContent = c.ui.needEmail;
      form.elements.namedItem("email").focus();
      return;
    }
    if (!/^\+?[0-9][0-9\s()-]{6,24}$/.test(phone)) {
      feedback.textContent = c.ui.needPhone;
      form.elements.namedItem("phone").focus();
      return;
    }
    if (!consent || !consent.checked) {
      feedback.textContent = c.ui.needConsent;
      consent.focus();
      return;
    }

    button.disabled = true;
    feedback.textContent = c.ui.sending;

    fetch("/api/submit-contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName.slice(0, 120),
        email: email.slice(0, 200),
        phone: phone.slice(0, 32),
        company_website: honeypot ? honeypot.value : "",
        project_type: "Proposal request",
        project_description: ("Proposal request from proposal.html.\n\n" + whatsappMessage(form)).slice(0, 4000),
        preferred_contact: state.contactMethod || "whatsapp"
      })
    }).then(function (response) {
      if (!response.ok) throw new Error("bad response");
      return response.json();
    }).then(function () {
      feedback.textContent = c.ui.sent;
    }).catch(function () {
      feedback.textContent = c.ui.sendError;
    }).then(function () {
      button.disabled = false;
    }, function () {
      button.disabled = false;
    });
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
    var saved = form.dataset.prefillPackage;
    if (PACKAGE_KEYS.indexOf(saved) !== -1) {
      select.value = saved;
      delete form.dataset.prefillPackage;
    }

    Object.keys(BRIEF_SELECTS).forEach(function (name) {
      var target = form.elements.namedItem(name);
      if (!target) return;
      var currentValue = target.value;
      target.innerHTML = BRIEF_SELECTS[name].map(function (option) {
        return '<option value="' + option[0] + '">' + escapeHtml(c.ui[option[1]]) + '</option>';
      }).join('');
      target.value = currentValue || BRIEF_SELECTS[name][0][0];
    });
  }

  function update(form, documentTarget, whatsappLink) {
    applyCopy(form);
    renderDocument(form, documentTarget);
    document.dispatchEvent(new CustomEvent("thc:proposaltotal", {
      detail: { total: selectedState(form).total }
    }));
    whatsappLink.href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(whatsappMessage(form));
  }

  function applyPrefill(form) {
    if (!window.URLSearchParams) return;
    var params = new URLSearchParams(window.location.search);
    if (!params.toString()) return;

    var setField = function (name, value, max) {
      var field = form.elements.namedItem(name);
      if (field && value) field.value = String(value).slice(0, max || 100);
    };

    setField("client", params.get("client"), 100);
    setField("contact", params.get("contact"), 100);

    var requestedPackage = String(params.get("package") || "");
    if (PACKAGE_KEYS.indexOf(requestedPackage) !== -1) {
      form.dataset.prefillPackage = requestedPackage;
      setField("package", requestedPackage, 30);
    }

    form.dataset.auditDomain = String(params.get("domain") || "").slice(0, 200);
    form.dataset.auditScore = String(params.get("score") || "").slice(0, 10);
    form.dataset.auditIssues = String(params.get("issues") || "").slice(0, 1200);
  }

  function init() {
    var form = document.getElementById("proposal-form");
    var documentTarget = document.getElementById("proposal-document");
    var whatsappLink = document.getElementById("proposal-whatsapp");
    var printButton = document.getElementById("proposal-print");
    if (!form || !documentTarget || !whatsappLink) return;

    form.addEventListener("input", function () { update(form, documentTarget, whatsappLink); });
    form.addEventListener("change", function () { update(form, documentTarget, whatsappLink); });

    var sendButton = document.getElementById("proposal-send");
    if (sendButton) sendButton.addEventListener("click", function () { sendProposal(form); });

    document.addEventListener("thc:languagechange", function () {
      update(form, documentTarget, whatsappLink);
    });

    if (printButton) {
      printButton.addEventListener("click", function () {
        if (window.thcTrack) window.thcTrack("cta_click", { placement: "proposal-print" });
        window.print();
      });
    }

    applyPrefill(form);
    update(form, documentTarget, whatsappLink);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
