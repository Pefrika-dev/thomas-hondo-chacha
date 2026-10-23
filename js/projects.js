/* ==========================================================================
   Thomas Hondo Chacha — Project portfolio
   Central project catalogue, card rendering, filters and case-study dialog.
   ========================================================================== */
(function () {
  "use strict";

  // Project facts live here. All human-facing copy lives in js/language.js.
  var projects = [
    {
      id: "jofa",
      title: "Jofa Hotel Website",
      type: "website",
      status: "demo",
      featured: true,
      cover: "assets/images/project-jofa.svg",
      technologies: ["HTML5", "CSS3", "JavaScript"],
      service: "website-design",
      links: {
        demo: null,
        source: null,
        internal: null
      }
    },
    {
      id: "suna",
      title: "Suna Motor Bazaar",
      type: "website",
      status: "demo",
      featured: true,
      cover: "assets/images/project-suna.svg",
      technologies: ["HTML5", "CSS3", "JavaScript"],
      service: "website-design",
      links: {
        demo: null,
        source: null,
        internal: null
      }
    },
    {
      id: "pefrika",
      title: "Pefrika Website",
      type: "website",
      status: "development",
      featured: true,
      cover: "assets/images/project-pefrika.svg",
      technologies: ["HTML5", "CSS3", "JavaScript"],
      service: "website-design",
      links: {
        demo: null,
        source: null,
        internal: null
      }
    },
    {
      id: "togotane",
      title: "Radio Togotane",
      type: "concept",
      status: "concept",
      featured: false,
      cover: "assets/images/project-togotane.svg",
      technologies: ["HTML5", "CSS3", "JavaScript"],
      service: "website-design",
      links: {
        demo: null,
        source: null,
        internal: null
      }
    },
    {
      id: "portfolio",
      title: "Personal Portfolio",
      type: "website",
      status: "development",
      featured: false,
      cover: "assets/images/project-portfolio.svg",
      technologies: ["HTML5", "CSS3", "Vanilla JavaScript", "LocalStorage"],
      service: "website-design",
      links: {
        demo: null,
        source: null,
        internal: null
      }
    }
  ];

  var state = {
    initialised: false,
    activeFilter: "all",
    currentProjectId: null,
    dialog: null
  };

  function t(key, replacements) {
    return window.Language.t(key, replacements);
  }

  function raw(key) {
    return window.Language.raw(key);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getProject(id) {
    return projects.filter(function (project) {
      return project.id === id;
    })[0];
  }

  function projectText(project, key) {
    return t("projectData." + project.id + "." + key);
  }

  function statusMarkup(status, extraClass) {
    return (
      '<span class="status status--' +
      escapeHtml(status) +
      (extraClass ? " " + extraClass : "") +
      '">' +
      escapeHtml(t("status." + status)) +
      "</span>"
    );
  }

  function arrowIcon() {
    return (
      '<svg class="icon icon--arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M7 17 17 7M8 7h9v9"/>' +
      "</svg>"
    );
  }

  function renderCard(project) {
    var category = projectText(project, "category");
    var summary = projectText(project, "summary");
    var alt = projectText(project, "alt");
    var typeLabel = t("projectType." + project.type);
    var caseStudy = t("common.viewCaseStudy");
    var techHtml = project.technologies
      .map(function (tech) {
        return "<li>" + escapeHtml(tech) + "</li>";
      })
      .join("");
    var external = "";

    if (project.links.demo) {
      external =
        '<a class="project-card__external" href="' +
        escapeHtml(project.links.demo) +
        '" target="_blank" rel="noopener noreferrer">' +
        escapeHtml(t("projectsPage.openDemo")) +
        '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path d="M7 17 17 7M8 7h9v9"/></svg>' +
        '<span class="visually-hidden">' +
        escapeHtml(t("a11y.externalLink")) +
        "</span></a>";
    }

    return (
      '<article class="project-card reveal" id="project-' +
      escapeHtml(project.id) +
      '" data-project-card data-project-id="' +
      escapeHtml(project.id) +
      '" data-project-type="' +
      escapeHtml(project.type) +
      '">' +
      '<button class="project-card__visual" type="button" data-project-open="' +
      escapeHtml(project.id) +
      '">' +
      '<span class="project-card__image-wrap">' +
      '<img class="project-card__image" src="' +
      escapeHtml(project.cover) +
      '" alt="' +
      escapeHtml(alt) +
      '" width="1200" height="900" loading="lazy" decoding="async">' +
      "</span>" +
      '<span class="project-card__visual-top">' +
      '<span class="project-card__visual-tag">' +
      escapeHtml(typeLabel) +
      "</span>" +
      statusMarkup(project.status) +
      "</span>" +
      '<span class="project-card__image-note">' +
      escapeHtml(t("common.illustrative")) +
      "</span>" +
      '<span class="visually-hidden">' +
      escapeHtml(caseStudy + ": " + project.title) +
      "</span>" +
      "</button>" +
      '<div class="project-card__body">' +
      '<div class="project-card__meta"><span>' +
      escapeHtml(category) +
      "</span></div>" +
      '<h3 class="project-card__title"><button type="button" data-project-open="' +
      escapeHtml(project.id) +
      '">' +
      escapeHtml(project.title) +
      "</button></h3>" +
      '<p class="project-card__description">' +
      escapeHtml(summary) +
      "</p>" +
      '<ul class="project-card__tech" aria-label="' +
      escapeHtml(t("projectsPage.modalStack")) +
      '">' +
      techHtml +
      "</ul>" +
      '<div class="project-card__footer">' +
      '<button class="text-link" type="button" data-project-open="' +
      escapeHtml(project.id) +
      '">' +
      escapeHtml(caseStudy) +
      arrowIcon() +
      "</button>" +
      external +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  function renderGrids() {
    var grids = document.querySelectorAll("[data-projects-grid]");

    grids.forEach(function (grid) {
      var mode = grid.getAttribute("data-projects-grid");
      var list = mode === "featured"
        ? projects.filter(function (project) {
            return project.featured;
          })
        : projects;

      grid.innerHTML = list.map(renderCard).join("");
    });

    applyFilter(state.activeFilter);
    document.dispatchEvent(new CustomEvent("thc:projectsrendered"));
  }

  function updateCount() {
    var cards = document.querySelectorAll("[data-project-card]");
    var visible = 0;

    cards.forEach(function (card) {
      if (!card.hidden) {
        visible += 1;
      }
    });

    document.querySelectorAll("[data-project-count]").forEach(function (element) {
      element.textContent = t("projectsPage.count", { count: visible });
    });

    var empty = document.getElementById("project-empty");
    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  function applyFilter(filter) {
    state.activeFilter = filter || "all";

    document.querySelectorAll("[data-project-card]").forEach(function (card) {
      var type = card.getAttribute("data-project-type");
      card.hidden = state.activeFilter !== "all" && type !== state.activeFilter;
    });

    document.querySelectorAll("[data-project-filter]").forEach(function (button) {
      var isActive = button.getAttribute("data-project-filter") === state.activeFilter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    updateCount();
  }

  function initFilters() {
    document.querySelectorAll("[data-project-filter]").forEach(function (button) {
      if (button.dataset.filterBound === "true") {
        return;
      }

      button.dataset.filterBound = "true";
      button.addEventListener("click", function () {
        applyFilter(button.getAttribute("data-project-filter"));
      });
    });
  }

  function linkMarkup(project) {
    var links = [];
    var baseAttrs = ' target="_blank" rel="noopener noreferrer"';

    if (project.links.demo) {
      links.push(
        '<a href="' +
          escapeHtml(project.links.demo) +
          '"' +
          baseAttrs +
          ">" +
          escapeHtml(t("projectsPage.openDemo")) +
          "<span class=\"visually-hidden\"> — " +
          escapeHtml(t("a11y.externalLink")) +
          "</span></a>"
      );
    }

    if (project.links.source) {
      links.push(
        '<a href="' +
          escapeHtml(project.links.source) +
          '"' +
          baseAttrs +
          ">" +
          escapeHtml(t("projectsPage.openSource")) +
          "<span class=\"visually-hidden\"> — " +
          escapeHtml(t("a11y.externalLink")) +
          "</span></a>"
      );
    }

    if (project.links.internal) {
      links.push(
        '<a href="' +
          escapeHtml(project.links.internal) +
          '">' +
          escapeHtml(t("projectsPage.openSite")) +
          "</a>"
      );
    }

    return links.length ? links.join(" · ") : "";
  }

  function renderDialog(project) {
    if (!state.dialog) {
      return;
    }

    var summary = projectText(project, "summary");
    var features = raw("projectData." + project.id + ".features") || [];
    var featureHtml = features
      .map(function (feature) {
        return "<li>" + escapeHtml(feature) + "</li>";
      })
      .join("");
    var techHtml = project.technologies
      .map(function (tech) {
        return "<li>" + escapeHtml(tech) + "</li>";
      })
      .join("");
    var linksHtml = linkMarkup(project);
    var availability = projectText(project, "availability");
    var closeLabel = t("projectsPage.modalClose");

    state.dialog.innerHTML =
      '<div class="project-modal__shell">' +
      '<div class="project-modal__media">' +
      '<img src="' +
      escapeHtml(project.cover) +
      '" alt="' +
      escapeHtml(projectText(project, "alt")) +
      '" width="1200" height="900">' +
      '<div class="project-modal__media-meta">' +
      statusMarkup(project.status) +
      '<span class="project-card__visual-tag">' +
      escapeHtml(t("projectType." + project.type)) +
      "</span>" +
      "</div>" +
      '<span class="project-modal__visual-note">' +
      escapeHtml(t("projectsPage.modalImageNote")) +
      "</span>" +
      "</div>" +
      '<div class="project-modal__content">' +
      '<button class="project-modal__close" type="button" data-close-project aria-label="' +
      escapeHtml(closeLabel) +
      '">' +
      '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M6 6l12 12M18 6 6 18"/></svg>' +
      "</button>" +
      '<p class="project-modal__kicker"><span>' +
      escapeHtml(projectText(project, "category")) +
      "</span></p>" +
      '<h2 id="project-dialog-title">' +
      escapeHtml(project.title) +
      "</h2>" +
      '<p class="project-modal__summary">' +
      escapeHtml(summary) +
      "</p>" +
      '<div class="project-modal__facts">' +
      '<div><span class="project-modal__fact-label">' +
      escapeHtml(t("projectsPage.modalStack")) +
      '</span><div class="project-modal__fact-value"><ul class="project-card__tech">' +
      techHtml +
      "</ul></div></div>" +
      '<div><span class="project-modal__fact-label">' +
      escapeHtml(t("projectsPage.modalStatus")) +
      '</span><div class="project-modal__fact-value">' +
      statusMarkup(project.status) +
      "</div></div>" +
      "</div>" +
      (linksHtml
        ? '<div class="project-modal__section"><h3>' +
          escapeHtml(t("projectsPage.modalLinks")) +
          '</h3><p class="project-modal__fact-value">' +
          linksHtml +
          "</p></div>"
        : "") +
      '<div class="project-modal__section"><h3>' +
      escapeHtml(t("projectsPage.modalProblem")) +
      "</h3><p>" +
      escapeHtml(projectText(project, "problem")) +
      "</p></div>" +
      '<div class="project-modal__section"><h3>' +
      escapeHtml(t("projectsPage.modalApproach")) +
      "</h3><p>" +
      escapeHtml(projectText(project, "solution")) +
      "</p></div>" +
      '<div class="project-modal__section"><h3>' +
      escapeHtml(t("projectsPage.modalFeatures")) +
      "</h3><ul class=\"feature-list\">" +
      featureHtml +
      "</ul></div>" +
      '<div class="project-modal__section"><h3>' +
      escapeHtml(t("projectsPage.modalLimitations")) +
      "</h3><p>" +
      escapeHtml(projectText(project, "limitations")) +
      "</p></div>" +
      '<div class="project-modal__availability">' +
      escapeHtml(availability) +
      "</div>" +
      '<div class="project-modal__actions">' +
      '<a class="button button--primary" href="contact.html?service=' +
      encodeURIComponent(project.service) +
      '">' +
      escapeHtml(t("projectsPage.modalDiscuss")) +
      arrowIcon() +
      "</a>" +
      '<button class="button button--ghost" type="button" data-close-project>' +
      escapeHtml(t("common.close")) +
      "</button>" +
      "</div>" +
      "</div>" +
      "</div>";
  }

  function openProject(id) {
    var project = getProject(id);

    if (!project || !state.dialog) {
      return;
    }

    state.currentProjectId = id;
    renderDialog(project);

    if (!state.dialog.open) {
      if (typeof state.dialog.showModal === "function") {
        state.dialog.showModal();
      } else {
        state.dialog.setAttribute("open", "open");
      }
    }

    document.body.classList.add("modal-open");

    if (window.location.hash !== "#project-" + id) {
      window.history.replaceState(null, "", "#project-" + id);
    }

    var closeButton = state.dialog.querySelector("[data-close-project]");
    if (closeButton) {
      closeButton.focus();
    }
  }

  function closeProject() {
    if (!state.dialog || !state.dialog.open) {
      return;
    }

    if (typeof state.dialog.close === "function") {
      state.dialog.close();
    } else {
      state.dialog.removeAttribute("open");
      document.body.classList.remove("modal-open");
    }
  }

  function initDialog() {
    state.dialog = document.getElementById("project-dialog");

    if (!state.dialog) {
      return;
    }

    state.dialog.setAttribute("aria-label", t("a11y.projectDialog"));
    state.dialog.addEventListener("click", function (event) {
      if (event.target.closest("[data-close-project]")) {
        closeProject();
        return;
      }

      if (event.target === state.dialog) {
        var rect = state.dialog.getBoundingClientRect();
        var inside =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;

        if (!inside) {
          closeProject();
        }
      }
    });

    state.dialog.addEventListener("close", function () {
      document.body.classList.remove("modal-open");
      state.currentProjectId = null;

      if (window.location.hash.indexOf("#project-") === 0) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    });
  }

  function handleDocumentClicks(event) {
    var opener = event.target.closest("[data-project-open]");

    if (opener) {
      event.preventDefault();
      openProject(opener.getAttribute("data-project-open"));
      return;
    }

    if (event.target.closest("[data-close-project]")) {
      event.preventDefault();
      closeProject();
    }
  }

  function openFromHash() {
    if (window.location.hash.indexOf("#project-") !== 0) {
      return;
    }

    var id = decodeURIComponent(window.location.hash.replace("#project-", ""));
    openProject(id);
  }

  function init() {
    if (state.initialised) {
      return;
    }

    state.initialised = true;
    renderGrids();
    initFilters();
    initDialog();
    document.addEventListener("click", handleDocumentClicks);
    window.addEventListener("hashchange", openFromHash);

    document.addEventListener("thc:languagechange", function () {
      renderGrids();

      if (state.currentProjectId) {
        var project = getProject(state.currentProjectId);
        if (project) {
          renderDialog(project);
        }
      }
    });

    // Defer hash opening until after the grids have been painted.
    window.setTimeout(openFromHash, 0);
  }

  window.ProjectPortfolio = {
    init: init,
    projects: projects,
    open: openProject,
    close: closeProject
  };
})();
