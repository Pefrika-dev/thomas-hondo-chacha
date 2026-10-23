/* ==========================================================================
   Thomas Hondo Chacha — Bilingual interface
   Central English/Kiswahili translation dictionary and language controller.
   ========================================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "thc-language";
  var initialized = false;
  var currentLanguage = "en";

  var translations = {
    en: {
      language: {
        english: "English",
        swahili: "Kiswahili"
      },
      meta: {
        home: {
          title: "Thomas Hondo Chacha — Software Engineer & Web Developer",
          description: "Thomas Hondo Chacha is a software engineer in Kenya building modern websites, interactive web applications and practical digital solutions for businesses.",
          imageAlt: "Thomas Hondo Chacha — Software Engineer in Kenya"
        },
        about: {
          title: "About Thomas Hondo Chacha — Software Engineer in Kenya",
          description: "Learn about Thomas Hondo Chacha, a Kenyan software engineer focused on modern websites, interactive web applications and practical digital solutions.",
          imageAlt: "About Thomas Hondo Chacha, Software Engineer"
        },
        projects: {
          title: "Projects — Thomas Hondo Chacha, Software Engineer",
          description: "Selected website projects, demonstrations and interface concepts by Thomas Hondo Chacha, with honest project statuses and technical case studies.",
          imageAlt: "Selected projects by Thomas Hondo Chacha"
        },
        services: {
          title: "Services — Thomas Hondo Chacha, Software Engineer",
          description: "Website design, landing pages, web applications, redesigns, API integration and technical improvements from Thomas Hondo Chacha in Kenya.",
          imageAlt: "Software engineering services by Thomas Hondo Chacha"
        },
        contact: {
          title: "Contact — Thomas Hondo Chacha, Software Engineer",
          description: "Contact Thomas Hondo Chacha by phone, WhatsApp or email to discuss a website, web application or digital project.",
          imageAlt: "Contact Thomas Hondo Chacha"
        },
        notFound: {
          title: "Page not found — Thomas Hondo Chacha",
          description: "The page you are looking for could not be found. Return to the portfolio of Thomas Hondo Chacha, Software Engineer.",
          imageAlt: "Thomas Hondo Chacha"
        }
      },
      brand: {
        role: "Software Engineer"
      },
      a11y: {
        skip: "Skip to content",
        primaryNav: "Primary navigation",
        footerNav: "Footer navigation",
        breadcrumbs: "Breadcrumb",
        language: "Language",
        theme: "Colour theme",
        menuOpen: "Open menu",
        menuClose: "Close menu",
        heroVisual: "A visual snapshot of my software practice",
        selectedLanguage: "{language}, selected",
        switchToLanguage: "Switch to {language}",
        projectDialog: "Project case study",
        externalLink: "Opens in a new tab"
      },
      theme: {
        light: "Light mode",
        dark: "Dark mode"
      },
      nav: {
        home: "Home",
        about: "About",
        projects: "Projects",
        services: "Services",
        contact: "Contact",
        startProject: "Start a project"
      },
      common: {
        kenya: "Kenya",
        viewProjects: "View my projects",
        contactMe: "Contact me",
        viewAllProjects: "View all projects",
        discussProject: "Discuss your project",
        viewCaseStudy: "View case study",
        close: "Close",
        backToTop: "Back to top",
        call: "Call",
        callNumber: "Call 0705023432",
        whatsapp: "WhatsApp",
        email: "Email",
        phone: "Phone",
        location: "Location",
        languages: "Languages",
        focus: "Focus",
        available: "Open to project conversations",
        remote: "Working remotely",
        direct: "Direct communication",
        noLink: "No public link configured",
        illustrative: "Illustrative interface study",
        opensNewTab: "Opens in a new tab"
      },
      status: {
        demo: "Working demonstration",
        concept: "Concept design",
        development: "In development",
        live: "Live website"
      },
      projectType: {
        website: "Website",
        concept: "Concept"
      },
      home: {
        eyebrow: "Software engineer · Kenya",
        headline: "Turning ideas into <em>functional digital products.</em>",
        lede: "I design and develop modern websites and interactive web experiences that help businesses present themselves professionally and serve their customers more effectively.",
        primaryCta: "View My Projects",
        secondaryCta: "Contact Me",
        contactLabel: "Direct contact",
        figure: "Practice map",
        stageTagInterfaces: "Interfaces",
        stageTagSystems: "Systems",
        cap1: "Websites",
        cap2: "Web apps",
        cap3: "Integrations",
        floatLabel: "Current focus",
        floatText: "Building thoughtful web experiences.",
        metaBasedLabel: "Based in",
        metaBasedValue: "Kenya · EAT",
        metaFocusLabel: "Focus",
        metaFocusValue: "Websites & web applications",
        metaLanguagesLabel: "Languages",
        metaLanguagesValue: "English · Kiswahili",
        metaWorkLabel: "Working",
        metaWorkValue: "Remotely, with direct communication",
        introKicker: "Perspective",
        introTitle: "Software should <em>earn its place.</em>",
        introP1: "I'm Thomas — an independent software engineer based in Kenya. I design and build modern websites, interactive web applications and practical digital tools for businesses and organisations.",
        introP2: "My approach is simple: understand the problem, remove what doesn't help, and build something clear, responsive and genuinely useful. The result should feel considered on every screen — not just in a design mock-up.",
        introLink: "More about my approach",
        principle1Title: "Clarity first",
        principle1Text: "Every layout, label and interaction should help the visitor understand and act.",
        principle2Title: "Built to be used",
        principle2Text: "The work needs to survive real devices, real content and real people.",
        principle3Title: "Direct communication",
        principle3Text: "You speak with the person designing and building the solution — not an account manager.",
        workKicker: "Selected projects",
        workTitle: "Work with a <em>purpose.</em>",
        workLede: "A selection of website demonstrations, concepts and builds. Each project is presented with its real status, so you know exactly what you're looking at.",
        workLink: "View all projects",
        servicesKicker: "What I do",
        servicesTitle: "From first idea to <em>finished interface.</em>",
        servicesLede: "Websites, web applications and improvements shaped around a clear purpose — with an emphasis on usability, responsiveness and maintainability.",
        servicesLink: "Explore all services",
        aboutKicker: "Behind the work",
        aboutTitle: "Curious by default. <em>Practical by design.</em>",
        aboutP1: "I'm interested in the space where a real business problem becomes a clear digital experience. That means asking useful questions, making careful decisions and resisting decoration that doesn't serve the user.",
        aboutP2: "Based in Kenya and working remotely, I collaborate directly with the people behind the project. The process stays transparent from the first conversation to handover.",
        aboutLink: "More about me",
        ctaKicker: "Next step",
        ctaTitle: "Have a project in mind? <em>Let's make it real.</em>",
        ctaLede: "Tell me what you're building or improving. We can start with a short, no-obligation conversation about the problem, the scope and the right way forward.",
        ctaNote1: "Direct communication",
        ctaNote2: "No obligation",
        ctaNote3: "English / Kiswahili"
      },
      process: {
        kicker: "How I work",
        title: "A clear process. <em>No guesswork.</em>",
        lede: "Good outcomes come from a considered sequence, not a sprint towards the first visual idea. Here is how a project typically moves from conversation to handover.",
        link: "Start a conversation",
        step1Title: "Understand the problem",
        step1Text: "We start with your goals, audience and constraints. Before building, we get clear on the problem that actually needs solving.",
        step2Title: "Define the requirements",
        step2Text: "We map the content, features and what the first version needs to do. The scope becomes explicit, so expectations stay aligned.",
        step3Title: "Design the experience",
        step3Text: "I shape the layout and interface flow, then test decisions around structure, language and interaction before development.",
        step4Title: "Develop the solution",
        step4Text: "I build with clean HTML, CSS and JavaScript, paying attention to responsive behaviour, accessibility and performance.",
        step5Title: "Test and refine",
        step5Text: "I check the work across screen sizes, exercise forms and links, and fix what can be clearer, faster or more resilient.",
        step6Title: "Prepare the handover",
        step6Text: "You receive the code, supporting notes and what is needed to run and maintain the site with confidence."
      },
      about: {
        eyebrow: "About Thomas",
        title: "I build for the web with <em>purpose and precision.</em>",
        lede: "I'm Thomas Hondo Chacha, a software engineer from Kenya focused on modern websites, interactive applications and practical digital solutions.",
        sideMeta1: "Independent practice",
        sideMeta2: "Based in Kenya",
        photoAlt: "Portrait of Thomas Hondo Chacha in a computer lab, wearing a cap and badge that read Software Engineer.",
        profileKicker: "Who I am",
        profileTitle: "A builder with an eye for the <em>whole picture.</em>",
        profileP1: "I work across software engineering with a focus on front-end development and practical web systems. I enjoy the part where a real problem becomes a clear interface: structuring content, shaping interactions and making sure the result behaves well on every screen.",
        profileP2: "My foundation is semantic HTML, responsive CSS and vanilla JavaScript. When a project needs server-side logic, I work with Node.js, Express and PostgreSQL, and I connect interfaces to supported APIs where it makes sense.",
        profileP3: "I'm not interested in showing off the longest list of technologies. I choose tools that suit the problem and place the emphasis on clarity, accessibility and code that can be maintained.",
        factNameLabel: "Name",
        factNameValue: "Thomas Hondo Chacha",
        factBasedLabel: "Based in",
        factBasedValue: "Kenya",
        factFocusLabel: "Focus",
        factFocusValue: "Websites & web applications",
        factLanguagesLabel: "Languages",
        factLanguagesValue: "English · Kiswahili",
        factContactLabel: "Contact",
        factContactValue: "Direct by email, phone or WhatsApp",
        buildKicker: "What I build",
        buildTitle: "Digital products with a <em>clear job to do.</em>",
        buildLede: "The technology should serve the purpose. These are the kinds of problems I focus on.",
        build1Title: "Modern websites",
        build1Text: "Responsive, content-led websites that help businesses and organisations explain who they are and make the next step obvious.",
        build2Title: "Interactive web applications",
        build2Text: "Browser-based tools shaped around a workflow — structured input, understandable interfaces and useful feedback.",
        build3Title: "Practical improvements",
        build3Text: "Redesigns, responsive fixes, accessibility improvements and technical clean-up for existing digital products.",
        approachKicker: "How I approach projects",
        approachTitle: "Thoughtful decisions, <em>not decoration.</em>",
        quote: "A good interface should feel obvious. Getting there takes careful thinking.",
        quoteFooter: "Thomas Hondo Chacha · Working principle",
        approach1Title: "Understand before building",
        approach1Text: "I ask about the audience, the content and the outcome before settling on a layout or a technical approach.",
        approach2Title: "Simplify the path",
        approach2Text: "Clear hierarchy and direct language usually do more for a project than another visual effect.",
        approach3Title: "Build responsibly",
        approach3Text: "Semantic markup, responsive styles, accessible controls and readable code are part of the work, not extras.",
        approach4Title: "Test and refine",
        approach4Text: "I test the actual experience on different screen sizes and fix the details that get in the way.",
        toolsKicker: "Technologies and tools",
        toolsTitle: "Fundamentals, used <em>with intent.</em>",
        toolsLede: "I work with a focused set of tools. There are no proficiency percentages here — the projects are the evidence.",
        toolsFrontend: "Front-end",
        toolsBackend: "Back-end",
        toolsWorkflow: "Workflow",
        toolsIntegration: "Integration",
        toolsResponsive: "Responsive design",
        toolsAccessibility: "Accessibility",
        toolsSemantic: "Semantic HTML",
        toolsDevTools: "Browser dev tools",
        toolsApi: "API integration",
        toolsForms: "Forms",
        toolsThirdParty: "Third-party APIs",
        exploringKicker: "Currently exploring",
        exploringTitle: "Still <em>curious.</em>",
        exploringText: "The work gets better when the learning continues. At the moment I'm spending time with:",
        exploring1: "Modern CSS layout, custom properties and interface systems",
        exploring2: "Accessible interaction patterns and keyboard-first design",
        exploring3: "Full-stack JavaScript and cleaner API boundaries",
        exploring4: "Performance-minded front-end architecture"
      },
      projectsPage: {
        eyebrow: "Portfolio",
        title: "Selected projects, <em>presented honestly.</em>",
        lede: "Website demonstrations, concepts and builds by Thomas Hondo Chacha. Every project states what it is, what it explores and whether a public link exists.",
        sideMeta1: "Interface studies, demos & builds",
        sideMeta2: "Honest project statuses",
        filtersLabel: "Filter projects by type",
        listTitle: "Selected projects",
        filterAll: "All work",
        filterWebsites: "Websites",
        filterConcepts: "Concepts",
        count: "Projects shown: {count}",
        empty: "No projects match this filter.",
        legendDemoDesc: "A functional front-end demonstration built around a real interface brief. Not a live client deployment.",
        legendConceptDesc: "An interface direction exploring how a brand or service could appear online.",
        legendDevelopmentDesc: "A project that is still being built or refined.",
        legendLiveDesc: "A publicly available website. No current project is presented as live.",
        noteTitle: "A note on links and visuals.",
        noteText: "Interface images on this page are illustrative design studies — not screenshots presented as deployed client sites. Demo and source links appear only where a public link has been configured.",
        modalProblem: "The problem",
        modalApproach: "The approach",
        modalFeatures: "Key features",
        modalLimitations: "Known limitations",
        modalStack: "Technologies",
        modalStatus: "Project status",
        modalLinks: "Project links",
        modalNoLinks: "No public demo or source link is configured for this project.",
        modalDiscuss: "Discuss a similar project",
        modalClose: "Close case study",
        modalImageNote: "Illustrative interface study",
        modalThisSite: "This website is the demonstration for this project.",
        openDemo: "Open demo",
        openSource: "View source",
        openSite: "Open website"
      },
      projectData: {
        jofa: {
          category: "Hospitality website",
          alt: "Illustrative interface study for the Jofa Hotel website demonstration",
          summary: "A hospitality website demonstration built around a clear first impression, a considered room presentation and straightforward enquiry paths.",
          problem: "A hotel website has to answer practical questions quickly: what the place feels like, what it offers, and how to get in touch. When that information is scattered, potential guests leave with unanswered questions.",
          solution: "A mobile-first website structure that leads with atmosphere, organises facilities and room information into digestible sections, and keeps enquiry actions close at hand.",
          features: [
            "Editorial introduction and a strong hotel first impression",
            "Structured presentation of rooms and facilities",
            "Clear enquiry and contact routes",
            "Responsive layout for phones, tablets and desktop"
          ],
          limitations: "This is an independently built website demonstration. It is not presented as a live client deployment, and no booking engine or online payment integration is claimed.",
          availability: "No public demo or source link is configured for this project."
        },
        suna: {
          category: "Vehicle marketplace",
          alt: "Illustrative interface study for the Suna Motor Bazaar website demonstration",
          summary: "A vehicle marketplace demonstration exploring how a dealership or bazaar could present its stock clearly and make browsing feel effortless.",
          problem: "Vehicle listings become difficult to scan when photographs, specifications, prices and contact options all compete for attention.",
          solution: "A structured marketplace interface with a strong visual hierarchy, readable vehicle cards and a direct route from discovery to enquiry.",
          features: [
            "Vehicle listing layout with clear entry points",
            "Specification and price hierarchy",
            "Concept for search and category filtering",
            "Mobile-friendly browsing",
            "Enquiry-focused calls to action"
          ],
          limitations: "This is a website demonstration. It does not claim live inventory data, a production content workflow or a deployed dealership site. No public demo link is configured.",
          availability: "No public demo or source link is configured for this project."
        },
        pefrika: {
          category: "Business website",
          alt: "Illustrative interface study for the Pefrika website project",
          summary: "A business website project focused on a coherent digital identity, clear service communication and a direct route to client enquiry.",
          problem: "A small business needs a website that explains what it does without overcomplicating the story, while making it easy for a prospective client to take the next step.",
          solution: "A service-led website structure with a professional visual system, concise content and enquiry paths that reduce friction.",
          features: [
            "Business-focused information architecture",
            "Service presentation and clear calls to action",
            "Contact and enquiry flow",
            "Responsive implementation",
            "Reusable interface patterns"
          ],
          limitations: "This project is still in development. It is not presented as a live deployment, and no public URL or source repository is configured.",
          availability: "This project is in development. No public demo or source link is configured."
        },
        togotane: {
          category: "Community media",
          alt: "Illustrative interface study for the Radio Togotane website concept",
          summary: "A website concept for a community radio station, bringing station identity, programme information and listener contact into one clear online experience.",
          problem: "Community radio stations often have loyal local audiences but a limited digital presence. Programme details, station identity and ways to connect can be hard to find.",
          solution: "A concept that treats the station as a living cultural platform: a strong on-air identity, easy programme discovery and accessible ways for listeners to connect.",
          features: [
            "Concept for programme scheduling",
            "On-air visual treatment and station identity",
            "Listener contact and community pathways",
            "Responsive editorial layout"
          ],
          limitations: "This is a concept design only. No live broadcast integration, scheduling backend or deployed radio website is claimed.",
          availability: "Concept design. No public demo or source link is configured."
        },
        portfolio: {
          category: "Personal portfolio",
          alt: "Illustrative interface study for the Thomas Hondo Chacha portfolio website",
          summary: "This bilingual personal portfolio: a typographic, themeable website built with semantic HTML, custom CSS and vanilla JavaScript.",
          problem: "A developer portfolio needs to present real work credibly without relying on inflated claims, heavy frameworks or generic templates.",
          solution: "A custom static site with a clear identity, honest project labelling, persistent light and dark themes, English and Kiswahili support, and a browser-only project enquiry flow.",
          features: [
            "Complete English and Kiswahili interface translations",
            "Persistent light and dark themes",
            "Project case-study dialogs with honest status labels",
            "Client-side validation and a reviewable enquiry message",
            "Responsive layout with reduced-motion support"
          ],
          limitations: "The contact form does not send email by itself; it prepares a message and opens WhatsApp or the user's email client. No analytics or tracking is enabled.",
          availability: "This website is the demonstration for this project. No public source repository is configured."
        }
      },
      servicesPage: {
        eyebrow: "Services",
        title: "Useful software, <em>made for the real world.</em>",
        lede: "I help businesses, organisations and professionals turn a clear need into a website or web experience that works — and stays maintainable.",
        sideMeta1: "Websites · applications · improvements",
        sideMeta2: "Direct collaboration",
        introKicker: "What I do",
        introTitle: "Ways I can help you <em>build and improve.</em>",
        introLede: "Every service below describes work I can genuinely offer. If a project needs something outside this scope, I'll say so clearly rather than overstate what is possible.",
        commonUses: "Common uses",
        relatedWork: "Related work:",
        discuss: "Discuss this service",
        service1Title: "Website design and development",
        service1Text: "Modern, responsive websites for businesses, organisations and professionals — designed to present information clearly and work reliably on every screen.",
        service1Use1: "Business and organisation websites",
        service1Use2: "Professional profiles",
        service1Use3: "Content-led brochure sites",
        service1Related: "Personal portfolio website",
        service2Title: "Business landing pages",
        service2Text: "Focused pages built around a clear offer, a defined audience and a straightforward enquiry action.",
        service2Use1: "Service or product launches",
        service2Use2: "Campaign and advertising pages",
        service2Use3: "Local business enquiry pages",
        service2Related: "Jofa Hotel website demonstration",
        service3Title: "Web applications",
        service3Text: "Interactive browser-based systems shaped around a specific workflow — from structured data entry to customer-facing tools.",
        service3Use1: "Enquiry and booking-style flows",
        service3Use2: "Internal tools and dashboards",
        service3Use3: "Data-driven customer interfaces",
        service3Related: "Selected project concepts",
        service4Title: "Website redesign",
        service4Text: "Improving layout, responsiveness, navigation and overall clarity for websites that no longer serve their purpose well.",
        service4Use1: "Outdated visual design",
        service4Use2: "Poor mobile experience",
        service4Use3: "Unclear navigation and content",
        service4Related: "Selected projects",
        service5Title: "API and system integration",
        service5Text: "Connecting web interfaces to supported APIs and backend services where it is technically appropriate.",
        service5Use1: "Connecting forms to supported backends",
        service5Use2: "Integrating third-party services",
        service5Use3: "Structuring data between systems",
        service5Related: "Personal portfolio website",
        service6Title: "Technical support and improvements",
        service6Text: "Helping identify and address website issues, improve usability and maintain existing projects without unnecessary rebuilds.",
        service6Use1: "Fixing layout and browser issues",
        service6Use2: "Improving usability and accessibility",
        service6Use3: "Maintaining existing websites",
        service6Related: "Selected projects",
        scopeKicker: "Scope and pricing",
        scopeTitle: "Every project starts with a <em>conversation.</em>",
        scopeP1: "There are no fixed packages here. Scope, timeline and cost depend on what the project actually needs. After we discuss your requirements, you'll receive a clear proposal before any work begins.",
        scopeP2: "No invented prices on this website. No surprise add-ons. Just an honest scope agreed in advance.",
        scopeNote: "No fixed prices are published because every brief is different. You will always know the scope before work starts.",
        scopeCta: "Discuss your requirements"
      },
      contactPage: {
        eyebrow: "Contact",
        title: "Let's talk about <em>what you're building.</em>",
        lede: "Whether you have a defined brief or just the beginnings of an idea, the next step is a straightforward conversation.",
        channelCallLabel: "Call",
        channelCallNote: "Speak directly with Thomas",
        channelWhatsappLabel: "WhatsApp",
        channelWhatsappNote: "Send a message at any time",
        channelEmailLabel: "Email",
        channelEmailNote: "Share your brief in detail",
        channelLocationLabel: "Location",
        channelLocationValue: "Kenya",
        channelLocationNote: "East Africa Time · Remote collaboration",
        sideKicker: "Get in touch",
        sideTitle: "A direct line to the person doing the work.",
        sideText: "Share a little context about the project. I read every enquiry personally and will reply through the contact method you choose.",
        directPhone: "Phone",
        directEmail: "Email",
        directWhatsapp: "WhatsApp",
        directLocation: "Location",
        locationValue: "Kenya · East Africa Time",
        stepsHeading: "What happens next",
        step1: "You share the problem, goals and any useful context.",
        step2: "I review the details and reply to discuss the fit.",
        step3: "If it makes sense, we agree scope, timing and cost before work begins.",
        formHeading: "Tell me about your project",
        formLede: "Complete the fields below to prepare a message. You'll be able to review everything before opening WhatsApp or your email app.",
        formName: "Full name",
        formNamePlaceholder: "Your full name",
        formEmail: "Email address",
        formEmailPlaceholder: "you@example.com",
        formPhone: "Phone number",
        formPhonePlaceholder: "+254 7XX XXX XXX",
        formOptional: "Optional",
        formProjectType: "Project type",
        formProjectTypePlaceholder: "Choose a project type",
        formProjectWebsite: "Website design & development",
        formProjectLanding: "Business landing page",
        formProjectApp: "Web application",
        formProjectRedesign: "Website redesign",
        formProjectIntegration: "API or system integration",
        formProjectSupport: "Technical support",
        formProjectOther: "Something else",
        formDescription: "Project description",
        formDescriptionPlaceholder: "What are you trying to build or improve? Include any context, goals or constraints that matter.",
        formDescriptionHint: "A few sentences is enough to start. Minimum 20 characters.",
        formContactLegend: "Preferred contact method",
        formContactWhatsapp: "WhatsApp",
        formContactEmail: "Email",
        formContactPhone: "Phone call",
        formRequiredNote: "Fields marked * are required.",
        formNote: "This website does not send your message automatically. It prepares the message in your browser and opens the contact method you choose. Your details are not stored by this site.",
        formSubmit: "Review my message",
        formReset: "Clear form",
        formErrorSummary: "Please check the highlighted fields.",
        formErrorName: "Please enter your full name.",
        formErrorEmail: "Please enter a valid email address.",
        formErrorPhone: "Please enter a valid phone number, or leave it blank.",
        formErrorProjectType: "Please choose a project type.",
        formErrorDescription: "Please describe the project in at least 20 characters.",
        formErrorContact: "Please choose a preferred contact method.",
        formReviewTitle: "Your message is ready to review",
        formReviewLede: "Nothing has been sent yet. Choose how you want to continue. Your message will open in WhatsApp or your email app, where you can send it yourself.",
        formReviewMessageLabel: "Prepared message",
        formOpenWhatsapp: "Open WhatsApp",
        formOpenEmail: "Open email draft",
        formCopy: "Copy message",
        formCopied: "Message copied to your clipboard.",
        formCopyError: "Could not copy automatically. Select the message and copy it manually.",
        formEdit: "Back to the form",
        formReviewDisclaimer: "This message is prepared locally in your browser. The website does not send or store your details.",
        formMessageTemplate: "Hello Thomas, I visited your website and would like to discuss a project.\n\nName: {name}\nEmail: {email}\nPhone: {phone}\nProject type: {projectType}\nPreferred contact: {contactMethod}\n\nProject details:\n{description}",
        formNotProvided: "Not provided",
        formEmailSubject: "Project enquiry from {name} — {projectType}",
        formWhatsappContact: "WhatsApp",
        formEmailContact: "Email",
        formPhoneContact: "Phone call",
        privacyTitle: "Privacy",
        privacyText: "This site stores only your language and theme preferences in your browser's LocalStorage. Your contact form details remain in your browser and are not sent to a server. When you open WhatsApp or email, the message is handed to that service and its privacy terms apply.",
        asideCtaTitle: "Prefer to keep it simple?",
        asideCtaText: "Call, message or email directly. You do not need to use the form.",
        asideCall: "Call 0705023432",
        asideWhatsapp: "Message on WhatsApp",
        asideEmail: "Send an email"
      },
      footer: {
        description: "Software engineer building modern websites and web applications for businesses, organisations and professionals in Kenya and beyond.",
        explore: "Explore",
        contact: "Contact",
        status: "Based in Kenya · Open to project conversations",
        rights: "All rights reserved.",
        credit: "Designed and built by Thomas Hondo Chacha.",
        privacyLabel: "Privacy",
        privacyNote: "This website stores only your language and theme preferences in your browser. The contact form does not transmit or store data.",
        backToTop: "Back to top"
      },
      notFound: {
        code: "Error 404",
        title: "This page has <em>wandered off.</em>",
        text: "The page you're looking for doesn't exist, or its address may have changed. Let's get you back to something useful.",
        home: "Back to home",
        projects: "View projects"
      },
      whatsapp: {
        general: "Hello Thomas, I visited your website and would like to discuss a project.",
        websiteDesign: "Hello Thomas, I visited your website and I'm interested in website design and development. I'd like to discuss a project.",
        landingPage: "Hello Thomas, I visited your website and I'm interested in a business landing page. I'd like to discuss a project.",
        webApp: "Hello Thomas, I visited your website and I'm interested in a web application. I'd like to discuss a project.",
        redesign: "Hello Thomas, I visited your website and I'm interested in a website redesign. I'd like to discuss a project.",
        integration: "Hello Thomas, I visited your website and I'm interested in API or system integration. I'd like to discuss a project.",
        support: "Hello Thomas, I visited your website and I'd like to discuss technical support or improvements for a website."
      }
    },

    sw: {
      language: {
        english: "Kiingereza",
        swahili: "Kiswahili"
      },
      meta: {
        home: {
          title: "Thomas Hondo Chacha — Mhandisi wa Programu na Msanidi wa Tovuti",
          description: "Thomas Hondo Chacha ni mhandisi wa programu nchini Kenya anayejenga tovuti za kisasa, mifumo ya wavuti inayotumika na suluhisho za kidijitali zenye manufaa kwa biashara.",
          imageAlt: "Thomas Hondo Chacha — Mhandisi wa Programu nchini Kenya"
        },
        about: {
          title: "Kuhusu Thomas Hondo Chacha — Mhandisi wa Programu nchini Kenya",
          description: "Fahamu zaidi kuhusu Thomas Hondo Chacha, mhandisi wa programu kutoka Kenya anayejikita katika tovuti za kisasa, mifumo ya wavuti na suluhisho za kidijitali.",
          imageAlt: "Kuhusu Thomas Hondo Chacha, Mhandisi wa Programu"
        },
        projects: {
          title: "Miradi — Thomas Hondo Chacha, Mhandisi wa Programu",
          description: "Miradi teule ya tovuti, onyesho na dhana za violesura za Thomas Hondo Chacha, zenye hali halisi na uchambuzi wa kiufundi.",
          imageAlt: "Miradi teule ya Thomas Hondo Chacha"
        },
        services: {
          title: "Huduma — Thomas Hondo Chacha, Mhandisi wa Programu",
          description: "Ubunifu wa tovuti, kurasa za biashara, mifumo ya wavuti, uboreshaji, muunganisho wa API na maboresho ya kiufundi kutoka kwa Thomas Hondo Chacha nchini Kenya.",
          imageAlt: "Huduma za uhandisi wa programu za Thomas Hondo Chacha"
        },
        contact: {
          title: "Mawasiliano — Thomas Hondo Chacha, Mhandisi wa Programu",
          description: "Wasiliana na Thomas Hondo Chacha kwa simu, WhatsApp au barua pepe kuzungumzia tovuti, mfumo wa wavuti au mradi wa kidijitali.",
          imageAlt: "Wasiliana na Thomas Hondo Chacha"
        },
        notFound: {
          title: "Ukurasa haupatikani — Thomas Hondo Chacha",
          description: "Ukurasa unaoutafuta haupatikani. Rudi kwenye tovuti ya Thomas Hondo Chacha, Mhandisi wa Programu.",
          imageAlt: "Thomas Hondo Chacha"
        }
      },
      brand: {
        role: "Mhandisi wa Programu"
      },
      a11y: {
        skip: "Nenda kwenye maudhui",
        primaryNav: "Urambazaji mkuu",
        footerNav: "Urambazaji wa chini",
        breadcrumbs: "Njia ya ukurasa",
        language: "Lugha",
        theme: "Mandhari ya rangi",
        menuOpen: "Fungua menyu",
        menuClose: "Funga menyu",
        heroVisual: "Muhtasari wa kazi zangu za programu",
        selectedLanguage: "{language}, imechaguliwa",
        switchToLanguage: "Badilisha kwenda {language}",
        projectDialog: "Uchambuzi wa mradi",
        externalLink: "Hufunguka kwenye tabo mpya"
      },
      theme: {
        light: "Hali ya mwanga",
        dark: "Hali ya giza"
      },
      nav: {
        home: "Mwanzo",
        about: "Kuhusu",
        projects: "Miradi",
        services: "Huduma",
        contact: "Mawasiliano",
        startProject: "Anzisha mradi"
      },
      common: {
        kenya: "Kenya",
        viewProjects: "Tazama miradi yangu",
        contactMe: "Wasiliana nami",
        viewAllProjects: "Tazama miradi yote",
        discussProject: "Zungumzia mradi wako",
        viewCaseStudy: "Tazama uchambuzi",
        close: "Funga",
        backToTop: "Rudi juu",
        call: "Piga simu",
        callNumber: "Piga 0705023432",
        whatsapp: "WhatsApp",
        email: "Barua pepe",
        phone: "Simu",
        location: "Mahali",
        languages: "Lugha",
        focus: "Mwelekeo",
        available: "Tayari kwa mazungumzo ya mradi",
        remote: "Kazi kwa mbali",
        direct: "Mawasiliano ya moja kwa moja",
        noLink: "Hakuna kiungo cha umma",
        illustrative: "Dhana ya kiolesura",
        opensNewTab: "Hufunguka kwenye tabo mpya"
      },
      status: {
        demo: "Onyesho linalofanya kazi",
        concept: "Dhana ya muundo",
        development: "Inaendelezwa",
        live: "Tovuti hai"
      },
      projectType: {
        website: "Tovuti",
        concept: "Dhana"
      },
      home: {
        eyebrow: "Mhandisi wa programu · Kenya",
        headline: "Nabadilisha mawazo kuwa <em>bidhaa za kidijitali zinazofanya kazi.</em>",
        lede: "Nabuni na kuunda tovuti za kisasa na mifumo ya wavuti inayovutia, inayosaidia biashara kujitokeza kitaalamu na kuwahudumia wateja wao kwa ufanisi zaidi.",
        primaryCta: "Tazama Miradi Yangu",
        secondaryCta: "Wasiliana Nami",
        contactLabel: "Mawasiliano ya moja kwa moja",
        figure: "Ramani ya kazi",
        stageTagInterfaces: "Violesura",
        stageTagSystems: "Mifumo",
        cap1: "Tovuti",
        cap2: "Mifumo ya wavuti",
        cap3: "Muunganisho",
        floatLabel: "Mwelekeo wa sasa",
        floatText: "Kujenga uzoefu wa wavuti wenye maudhui.",
        metaBasedLabel: "Niko",
        metaBasedValue: "Kenya · EAT",
        metaFocusLabel: "Mwelekeo",
        metaFocusValue: "Tovuti na mifumo ya wavuti",
        metaLanguagesLabel: "Lugha",
        metaLanguagesValue: "Kiingereza · Kiswahili",
        metaWorkLabel: "Kazi",
        metaWorkValue: "Kwa mbali, kwa mawasiliano ya moja kwa moja",
        introKicker: "Mtazamo",
        introTitle: "Programu zinapaswa kuleta <em>thamani halisi.</em>",
        introP1: "Mimi ni Thomas — mhandisi wa programu anayefanya kazi kwa kujitegemea nchini Kenya. Nabuni na kujenga tovuti za kisasa, mifumo ya wavuti inayotumika na zana za kidijitali zinazosaidia biashara na mashirika.",
        introP2: "Mtazamo wangu ni rahisi: elewa tatizo, ondoa kisichosaidia, kisha jenga kitu kilicho wazi, kinachobadilika kulingana na kifaa na chenye manufaa halisi. Matokeo yanapaswa kuonekana makini kwenye kila skrini — sio tu kwenye picha ya muundo.",
        introLink: "Zaidi kuhusu mtazamo wangu",
        principle1Title: "Uwazi kwanza",
        principle1Text: "Kila mpangilio, lebo na mwingiliano unapaswa kumsaidia mgeni kuelewa na kuchukua hatua.",
        principle2Title: "Imejengwa kwa matumizi",
        principle2Text: "Kazi lazima ifanye vizuri kwenye vifaa halisi, maudhui halisi na kwa watu halisi.",
        principle3Title: "Mawasiliano ya moja kwa moja",
        principle3Text: "Unazungumza na mtu anayebuni na kujenga suluhisho — sio msimamizi wa akaunti.",
        workKicker: "Baadhi ya miradi yangu",
        workTitle: "Kazi yenye <em>madhumuni.</em>",
        workLede: "Baadhi ya onyesho za tovuti, dhana na miradi. Kila mradi unaonyeshwa na hali yake halisi, ili ujue unaangalia nini.",
        workLink: "Tazama miradi yote",
        servicesKicker: "Huduma ninazotoa",
        servicesTitle: "Kuanzia wazo la kwanza hadi <em>kiolesura kilichokamilika.</em>",
        servicesLede: "Tovuti, mifumo ya wavuti na maboresho yanayolenga madhumuni wazi — kwa msisitizo kwenye urahisi wa matumizi, kubadilika kwa vifaa na urahisi wa matengenezo.",
        servicesLink: "Tazama huduma zote",
        aboutKicker: "Nyuma ya kazi",
        aboutTitle: "Ndadisi kwa asili. <em>Ninaunda kwa matumizi.</em>",
        aboutP1: "Ninavutiwa na mahali ambapo tatizo halisi la biashara linabadilika kuwa uzoefu wazi wa kidijitali. Hii inamaanisha kuuliza maswali yenye maana, kufanya maamuzi kwa makini na kuepuka mapambo yasiyomsaidia mtumiaji.",
        aboutP2: "Nikiwa nchini Kenya na kufanya kazi kwa mbali, ninashirikiana moja kwa moja na watu walio nyuma ya mradi. Mchakato unabaki wazi kuanzia mazungumzo ya kwanza hadi makabidhiano.",
        aboutLink: "Zaidi kuhusu mimi",
        ctaKicker: "Hatua inayofuata",
        ctaTitle: "Una mradi akilini? <em>Tuufanye uwe halisi.</em>",
        ctaLede: "Eleza unachotaka kujenga au kuboresha. Tunaweza kuanza na mazungumzo mafupi, bila wajibu, kuhusu tatizo, upeo na njia sahihi ya mbele.",
        ctaNote1: "Mawasiliano ya moja kwa moja",
        ctaNote2: "Bila wajibu",
        ctaNote3: "Kiingereza / Kiswahili"
      },
      process: {
        kicker: "Jinsi ninavyofanya kazi",
        title: "Mchakato ulio wazi. <em>Bila kubahatisha.</em>",
        lede: "Matokeo mazuri hutokana na mfululizo wa hatua zilizofikiriwa, sio kukimbilia wazo la kwanza la kuona. Hivi ndivyo mradi kwa kawaida unasonga kutoka mazungumzo hadi makabidhiano.",
        link: "Anzisha mazungumzo",
        step1Title: "Elewa tatizo",
        step1Text: "Tunaanza na malengo yako, hadhira na vikwazo. Kabla ya kujenga, tunafafanua tatizo hasa linalohitaji kutatuliwa.",
        step2Title: "Bainisha mahitaji",
        step2Text: "Tunapanga yaliyomo, vipengele na kile toleo la kwanza linahitaji kufanya. Upeo unakuwa wazi ili matarajio ya pande zote yabaki sawa.",
        step3Title: "Buni uzoefu",
        step3Text: "Naunda mpangilio na mtiririko wa kiolesura, kisha najaribu maamuzi ya muundo, lugha na mwingiliano kabla ya ujenzi.",
        step4Title: "Jenga suluhisho",
        step4Text: "Najenga kwa HTML, CSS na JavaScript safi, nikizingatia tabia inayobadilika kwa vifaa, ufikivu na utendaji mzuri.",
        step5Title: "Jaribu na kuboresha",
        step5Text: "Nakagua kazi kwenye ukubwa tofauti wa skrini, najaribu fomu na viungo, kisha narekebisha mambo yanayoweza kuwa wazi zaidi, haraka zaidi au imara zaidi.",
        step6Title: "Andaa makabidhiano",
        step6Text: "Unapokea msimbo, maelezo ya usaidizi na kile kinachohitajika ili kuendesha na kudumisha tovuti kwa uhakika."
      },
      about: {
        eyebrow: "Kuhusu Thomas",
        title: "Najenga kwa ajili ya wavuti kwa <em>madhumuni na umakini.</em>",
        lede: "Mimi ni Thomas Hondo Chacha, mhandisi wa programu kutoka Kenya ninayejikita katika tovuti za kisasa, mifumo inayotumika na suluhisho za kidijitali zenye manufaa.",
        sideMeta1: "Kazi ya kujitegemea",
        sideMeta2: "Niko Kenya",
        photoAlt: "Picha ya Thomas Hondo Chacha katika maabara ya kompyuta, akiwa amevaa kofia na beji zinazoonyesha Mhandisi wa Programu.",
        profileKicker: "Mimi ni nani",
        profileTitle: "Mjenzi mwenye mtazamo wa <em>picha nzima.</em>",
        profileP1: "Ninafanya kazi kwenye uhandisi wa programu kwa mwelekeo wa ukuzaji wa mbele na mifumo ya wavuti inayotumika. Napenda sehemu ambayo tatizo halisi linabadilika kuwa kiolesura wazi: kupanga maudhui, kuunda mwingiliano na kuhakikisha matokeo yanafanya kazi vizuri kwenye kila skrini.",
        profileP2: "Msingi wa kazi yangu ni HTML yenye maana, CSS inayobadilika na JavaScript ya kawaida. Mradi unapohitaji mantiki ya upande wa seva, ninafanya kazi na Node.js, Express na PostgreSQL, na kuunganisha violesura na API zinazotumika inapofaa.",
        profileP3: "Sivutiwi kuonyesha orodha ndefu zaidi ya teknolojia. Ninachagua zana zinazofaa tatizo na kuweka msisitizo kwenye uwazi, ufikivu na msimbo unaoweza kudumishwa.",
        factNameLabel: "Jina",
        factNameValue: "Thomas Hondo Chacha",
        factBasedLabel: "Niko",
        factBasedValue: "Kenya",
        factFocusLabel: "Mwelekeo",
        factFocusValue: "Tovuti na mifumo ya wavuti",
        factLanguagesLabel: "Lugha",
        factLanguagesValue: "Kiingereza · Kiswahili",
        factContactLabel: "Mawasiliano",
        factContactValue: "Moja kwa moja kwa barua pepe, simu au WhatsApp",
        buildKicker: "Ninachojenga",
        buildTitle: "Bidhaa za kidijitali zenye <em>kazi wazi.</em>",
        buildLede: "Teknolojia inapaswa kutumikia madhumuni. Hizi ni aina za matatizo ninazozingatia.",
        build1Title: "Tovuti za kisasa",
        build1Text: "Tovuti zinazobadilika kwa vifaa, zinazoongozwa na maudhui, zinazosaidia biashara na mashirika kueleza yaliyo na kufanya hatua inayofuata iwe wazi.",
        build2Title: "Mifumo ya wavuti inayotumika",
        build2Text: "Zana za kwenye kivinjari zinazoundwa kulingana na mtiririko wa kazi — uingizaji wa taarifa uliopangwa, violesura vinavyoeleweka na mrejesho unaosaidia.",
        build3Title: "Maboresho ya kivitendo",
        build3Text: "Uboreshaji wa muundo, marekebisho ya simu, maboresho ya ufikivu na usafishaji wa kiufundi kwa bidhaa za kidijitali zilizopo.",
        approachKicker: "Jinsi ninavyoshughulikia miradi",
        approachTitle: "Maamuzi ya kufikiriwa, <em>sio mapambo.</em>",
        quote: "Kiolesura kizuri kinapaswa kuonekana dhahiri. Kufikia hapo kunahitaji kufikiri kwa makini.",
        quoteFooter: "Thomas Hondo Chacha · Kanuni ya kazi",
        approach1Title: "Elewa kabla ya kujenga",
        approach1Text: "Ninauliza kuhusu hadhira, maudhui na matokeo yanayotakiwa kabla ya kuamua mpangilio au njia ya kiufundi.",
        approach2Title: "Rahisisha njia",
        approach2Text: "Mpangilio wazi na lugha ya moja kwa moja mara nyingi hufanya zaidi kwa mradi kuliko athari nyingine ya kuona.",
        approach3Title: "Jenga kwa uwajibikaji",
        approach3Text: "HTML yenye maana, mitindo inayobadilika, vidhibiti vinavyofikika na msimbo unaosoma ni sehemu ya kazi, sio nyongeza.",
        approach4Title: "Jaribu na kuboresha",
        approach4Text: "Najaribu uzoefu halisi kwenye ukubwa tofauti wa skrini na kurekebisha maelezo yanayosumbua.",
        toolsKicker: "Teknolojia na zana",
        toolsTitle: "Misingi, inayotumika <em>kwa kusudi.</em>",
        toolsLede: "Ninafanya kazi na seti ndogo ya zana. Hakuna asilimia za ujuzi hapa — miradi ndiyo ushahidi.",
        toolsFrontend: "Upande wa mbele",
        toolsBackend: "Upande wa seva",
        toolsWorkflow: "Mtiririko wa kazi",
        toolsIntegration: "Muunganisho",
        toolsResponsive: "Muundo unaobadilika",
        toolsAccessibility: "Ufikivu",
        toolsSemantic: "HTML yenye maana",
        toolsDevTools: "Zana za msanidi za kivinjari",
        toolsApi: "Muunganisho wa API",
        toolsForms: "Fomu",
        toolsThirdParty: "API za wahusika wengine",
        exploringKicker: "Ninachojifunza sasa",
        exploringTitle: "Bado <em>nina udadisi.</em>",
        exploringText: "Kazi inakuwa bora wakati kujifunza kunaendelea. Kwa sasa ninatumia muda kwenye:",
        exploring1: "Mpangilio wa kisasa wa CSS, sifa maalum na mifumo ya violesura",
        exploring2: "Mifumo ya mwingiliano inayofikika na ubunifu unaoanza na kibodi",
        exploring3: "JavaScript ya mfumo mzima na mipaka safi ya API",
        exploring4: "Usanifu wa upande wa mbele unaozingatia utendaji"
      },
      projectsPage: {
        eyebrow: "Kazi zangu",
        title: "Miradi teule, <em>iliyowasilishwa kwa uaminifu.</em>",
        lede: "Onyesho za tovuti, dhana na miradi ya Thomas Hondo Chacha. Kila mradi unaeleza ni nini, unachunguza nini na kama kuna kiungo cha umma.",
        sideMeta1: "Dhana, onyesho na miradi",
        sideMeta2: "Hali halisi za miradi",
        filtersLabel: "Chuja miradi kwa aina",
        listTitle: "Miradi iliyochaguliwa",
        filterAll: "Kazi zote",
        filterWebsites: "Tovuti",
        filterConcepts: "Dhana",
        count: "Miradi inayoonyeshwa: {count}",
        empty: "Hakuna mradi unaolingana na kichujio hiki.",
        legendDemoDesc: "Onyesho la mbele linalofanya kazi, lililoundwa kwa ajili ya wazo halisi la kiolesura. Sio mradi wa mteja ulio hai.",
        legendConceptDesc: "Mwelekeo wa kiolesura unaochunguza jinsi chapa au huduma inaweza kuonekana mtandaoni.",
        legendDevelopmentDesc: "Mradi ambao bado unajengwa au unaboreshwa.",
        legendLiveDesc: "Tovuti inayopatikana kwa umma. Hakuna mradi wa sasa unaowasilishwa kama tovuti hai.",
        noteTitle: "Kuhusu viungo na picha.",
        noteText: "Picha za violesura kwenye ukurasa huu ni dhana za muundo — sio picha zinazowasilishwa kama tovuti za wateja zilizo hai. Viungo vya onyesho na msimbo vinaonekana tu pale kiungo cha umma kimewekwa.",
        modalProblem: "Tatizo",
        modalApproach: "Mtazamo",
        modalFeatures: "Vipengele muhimu",
        modalLimitations: "Mipaka inayojulikana",
        modalStack: "Teknolojia",
        modalStatus: "Hali ya mradi",
        modalLinks: "Viungo vya mradi",
        modalNoLinks: "Hakuna kiungo cha onyesho la umma au msimbo kilichowekwa kwa mradi huu.",
        modalDiscuss: "Zungumzia mradi kama huu",
        modalClose: "Funga uchambuzi",
        modalImageNote: "Dhana ya kiolesura",
        modalThisSite: "Tovuti hii ni onyesho la mradi huu.",
        openDemo: "Fungua onyesho",
        openSource: "Tazama msimbo",
        openSite: "Fungua tovuti"
      },
      projectData: {
        jofa: {
          category: "Tovuti ya hoteli",
          alt: "Dhana ya kiolesura kwa onyesho la tovuti ya Hoteli ya Jofa",
          summary: "Onyesho la tovuti ya hoteli linalolenga maoni ya kwanza ya kuvutia, uwasilishaji makini wa vyumba na njia rahisi za kuuliza.",
          problem: "Tovuti ya hoteli lazima ijibu maswali ya msingi haraka: mahali panakaa vipi, panatoa nini, na jinsi ya kuwasiliana. Taarifa zinapotawanyika, wageni wanaweza kuondoka bila kupata majibu.",
          solution: "Muundo wa tovuti unaotanguliza simu za mkononi, unaoanza na hali ya hoteli, unaopanga taarifa za huduma na vyumba katika sehemu rahisi kusoma, na kuweka njia za kuuliza karibu.",
          features: [
            "Utangulizi wa kihariri na maoni ya kwanza ya hoteli yenye nguvu",
            "Uwasilishaji uliopangwa wa vyumba na huduma",
            "Njia wazi za kuuliza na kuwasiliana",
            "Muundo unaobadilika kwa simu, kompyuta kibao na kompyuta"
          ],
          limitations: "Huu ni onyesho la tovuti lililoundwa kwa kujitegemea. Haliwasilishwi kama mradi wa mteja ulio hai, na hakuna mfumo wa uhifadhi au malipo mtandaoni unaodaiwa.",
          availability: "Hakuna kiungo cha onyesho la umma au msimbo kilichowekwa kwa mradi huu."
        },
        suna: {
          category: "Soko la magari",
          alt: "Dhana ya kiolesura kwa onyesho la tovuti ya Suna Motor Bazaar",
          summary: "Onyesho la soko la magari linalochunguza jinsi biashara ya magari inaweza kuwasilisha magari yaliyopo kwa uwazi na kurahisisha kuvinjari.",
          problem: "Orodha za magari huwa ngumu kuchunguza wakati picha, vipimo, bei na njia za kuwasiliana vinashindana kwa makini ya mtumiaji.",
          solution: "Kiolesura cha soko kilichopangwa vizuri, chenye mpangilio wazi, kadi za magari rahisi kusoma na njia ya moja kwa moja kutoka kwa ugunduzi hadi kuuliza.",
          features: [
            "Mpangilio wa orodha za magari wenye maeneo wazi ya kuanzia",
            "Uwazi wa vipimo na bei",
            "Dhana ya utafutaji na vichujio vya aina",
            "Uvinjari rahisi kwenye simu",
            "Vitendo vya kuuliza vinavyoelekea wateja"
          ],
          limitations: "Huu ni onyesho la tovuti. Haukudai data halisi ya magari, mtiririko wa maudhui wa uzalishaji au tovuti ya biashara iliyowekwa mtandaoni. Hakuna kiungo cha onyesho la umma kilichowekwa.",
          availability: "Hakuna kiungo cha onyesho la umma au msimbo kilichowekwa kwa mradi huu."
        },
        pefrika: {
          category: "Tovuti ya biashara",
          alt: "Dhana ya kiolesura kwa mradi wa tovuti ya Pefrika",
          summary: "Mradi wa tovuti ya biashara unaolenga utambulisho wa kidijitali uliojengwa kwa uthabiti, mawasiliano wazi ya huduma na njia ya moja kwa moja ya wateja kuuliza.",
          problem: "Biashara ndogo inahitaji tovuti inayoeleza inachofanya bila kutatiza hadithi, huku ikirahisisha mteja anayetarajia kuchukua hatua inayofuata.",
          solution: "Muundo wa tovuti unaoongozwa na huduma, wenye mfumo wa kuona wa kitaalamu, maudhui mafupi na njia za kuuliza zisizo na usumbufu.",
          features: [
            "Muundo wa taarifa unaolenga biashara",
            "Uwasilishaji wa huduma na wito wazi wa kuchukua hatua",
            "Mchakato wa mawasiliano na kuuliza",
            "Utekelezaji unaobadilika kwa vifaa",
            "Vipengele vya kiolesura vinavyoweza kutumika tena"
          ],
          limitations: "Mradi bado unaendelezwa. Haliwasilishwi kama tovuti iliyowekwa mtandaoni, na hakuna kiungo cha umma au hazina ya msimbo iliyowekwa.",
          availability: "Mradi unaendelezwa. Hakuna kiungo cha onyesho la umma au msimbo kilichowekwa."
        },
        togotane: {
          category: "Vyombo vya habari vya jamii",
          alt: "Dhana ya kiolesura kwa tovuti ya Radio Togotane",
          summary: "Dhana ya tovuti ya redio ya jamii inayokusanya utambulisho wa kituo, taarifa za vipindi na njia za kuwasiliana na wasikilizaji katika matumizi moja ya mtandaoni.",
          problem: "Redio za jamii mara nyingi zina wasikilizaji waaminifu lakini uwepo mdogo mtandaoni. Taarifa za vipindi, utambulisho wa kituo na njia za kuwasiliana zinaweza kuwa vigumu kupatikana.",
          solution: "Dhana inayochukulia kituo kama jukwaa hai la kitamaduni: utambulisho wa hewani wenye nguvu, ugunduzi rahisi wa vipindi na mawasiliano rahisi kwa wasikilizaji.",
          features: [
            "Dhana ya ratiba ya vipindi",
            "Muonekano wa hewani na utambulisho wa kituo",
            "Njia za mawasiliano na jamii",
            "Mpangilio wa kihariri unaobadilika kwa vifaa"
          ],
          limitations: "Hii ni dhana ya muundo tu. Hakuna muunganisho wa matangazo ya moja kwa moja, mfumo wa ratiba au tovuti ya redio iliyowekwa mtandaoni inayodaiwa.",
          availability: "Dhana ya muundo. Hakuna kiungo cha onyesho la umma au msimbo kilichowekwa."
        },
        portfolio: {
          category: "Tovuti binafsi",
          alt: "Dhana ya kiolesura kwa tovuti ya Thomas Hondo Chacha",
          summary: "Tovuti hii binafsi ya lugha mbili: mradi unaotumia HTML yenye maana, CSS maalum na JavaScript ya kawaida, wenye mada za mwanga na giza.",
          problem: "Tovuti ya msanidi inahitaji kuwasilisha kazi halisi kwa uaminifu bila kutegemea madai yaliyozidi kipimo, mifumo mizito au violezo vya kawaida.",
          solution: "Tovuti tuli iliyoundwa maalum, yenye utambulisho wazi, lebo za miradi kwa uaminifu, mada za mwanga na giza zinazohifadhiwa, msaada wa Kiingereza na Kiswahili, na mchakato wa kuuliza unaofanyika kwenye kivinjari.",
          features: [
            "Tafsiri kamili za kiolesura kwa Kiingereza na Kiswahili",
            "Mada za mwanga na giza zinazohifadhiwa",
            "Madirisha ya uchambuzi wa miradi yenye lebo za hali halisi",
            "Uthibitishaji wa fomu na ujumbe unaoweza kukaguliwa",
            "Muundo unaobadilika na heshima kwa mwendo mdogo"
          ],
          limitations: "Fomu ya mawasiliano haitumi barua pepe yenyewe; inaandaa ujumbe na kufungua WhatsApp au programu ya barua pepe. Hakuna uchanganuzi au ufuatiliaji unaotumika.",
          availability: "Tovuti unayoiangalia ndiyo onyesho la mradi huu. Hakuna hazina ya umma ya msimbo iliyowekwa."
        }
      },
      servicesPage: {
        eyebrow: "Huduma",
        title: "Programu zenye manufaa, <em>zilizoundwa kwa dunia halisi.</em>",
        lede: "Nawasaidia biashara, mashirika na wataalamu kubadilisha hitaji wazi kuwa tovuti au uzoefu wa wavuti unaofanya kazi — na unaoweza kudumishwa.",
        sideMeta1: "Tovuti · mifumo · maboresho",
        sideMeta2: "Ushirikiano wa moja kwa moja",
        introKicker: "Huduma ninazotoa",
        introTitle: "Njia ninazoweza kukusaidia <em>kujenga na kuboresha.</em>",
        introLede: "Kila huduma hapa inaeleza kazi ninayoweza kutoa kwa dhati. Mradi unahitaji kitu nje ya upeo huu, nitasema wazi badala ya kudai zaidi ya inachowezekana.",
        commonUses: "Matumizi ya kawaida",
        relatedWork: "Kazi inayohusiana:",
        discuss: "Zungumzia huduma hii",
        service1Title: "Ubunifu na uundaji wa tovuti",
        service1Text: "Tovuti za kisasa zinazobadilika kwa vifaa kwa biashara, mashirika na wataalamu — zilizobuniwa kuwasilisha taarifa kwa uwazi na kufanya kazi kwa uhakika kwenye kila skrini.",
        service1Use1: "Tovuti za biashara na mashirika",
        service1Use2: "Wasifu wa kitaalamu",
        service1Use3: "Tovuti zinazoongozwa na maudhui",
        service1Related: "Tovuti binafsi ya kazi",
        service2Title: "Kurasa za biashara",
        service2Text: "Kurasa zinazolenga ofa wazi, hadhira maalum na hatua rahisi ya kuuliza.",
        service2Use1: "Uzinduzi wa huduma au bidhaa",
        service2Use2: "Kurasa za kampeni na matangazo",
        service2Use3: "Kurasa za biashara za ndani",
        service2Related: "Onyesho la tovuti ya Hoteli ya Jofa",
        service3Title: "Mifumo ya wavuti",
        service3Text: "Mifumo inayotumika kwenye kivinjari inayoundwa kulingana na mtiririko maalum wa kazi — kutoka uingizaji wa taarifa uliopangwa hadi zana za wateja.",
        service3Use1: "Mchakato wa kuuliza na uhifadhi",
        service3Use2: "Zana za ndani na dashibodi",
        service3Use3: "Violesura vya wateja vinavyotumia data",
        service3Related: "Dhana teule za miradi",
        service4Title: "Uboreshaji wa tovuti",
        service4Text: "Kuboresha mpangilio, tabia kwa vifaa, urambazaji na uwazi kwa tovuti ambazo hazitumiki vizuri tena.",
        service4Use1: "Muonekano wa zamani",
        service4Use2: "Uzoefu mbaya kwenye simu",
        service4Use3: "Urambazaji na maudhui yasiyo wazi",
        service4Related: "Miradi teule",
        service5Title: "Muunganisho wa API na mifumo",
        service5Text: "Kuunganisha violesura vya wavuti na API zinazotumika na huduma za upande wa seva inapofaa kiufundi.",
        service5Use1: "Kuunganisha fomu na mifumo inayotumika",
        service5Use2: "Kuunganisha huduma za wahusika wengine",
        service5Use3: "Kupanga data kati ya mifumo",
        service5Related: "Tovuti binafsi ya kazi",
        service6Title: "Msaada wa kiufundi na maboresho",
        service6Text: "Kusaidia kutambua na kutatua matatizo ya tovuti, kuboresha urahisi wa matumizi na kudumisha miradi iliyopo bila kuijenga upya bila sababu.",
        service6Use1: "Kurekebisha mpangilio na matatizo ya vivinjari",
        service6Use2: "Kuboresha urahisi wa matumizi na ufikivu",
        service6Use3: "Kudumisha tovuti zilizopo",
        service6Related: "Miradi teule",
        scopeKicker: "Upeo na bei",
        scopeTitle: "Kila mradi huanza na <em>mazungumzo.</em>",
        scopeP1: "Hakuna vifurushi vilivyowekwa hapa. Upeo, muda na gharama hutegemea kile mradi unahitaji kwa dhati. Baada ya kujadili mahitaji yako, utapokea pendekezo wazi kabla kazi yoyote kuanza.",
        scopeP2: "Hakuna bei za kubuni kwenye tovuti hii. Hakuna nyongeza za kushtukiza. Upeo wa wazi tu uliokubaliwa mapema.",
        scopeNote: "Bei maalum hazichapishwi kwa sababu kila mradi ni tofauti. Utafahamu upeo kila wakati kabla kazi kuanza.",
        scopeCta: "Zungumzia mahitaji yako"
      },
      contactPage: {
        eyebrow: "Mawasiliano",
        title: "Tuzungumzie <em>unachokijenga.</em>",
        lede: "Iwe una maelezo kamili tayari au mwanzo wa wazo, hatua inayofuata ni mazungumzo ya wazi.",
        channelCallLabel: "Piga simu",
        channelCallNote: "Zungumza moja kwa moja na Thomas",
        channelWhatsappLabel: "WhatsApp",
        channelWhatsappNote: "Tuma ujumbe wakati wowote",
        channelEmailLabel: "Barua pepe",
        channelEmailNote: "Eleza mradi wako kwa kina",
        channelLocationLabel: "Mahali",
        channelLocationValue: "Kenya",
        channelLocationNote: "Saa za Afrika Mashariki · Kazi kwa mbali",
        sideKicker: "Wasiliana nami",
        sideTitle: "Njia ya moja kwa moja kwa mtu anayefanya kazi.",
        sideText: "Shiriki maelezo mafupi kuhusu mradi. Ninasoma kila ombi mwenyewe na nitajibu kupitia njia ya mawasiliano unayochagua.",
        directPhone: "Simu",
        directEmail: "Barua pepe",
        directWhatsapp: "WhatsApp",
        directLocation: "Mahali",
        locationValue: "Kenya · Saa za Afrika Mashariki",
        stepsHeading: "Kinachofuata",
        step1: "Unashiriki tatizo, malengo na maelezo yoyote muhimu.",
        step2: "Nakagua maelezo na kujibu ili kujadili kama tunaweza kufanya kazi pamoja.",
        step3: "Ikieleweka, tunakubaliana upeo, muda na gharama kabla kazi kuanza.",
        formHeading: "Niambie kuhusu mradi wako",
        formLede: "Jaza sehemu zilizo hapa chini ili kuandaa ujumbe. Utaweza kukagua kila kitu kabla ya kufungua WhatsApp au programu yako ya barua pepe.",
        formName: "Jina kamili",
        formNamePlaceholder: "Jina lako kamili",
        formEmail: "Anwani ya barua pepe",
        formEmailPlaceholder: "we@mfano.com",
        formPhone: "Namba ya simu",
        formPhonePlaceholder: "+254 7XX XXX XXX",
        formOptional: "Si lazima",
        formProjectType: "Aina ya mradi",
        formProjectTypePlaceholder: "Chagua aina ya mradi",
        formProjectWebsite: "Ubunifu na uundaji wa tovuti",
        formProjectLanding: "Ukurasa wa biashara",
        formProjectApp: "Mfumo wa wavuti",
        formProjectRedesign: "Uboreshaji wa tovuti",
        formProjectIntegration: "Muunganisho wa API au mfumo",
        formProjectSupport: "Msaada wa kiufundi",
        formProjectOther: "Kitu kingine",
        formDescription: "Maelezo ya mradi",
        formDescriptionPlaceholder: "Unataka kujenga au kuboresha nini? Jumuisha maelezo, malengo au vikwazo muhimu.",
        formDescriptionHint: "Sentensi chache zinatosha kuanza. Herufi 20 kwa uchache.",
        formContactLegend: "Njia unayopendelea ya mawasiliano",
        formContactWhatsapp: "WhatsApp",
        formContactEmail: "Barua pepe",
        formContactPhone: "Simu",
        formRequiredNote: "Sehemu zilizo na * zinahitajika.",
        formNote: "Tovuti hii haitumi ujumbe wako kiotomatiki. Inaandaa ujumbe kwenye kivinjari chako na kufungua njia ya mawasiliano unayochagua. Taarifa zako hazihifadhiwi na tovuti hii.",
        formSubmit: "Kagua ujumbe wangu",
        formReset: "Safisha fomu",
        formErrorSummary: "Tafadhali kagua sehemu zilizoangaziwa.",
        formErrorName: "Tafadhali weka jina lako kamili.",
        formErrorEmail: "Tafadhali weka anwani sahihi ya barua pepe.",
        formErrorPhone: "Tafadhali weka namba sahihi ya simu, au iache wazi.",
        formErrorProjectType: "Tafadhali chagua aina ya mradi.",
        formErrorDescription: "Tafadhali eleza mradi wako kwa angalau herufi 20.",
        formErrorContact: "Tafadhali chagua njia unayopendelea ya mawasiliano.",
        formReviewTitle: "Ujumbe wako uko tayari kukaguliwa",
        formReviewLede: "Hakuna kilichotumwa bado. Chagua jinsi unataka kuendelea. Ujumbe utafunguka kwenye WhatsApp au programu yako ya barua pepe, ambapo utautuma mwenyewe.",
        formReviewMessageLabel: "Ujumbe ulioandaliwa",
        formOpenWhatsapp: "Fungua WhatsApp",
        formOpenEmail: "Fungua barua pepe",
        formCopy: "Nakili ujumbe",
        formCopied: "Ujumbe umenakiliwa.",
        formCopyError: "Imeshindikana kunakili kiotomatiki. Tafadhali chagua ujumbe na unakili mwenyewe.",
        formEdit: "Rudi kwenye fomu",
        formReviewDisclaimer: "Ujumbe huu unaandaliwa kwenye kivinjari chako. Tovuti haitumi au kuhifadhi taarifa zako.",
        formMessageTemplate: "Hujambo Thomas, nimetembelea tovuti yako na ningependa kuzungumzia mradi.\n\nJina: {name}\nBarua pepe: {email}\nSimu: {phone}\nAina ya mradi: {projectType}\nNjia ya mawasiliano: {contactMethod}\n\nMaelezo ya mradi:\n{description}",
        formNotProvided: "Haijatolewa",
        formEmailSubject: "Ombi la mradi kutoka kwa {name} — {projectType}",
        formWhatsappContact: "WhatsApp",
        formEmailContact: "Barua pepe",
        formPhoneContact: "Simu",
        privacyTitle: "Faragha",
        privacyText: "Tovuti hii huhifadhi tu lugha na mandhari ulizochagua kwenye LocalStorage ya kivinjari chako. Taarifa za fomu ya mawasiliano hubaki kwenye kivinjari chako na hazitumwa kwa seva. Unapofungua WhatsApp au barua pepe, ujumbe hupewa huduma hiyo na masharti yake ya faragha hutumika.",
        asideCtaTitle: "Unapendelea njia rahisi?",
        asideCtaText: "Piga simu, tuma ujumbe au barua pepe moja kwa moja. Huhitaji kutumia fomu.",
        asideCall: "Piga 0705023432",
        asideWhatsapp: "Tuma ujumbe kwa WhatsApp",
        asideEmail: "Tuma barua pepe"
      },
      footer: {
        description: "Mhandisi wa programu anayejenga tovuti za kisasa na mifumo ya wavuti kwa biashara, mashirika na wataalamu nchini Kenya na kwingineko.",
        explore: "Gundua",
        contact: "Mawasiliano",
        status: "Niko Kenya · Tayari kwa mazungumzo ya mradi",
        rights: "Haki zote zimehifadhiwa.",
        credit: "Imeundwa na kutengenezwa na Thomas Hondo Chacha.",
        privacyLabel: "Faragha",
        privacyNote: "Tovuti hii huhifadhi tu lugha na mandhari ulizochagua kwenye kivinjari chako. Fomu ya mawasiliano haitumi au kuhifadhi data.",
        backToTop: "Rudi juu"
      },
      notFound: {
        code: "Hitilafu 404",
        title: "Ukurasa huu <em>umepotea.</em>",
        text: "Ukurasa unaoutafuta haupo, au anwani yake imebadilika. Turudi kwenye kitu chenye manufaa.",
        home: "Rudi mwanzo",
        projects: "Tazama miradi"
      },
      whatsapp: {
        general: "Hujambo Thomas, nimetembelea tovuti yako na ningependa kuzungumzia mradi.",
        websiteDesign: "Hujambo Thomas, nimetembelea tovuti yako na ninavutiwa na ubunifu na uundaji wa tovuti. Ningependa kuzungumzia mradi.",
        landingPage: "Hujambo Thomas, nimetembelea tovuti yako na ninavutiwa na ukurasa wa biashara. Ningependa kuzungumzia mradi.",
        webApp: "Hujambo Thomas, nimetembelea tovuti yako na ninavutiwa na mfumo wa wavuti. Ningependa kuzungumzia mradi.",
        redesign: "Hujambo Thomas, nimetembelea tovuti yako na ninavutiwa na uboreshaji wa tovuti. Ningependa kuzungumzia mradi.",
        integration: "Hujambo Thomas, nimetembelea tovuti yako na ninavutiwa na muunganisho wa API au mfumo. Ningependa kuzungumzia mradi.",
        support: "Hujambo Thomas, nimetembelea tovuti yako na ningependa kuzungumzia msaada wa kiufundi au maboresho ya tovuti."
      }
    }
  };

  function lookup(language, path) {
    var parts = String(path).split(".");
    var node = translations[language];

    for (var i = 0; i < parts.length; i += 1) {
      if (node === null || typeof node === "undefined") {
        return undefined;
      }
      node = node[parts[i]];
    }

    return node;
  }

  function interpolate(value, replacements) {
    if (!replacements) {
      return value;
    }

    return String(value).replace(/\{([a-zA-Z0-9_]+)\}/g, function (match, key) {
      return Object.prototype.hasOwnProperty.call(replacements, key) ? translationsSafe(replacements[key]) : match;
    });
  }

  function translationsSafe(value) {
    return value === null || typeof value === "undefined" ? "" : String(value);
  }

  function t(path, replacements) {
    var value = lookup(currentLanguage, path);

    if (typeof value === "undefined") {
      value = lookup("en", path);
    }

    if (typeof value === "undefined") {
      return path;
    }

    return interpolate(value, replacements);
  }

  function raw(path) {
    var value = lookup(currentLanguage, path);

    if (typeof value === "undefined") {
      value = lookup("en", path);
    }

    return value;
  }

  function replaceText(root) {
    root.querySelectorAll("[data-i18n]").forEach(function (element) {
      element.textContent = t(element.getAttribute("data-i18n"));
    });

    root.querySelectorAll("[data-i18n-html]").forEach(function (element) {
      element.innerHTML = t(element.getAttribute("data-i18n-html"));
    });

    root.querySelectorAll("[data-i18n-placeholder]").forEach(function (element) {
      element.setAttribute("placeholder", t(element.getAttribute("data-i18n-placeholder")));
    });

    root.querySelectorAll("[data-i18n-aria-label]").forEach(function (element) {
      element.setAttribute("aria-label", t(element.getAttribute("data-i18n-aria-label")));
    });

    root.querySelectorAll("[data-i18n-title]").forEach(function (element) {
      element.setAttribute("title", t(element.getAttribute("data-i18n-title")));
    });

    root.querySelectorAll("[data-i18n-alt]").forEach(function (element) {
      element.setAttribute("alt", t(element.getAttribute("data-i18n-alt")));
    });
  }

  function setMeta(attribute, name, value) {
    if (!value) {
      return;
    }

    var selector = attribute === "property" ? 'meta[property="' + name + '"]' : 'meta[name="' + name + '"]';
    var element = document.head.querySelector(selector);

    if (element) {
      element.setAttribute("content", value);
    }
  }

  function updateMetadata() {
    var page = document.body && document.body.dataset.page ? document.body.dataset.page : "home";
    var title = t("meta." + page + ".title");
    var description = t("meta." + page + ".description");
    var imageAlt = t("meta." + page + ".imageAlt");
    var locale = currentLanguage === "sw" ? "sw_KE" : "en_KE";
    var alternateLocale = currentLanguage === "sw" ? "en_KE" : "sw_KE";

    document.title = title;
    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:locale", locale);
    setMeta("property", "og:locale:alternate", alternateLocale);
    setMeta("property", "og:image:alt", imageAlt);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image:alt", imageAlt);
  }

  function updateLanguageButtons() {
    document.querySelectorAll("[data-lang]").forEach(function (button) {
      var language = button.getAttribute("data-lang");
      var isActive = language === currentLanguage;
      var name = language === "sw" ? t("language.swahili") : t("language.english");

      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
      button.setAttribute(
        "aria-label",
        isActive ? t("a11y.selectedLanguage", { language: name }) : t("a11y.switchToLanguage", { language: name })
      );
    });
  }

  function applyLanguage() {
    document.documentElement.setAttribute("lang", currentLanguage);
    replaceText(document);
    updateMetadata();
    updateLanguageButtons();
  }

  function readStoredLanguage() {
    try {
      var stored = window.localStorage.getItem(STORAGE_KEY);
      return stored === "sw" || stored === "en" ? stored : "en";
    } catch (error) {
      return "en";
    }
  }

  function bindLanguageButtons() {
    document.querySelectorAll("[data-lang]").forEach(function (button) {
      if (button.dataset.languageBound === "true") {
        return;
      }

      button.dataset.languageBound = "true";
      button.addEventListener("click", function () {
        setLanguage(button.getAttribute("data-lang"));
      });
    });
  }

  function setLanguage(language, persist) {
    var next = language === "sw" || language === "en" ? language : "en";

    if (next === currentLanguage && initialized) {
      return;
    }

    currentLanguage = next;

    if (persist !== false) {
      try {
        window.localStorage.setItem(STORAGE_KEY, currentLanguage);
      } catch (error) {
        // Language still applies for the current page when storage is blocked.
      }
    }

    applyLanguage();

    document.dispatchEvent(
      new CustomEvent("thc:languagechange", {
        detail: { language: currentLanguage }
      })
    );
  }

  function init() {
    currentLanguage = readStoredLanguage();
    bindLanguageButtons();
    applyLanguage();
    initialized = true;
  }

  window.Language = {
    init: init,
    set: setLanguage,
    get: function () {
      return currentLanguage;
    },
    t: t,
    raw: raw,
    apply: applyLanguage
  };
})();
