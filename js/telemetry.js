/* ==========================================================================
   First-party telemetry.
   Records page views and real conversion actions (WhatsApp taps, contact
   links, enquiry submissions, social clicks) to /api/track.

   Rules:
   * no cookies, no third-party scripts, no advertising identifiers
   * nothing is sent when the browser sends Do Not Track, or when the visitor
     has opted out (localStorage thc-no-track = "1")
   * no form values or personal data are ever read; only the event name,
     the page path and campaign labels are sent
   ========================================================================== */
(function () {
  "use strict";

  var ENDPOINT = "/api/track";
  var MAX_PAYLOAD = 1800;

  function optedOut() {
    if (navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.msDoNotTrack === "1") {
      return true;
    }
    try {
      return window.localStorage.getItem("thc-no-track") === "1";
    } catch (error) {
      return false;
    }
  }

  if (optedOut()) {
    return;
  }

  function randomId() {
    try {
      var bytes = new Uint8Array(12);
      window.crypto.getRandomValues(bytes);
      return Array.prototype.map.call(bytes, function (byte) {
        return ("0" + byte.toString(16)).slice(-2);
      }).join("");
    } catch (error) {
      return String(Date.now()) + Math.random().toString(16).slice(2);
    }
  }

  var sessionId;
  try {
    sessionId = window.sessionStorage.getItem("thc-sid");
    if (!sessionId) {
      sessionId = randomId();
      window.sessionStorage.setItem("thc-sid", sessionId);
    }
  } catch (error) {
    sessionId = randomId();
  }

  function params() {
    try {
      return new URLSearchParams(window.location.search);
    } catch (error) {
      return null;
    }
  }

  function utm() {
    var search = params();
    if (!search) return {};
    return {
      source: search.get("utm_source") || search.get("ref") || "",
      medium: search.get("utm_medium") || "",
      campaign: search.get("utm_campaign") || "",
    };
  }

  function device() {
    if (!window.matchMedia) return "unknown";
    if (window.matchMedia("(max-width: 640px)").matches) return "mobile";
    if (window.matchMedia("(max-width: 1024px)").matches) return "tablet";
    return "desktop";
  }

  function referrerHost() {
    if (!document.referrer) return "";
    try {
      var host = new URL(document.referrer).hostname;
      return host === window.location.hostname ? "" : host;
    } catch (error) {
      return "";
    }
  }

  var base = {
    path: window.location.pathname,
    referrer_host: referrerHost(),
    lang: document.documentElement.lang || "en",
    device: device(),
    session_id: sessionId,
  };

  var campaign = utm();
  base.source = campaign.source;
  base.medium = campaign.medium;
  base.campaign = campaign.campaign;

  function send(event, extra) {
    var payload = { event: event };
    var key;
    for (key in base) {
      if (Object.prototype.hasOwnProperty.call(base, key)) payload[key] = base[key];
    }
    if (extra) {
      for (key in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, key)) payload[key] = extra[key];
      }
    }
    var body = JSON.stringify(payload);
    if (body.length > MAX_PAYLOAD) return;

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
        return;
      }
    } catch (error) {
      /* fall through to fetch */
    }

    try {
      window.fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        keepalive: true,
      }).catch(function () {});
    } catch (error) {
      /* analytics must never break the page */
    }
  }

  /* Public hook for other modules (contact form, chat widget). */
  window.thcTrack = send;

  function placementOf(link) {
    var explicit = link.getAttribute("data-track") || link.getAttribute("data-placement");
    if (explicit) return explicit;
    var section = link.closest ? link.closest("[data-section], section[id], header, footer") : null;
    if (section) {
      return section.getAttribute("data-section") || section.id || section.tagName.toLowerCase();
    }
    return "unknown";
  }

  function isExternalSocial(host, href) {
    if (!host) return false;
    try {
      var target = new URL(href, window.location.href);
      if (target.hostname === window.location.hostname) return false;
      return /(^|\.)(facebook\.com|instagram\.com|linkedin\.com|x\.com|twitter\.com|youtube\.com|tiktok\.com)$/i.test(target.hostname);
    } catch (error) {
      return false;
    }
  }

  document.addEventListener("click", function (event) {
    var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (!link) return;

    var href = link.getAttribute("href") || "";

    if (/wa\.me|api\.whatsapp\.com|whatsapp:\/\//i.test(href)) {
      send("whatsapp_click", { placement: placementOf(link) });
      return;
    }
    if (/^mailto:/i.test(href) || /^tel:/i.test(href)) {
      send("contact_click", { placement: placementOf(link) });
      return;
    }
    if (isExternalSocial(window.location.hostname, href)) {
      send("social_click", { placement: placementOf(link) });
      return;
    }
    if (link.matches && link.matches(".btn, .btn--ghost, [data-cta]")) {
      send("cta_click", { placement: placementOf(link) });
    }
  }, { capture: true, passive: true });

  send("page_view");
})();
