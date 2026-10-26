/* ==========================================================================
   Thomas Hondo Chacha — floating WhatsApp button
   Injects one accessible link on every public page. The href is kept in sync
   with the site language through [data-wa-message], which main.js also uses.
   ========================================================================== */

(function () {
  "use strict";

  var WHATSAPP_NUMBER = "254705023432";
  var STORAGE_KEY = "thc-language";

  var COPY = {
    en: {
      label: "Chat with Thomas on WhatsApp",
      message: "Hello Thomas, I visited your website and would like to discuss a project."
    },
    sw: {
      label: "Zungumza na Thomas kwa WhatsApp",
      message: "Hujambo Thomas, nimetembelea tovuti yako na ningependa kuzungumzia mradi."
    }
  };

  var GLYPH =
    '<svg class="icon icon--fill" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.18-.3-.02-.46.13-.6.13-.14.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37s-1.04 1.01-1.04 2.48 1.07 2.87 1.22 3.07c.15.2 2.09 3.2 5.07 4.49.71.3 1.26.49 1.7.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.08-.12-.28-.2-.58-.34"/>' +
    '<path d="M12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.94L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.17-1.23-6.16-3.49-8.4"/>' +
    "</svg>";

  function currentLanguage() {
    var stored = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      stored = null;
    }

    if (stored === "sw" || stored === "en") {
      return stored;
    }

    return document.documentElement.getAttribute("lang") === "sw" ? "sw" : "en";
  }

  function copyFor(language) {
    return COPY[language] || COPY.en;
  }

  function hrefFor(language) {
    return (
      "https://wa.me/" +
      WHATSAPP_NUMBER +
      "?text=" +
      encodeURIComponent(copyFor(language).message)
    );
  }

  function paint(link) {
    var copy = copyFor(currentLanguage());
    link.setAttribute("aria-label", copy.label);
    link.setAttribute("title", copy.label);
    link.setAttribute("href", hrefFor(currentLanguage()));
  }

  function build() {
    if (document.querySelector(".wa-float")) {
      return;
    }

    var link = document.createElement("a");
    link.className = "wa-float";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("data-wa-message", "whatsapp.general");
    link.innerHTML = GLYPH;

    paint(link);
    document.body.appendChild(link);

    document.addEventListener("thc:languagechange", function () {
      paint(link);
    });
  }

  if (document.body) {
    build();
  } else {
    document.addEventListener("DOMContentLoaded", build);
  }
})();
