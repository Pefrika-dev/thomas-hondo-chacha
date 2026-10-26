/* ==========================================================================
   Thomas Hondo Chacha — Shared interface behaviour
   Navigation, scroll state, reveals, links, footer year.
   ========================================================================== */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "254705023432";
  var mobileQuery = window.matchMedia ? window.matchMedia("(max-width: 980px)") : null;
  var revealObserver = null;
  var revealScrollBound = false;
  var revealScrollTicking = false;

  function t(key, replacements) {
    return window.Language.t(key, replacements);
  }

  function currentMenuLabel(open) {
    return t(open ? "a11y.menuClose" : "a11y.menuOpen");
  }

  function initHeaderState() {
    var header = document.querySelector(".site-header");

    if (!header) {
      return;
    }

    var ticking = false;

    function update() {
      ticking = false;
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("primary-nav");

    if (!toggle || !nav) {
      return;
    }

    function focusableElements() {
      var selector =
        '.site-header a[href], .site-header button:not([disabled]), .site-header [tabindex]:not([tabindex="-1"])';
      return Array.prototype.slice.call(document.querySelectorAll(selector)).filter(function (element) {
        return element.offsetParent !== null;
      });
    }

    function setMenu(open, returnFocus) {
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");

      var label = currentMenuLabel(open);
      toggle.setAttribute("aria-label", label);
      toggle.setAttribute("title", label);

      if (open) {
        var focusTargets = focusableElements();
        var firstNavLink = nav.querySelector("a[href]");
        var target = firstNavLink || focusTargets[0];
        if (target) {
          window.setTimeout(function () {
            target.focus();
          }, 50);
        }
      } else if (returnFocus) {
        toggle.focus();
      }
    }

    function isOpen() {
      return toggle.getAttribute("aria-expanded") === "true";
    }

    toggle.addEventListener("click", function () {
      setMenu(!isOpen(), false);
    });

    nav.querySelectorAll("a[href]").forEach(function (link) {
      link.addEventListener("click", function () {
        if (mobileQuery && mobileQuery.matches) {
          setMenu(false, false);
        }
      });
    });

    document.addEventListener("keydown", function (event) {
      if (!isOpen()) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setMenu(false, true);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      var focusable = focusableElements();
      if (!focusable.length) {
        return;
      }

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    function handleBreakpointChange(event) {
      if (!event.matches && isOpen()) {
        setMenu(false, false);
      }
    }

    if (mobileQuery) {
      if (typeof mobileQuery.addEventListener === "function") {
        mobileQuery.addEventListener("change", handleBreakpointChange);
      } else if (typeof mobileQuery.addListener === "function") {
        mobileQuery.addListener(handleBreakpointChange);
      }
    }

    document.addEventListener("thc:languagechange", function () {
      var label = currentMenuLabel(isOpen());
      toggle.setAttribute("aria-label", label);
      toggle.setAttribute("title", label);
    });
  }

  function revealPassedElements() {
    var threshold = window.innerHeight * 0.95;

    document.querySelectorAll(".reveal:not(.is-visible)").forEach(function (element) {
      if (element.getBoundingClientRect().top < threshold) {
        element.classList.add("is-visible");
        if (revealObserver) {
          revealObserver.unobserve(element);
        }
      }
    });
  }

  function handleRevealScroll() {
    if (revealScrollTicking) {
      return;
    }

    revealScrollTicking = true;
    window.requestAnimationFrame(function () {
      revealScrollTicking = false;
      revealPassedElements();
    });
  }

  function initReveals() {
    var elements = Array.prototype.slice.call(
      document.querySelectorAll(".reveal:not([data-reveal-bound])")
    );

    if (!elements.length) {
      return;
    }

    elements.forEach(function (element) {
      element.setAttribute("data-reveal-bound", "true");
    });

    if (!revealScrollBound) {
      window.addEventListener("scroll", handleRevealScroll, { passive: true });
      revealScrollBound = true;
    }

    var reducedMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach(function (element) {
        element.classList.add("is-visible");
      });
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: "0px 0px -8% 0px",
          threshold: 0.07
        }
      );
    }

    elements.forEach(function (element) {
      revealObserver.observe(element);
    });
  }

  function initYear() {
    var year = new Date().getFullYear();
    document.querySelectorAll("[data-current-year]").forEach(function (element) {
      element.textContent = String(year);
    });
  }

  function updateWhatsAppLinks() {
    document.querySelectorAll("[data-wa-message], [data-wa-service]").forEach(function (link) {
      var messageKey = link.getAttribute("data-wa-message");
      var serviceKey = link.getAttribute("data-wa-service");
      var message = messageKey
        ? t(messageKey)
        : serviceKey
          ? t("whatsapp." + serviceKey)
          : t("whatsapp.general");

      link.href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);

      if (link.getAttribute("target") === "_blank") {
        link.setAttribute("rel", "noopener noreferrer");
      }
    });
  }

  function initExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
      link.setAttribute("rel", "noopener noreferrer");
    });
  }

  // Keep the floating actions from covering the footer links (e.g. "Back to top").
  function initFloatingGuard() {
    var footerBottom = document.querySelector(".footer__bottom");

    if (!footerBottom) {
      return;
    }

    function refresh() {
      var rect = footerBottom.getBoundingClientRect();
      var footerOnScreen = rect.top < window.innerHeight;
      var scrolled = window.scrollY > 80;

      document.documentElement.classList.toggle(
        "floats-at-footer",
        footerOnScreen && scrolled
      );
    }

    window.addEventListener("scroll", refresh, { passive: true });
    window.addEventListener("resize", refresh);
    refresh();
  }

  function init() {
    window.Language.init();
    window.Theme.init();

    initHeaderState();
    initNavigation();
    initYear();
    updateWhatsAppLinks();
    initExternalLinks();
    initReveals();
    initFloatingGuard();

    document.addEventListener("thc:projectsrendered", function () {
      initReveals();
    });

    document.addEventListener("thc:languagechange", function () {
      updateWhatsAppLinks();
    });

    if (window.ProjectPortfolio) {
      window.ProjectPortfolio.init();
    }

    if (window.ContactForm) {
      window.ContactForm.init();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
