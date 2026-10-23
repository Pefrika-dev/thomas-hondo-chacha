/* ==========================================================================
   Thomas Hondo Chacha — Theme controller
   Loaded synchronously in <head> so the correct theme is painted immediately.
   ========================================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "thc-theme";
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var themeButtons = [];
  var ready = false;

  // Add the JS class before first paint. Progressive enhancement relies on it.
  root.classList.add("js");

  function readPreference() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      return value === "light" || value === "dark" ? value : null;
    } catch (error) {
      return null;
    }
  }

  function systemTheme() {
    return media && media.matches ? "dark" : "light";
  }

  var savedPreference = readPreference();
  var currentTheme = savedPreference || systemTheme();

  function updateMetaColour(theme) {
    var meta = document.getElementById("meta-theme-color");
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#0b1015" : "#f4f1e9");
    }
  }

  function syncButtons() {
    themeButtons.forEach(function (button) {
      var value = button.getAttribute("data-theme-value");
      button.setAttribute("aria-pressed", value === currentTheme ? "true" : "false");
      button.classList.toggle("is-active", value === currentTheme);
    });
  }

  function apply(theme, persist) {
    currentTheme = theme === "dark" ? "dark" : "light";
    root.setAttribute("data-theme", currentTheme);
    root.style.colorScheme = currentTheme;
    updateMetaColour(currentTheme);

    if (persist) {
      try {
        window.localStorage.setItem(STORAGE_KEY, currentTheme);
      } catch (error) {
        // The theme still works for this page even when storage is unavailable.
      }
    }

    syncButtons();

    if (ready) {
      document.dispatchEvent(
        new CustomEvent("thc:themechange", {
          detail: { theme: currentTheme, persisted: Boolean(persist) }
        })
      );
    }
  }

  function setTheme(theme, persist) {
    apply(theme, persist !== false);
  }

  function toggleTheme() {
    setTheme(currentTheme === "dark" ? "light" : "dark", true);
  }

  // Apply before CSS paints. If a saved preference exists, use it. Otherwise
  // use the operating system setting and continue to follow it until chosen.
  apply(currentTheme, false);

  function bindButtons() {
    themeButtons = Array.prototype.slice.call(document.querySelectorAll("[data-theme-value]"));

    themeButtons.forEach(function (button) {
      if (button.dataset.themeBound === "true") {
        return;
      }

      button.dataset.themeBound = "true";
      button.addEventListener("click", function () {
        setTheme(button.getAttribute("data-theme-value"), true);
      });
    });

    syncButtons();
  }

  function handleSystemChange(event) {
    if (!readPreference()) {
      apply(event.matches ? "dark" : "light", false);
    }
  }

  function init() {
    ready = true;
    bindButtons();
    updateMetaColour(currentTheme);

    if (media) {
      if (typeof media.addEventListener === "function") {
        media.addEventListener("change", handleSystemChange);
      } else if (typeof media.addListener === "function") {
        media.addListener(handleSystemChange);
      }
    }
  }

  window.Theme = {
    init: init,
    get: function () {
      return currentTheme;
    },
    set: setTheme,
    toggle: toggleTheme,
    bind: bindButtons,
    sync: syncButtons
  };
})();
