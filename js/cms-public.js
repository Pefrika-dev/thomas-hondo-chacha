/* ==========================================================================
   Thomas Hondo Chacha — public CMS bridge
   Reads published projects, blog posts and site settings from Supabase.
   The static site remains the fallback when the API is unavailable.
   ========================================================================== */
(function () {
  "use strict";

  var SUPABASE_URL = "https://pumbpmgclnxisfkdaanm.supabase.co";
  var SUPABASE_KEY = "sb_publishable_dbDtzuRs1Ll8QZDYskQKSg_8LfoeDhD";
  var settingsCache = null;
  var projectsCache = null;
  var postsCache = null;
  var projectDetailCache = null;

  function lang() {
    return document.documentElement.lang === "sw" ? "sw" : "en";
  }

  function esc(value) {
    return String(value === null || typeof value === "undefined" ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function localized(row, key) {
    if (!row) return "";
    var sw = row[key + "_sw"];
    if (lang() === "sw" && sw) return sw;
    return row[key] || "";
  }

  function api(path) {
    return fetch(SUPABASE_URL + "/rest/v1/" + path, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: "Bearer " + SUPABASE_KEY
      }
    }).then(function (response) {
      if (!response.ok) throw new Error("CMS request failed (" + response.status + ")");
      return response.json();
    });
  }

  function translate(key, replacements) {
    if (window.Language && typeof window.Language.t === "function") {
      return window.Language.t(key, replacements);
    }
    return key;
  }

  function translateRaw(key) {
    if (window.Language && typeof window.Language.raw === "function") {
      return window.Language.raw(key);
    }
    return undefined;
  }

  function formatDate(value) {
    if (!value) return "";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(lang() === "sw" ? "sw-KE" : "en-KE", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  function splitList(value) {
    return String(value || "")
      .split(",")
      .map(function (item) { return item.trim(); })
      .filter(Boolean);
  }

  function statusLabel(status) {
    var fallback = {
      demo: lang() === "sw" ? "Onyesho linalofanya kazi" : "Working demonstration",
      concept: lang() === "sw" ? "Dhana ya muundo" : "Concept design",
      development: lang() === "sw" ? "Inaendelezwa" : "In development",
      live: lang() === "sw" ? "Tovuti hai" : "Live website",
      completed: lang() === "sw" ? "Imekamilika" : "Completed"
    };
    var translated = translateRaw("status." + status);
    if (translated && translated !== "status." + status) return translated;
    return fallback[status] || status || "";
  }

  function projectType(project) {
    return project.status === "concept" ? "concept" : "website";
  }

  function projectCard(project) {
    var slug = project.slug || project.id;
    var url = "project.html?slug=" + encodeURIComponent(slug);
    var category = localized(project, "category");
    var summary = localized(project, "summary");
    var cover = project.cover_url || "assets/images/project-portfolio.svg";
    var technologies = splitList(project.technologies);
    var techHtml = technologies.map(function (tech) {
      return "<li>" + esc(tech) + "</li>";
    }).join("");
    var external = "";
    if (project.demo_url) {
      external =
        '<a class="project-card__external" href="' + esc(project.demo_url) + '" target="_blank" rel="noopener noreferrer">' +
        esc(lang() === "sw" ? "Fungua tovuti" : "Open live site") +
        '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg>' +
        "</a>";
    }

    return (
      '<article class="project-card reveal" data-project-card data-project-id="' + esc(project.id) + '" data-project-type="' + esc(projectType(project)) + '">' +
        '<a class="project-card__visual" href="' + esc(url) + '">' +
          '<span class="project-card__image-wrap">' +
            '<img class="project-card__image" src="' + esc(cover) + '" alt="' + esc(localized(project, "title")) + '" width="1200" height="900" loading="lazy" decoding="async">' +
          "</span>" +
          '<span class="project-card__visual-top">' +
            '<span class="project-card__visual-tag">' + esc(category || (lang() === "sw" ? "Mradi" : "Project")) + "</span>" +
            '<span class="status status--' + esc(project.status || "development") + '">' + esc(statusLabel(project.status)) + "</span>" +
          "</span>" +
          '<span class="project-card__image-note">' + esc(translate("common.illustrative")) + "</span>" +
        "</a>" +
        '<div class="project-card__body">' +
          '<div class="project-card__meta"><span>' + esc(category || (lang() === "sw" ? "Mradi" : "Project")) + "</span></div>" +
          '<h3 class="project-card__title"><a href="' + esc(url) + '">' + esc(localized(project, "title")) + "</a></h3>" +
          '<p class="project-card__description">' + esc(summary) + "</p>" +
          (techHtml ? '<ul class="project-card__tech" aria-label="' + esc(translate("projectsPage.modalStack")) + '">' + techHtml + "</ul>" : "") +
          '<div class="project-card__footer">' +
            '<a class="text-link" href="' + esc(url) + '">' + esc(translate("common.viewCaseStudy")) +
              '<svg class="icon icon--arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg>' +
            "</a>" + external +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function renderProjects() {
    var grids = document.querySelectorAll("[data-projects-grid]");
    if (!grids.length) return;

    if (!projectsCache) {
      api("projects?select=*&published=eq.true&order=sort_order.asc,created_at.desc")
        .then(function (rows) {
          projectsCache = Array.isArray(rows) ? rows : [];
          paintProjects();
        })
        .catch(function () {
          /* Keep the static fallback. */
        });
      return;
    }
    paintProjects();
  }

  function paintProjects() {
    if (!projectsCache || !projectsCache.length) return;

    document.querySelectorAll("[data-projects-grid]").forEach(function (grid) {
      var mode = grid.getAttribute("data-projects-grid");
      var list = mode === "featured"
        ? projectsCache.filter(function (project) { return project.featured; })
        : projectsCache.slice();
      if (mode === "featured" && !list.length) list = projectsCache.slice(0, 3);
      if (!list.length) return;
      grid.innerHTML = list.map(projectCard).join("");
    });

    document.querySelectorAll("[data-project-count]").forEach(function (element) {
      element.textContent = translate("projectsPage.count", { count: projectsCache.length });
    });
  }

  function blogCard(post) {
    var slug = post.slug || post.id;
    var url = "post.html?slug=" + encodeURIComponent(slug);
    var title = localized(post, "title");
    var excerpt = localized(post, "excerpt");
    if (!excerpt) {
      excerpt = localized(post, "content").replace(/[#*_>`\[\]]/g, "").slice(0, 170);
    }
    var cover = post.cover_url
      ? '<a class="blog-card__media" href="' + esc(url) + '"><img src="' + esc(post.cover_url) + '" alt="' + esc(title) + '" loading="lazy" decoding="async"></a>'
      : "";
    var tags = splitList(post.tags).map(function (tag) {
      return "<span>" + esc(tag) + "</span>";
    }).join("");

    return (
      '<article class="blog-card">' +
        cover +
        '<div class="blog-card__body">' +
          '<p class="blog-card__meta">' + esc(formatDate(post.published_at)) + "</p>" +
          '<h2 class="blog-card__title"><a href="' + esc(url) + '">' + esc(title) + "</a></h2>" +
          '<p class="blog-card__excerpt">' + esc(excerpt) + "</p>" +
          (tags ? '<div class="blog-card__tags">' + tags + "</div>" : "") +
          '<a class="text-link" href="' + esc(url) + '">' + esc(translate("blogPage.readMore")) +
            '<svg class="icon icon--arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg>' +
          "</a>" +
        "</div>" +
      "</article>"
    );
  }

  function renderBlogList() {
    var grid = document.querySelector("[data-blog-grid]");
    if (!grid) return;

    if (!postsCache) {
      api("posts?select=*&status=eq.published&published_at=lte." + encodeURIComponent(new Date().toISOString()) + "&order=published_at.desc")
        .then(function (rows) {
          postsCache = Array.isArray(rows) ? rows : [];
          paintBlogList();
        })
        .catch(function () {
          grid.innerHTML = '<p class="cms-empty">' + esc(translate("blogPage.empty")) + "</p>";
        });
      return;
    }
    paintBlogList();
  }

  function paintBlogList() {
    var grid = document.querySelector("[data-blog-grid]");
    if (!grid) return;
    if (!postsCache.length) {
      grid.innerHTML = '<p class="cms-empty">' + esc(translate("blogPage.empty")) + "</p>";
      return;
    }
    grid.innerHTML = postsCache.map(blogCard).join("");
  }

  function renderPost() {
    var container = document.querySelector("[data-post]");
    if (!container) return;

    var params = new URLSearchParams(window.location.search);
    var slug = params.get("slug");
    if (!slug) {
      container.innerHTML = '<p class="cms-empty">' + esc(translate("blogPage.notFound")) + "</p>";
      return;
    }

    container.innerHTML = '<p class="cms-empty">' + esc(translate("blogPage.loading")) + "</p>";

    api("posts?select=*&status=eq.published&slug=eq." + encodeURIComponent(slug) + "&limit=1")
      .then(function (rows) {
        if (!rows || !rows.length) {
          container.innerHTML = '<p class="cms-empty">' + esc(translate("blogPage.notFound")) + "</p>";
          return;
        }
        paintPost(rows[0], container);
      })
      .catch(function () {
        container.innerHTML = '<p class="cms-empty">' + esc(translate("blogPage.notFound")) + "</p>";
      });
  }

  function paintPost(post, container) {
    var title = localized(post, "title");
    var content = localized(post, "content");
    var excerpt = localized(post, "excerpt");
    var cover = post.cover_url
      ? '<img class="post-cover" src="' + esc(post.cover_url) + '" alt="' + esc(title) + '" loading="eager" decoding="async">'
      : "";
    var tags = splitList(post.tags).map(function (tag) {
      return "<span>" + esc(tag) + "</span>";
    }).join("");
    var html = "";

    if (window.marked && typeof window.marked.parse === "function") {
      html = window.marked.parse(content || "");
    } else {
      html = (content || "").split(/\n{2,}/).map(function (paragraph) {
        return "<p>" + esc(paragraph).replace(/\n/g, "<br>") + "</p>";
      }).join("");
    }

    var pageTitle = lang() === "sw" ? title : (post.seo_title || title);
    var pageDescription = lang() === "sw" ? (excerpt || "") : (post.seo_description || excerpt || "");
    document.title = pageTitle + " — Thomas Hondo Chacha";
    setMeta("description", pageDescription);
    setMeta("og:title", pageTitle, "property");
    setMeta("og:description", pageDescription, "property");
    if (post.cover_url) setMeta("og:image", post.cover_url, "property");
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", "https://www.thomashondochacha.co.ke/post.html?slug=" + encodeURIComponent(post.slug));

    container.innerHTML =
      '<p class="post-meta">' + esc(formatDate(post.published_at)) + "</p>" +
      '<h1 class="post-title">' + esc(title) + "</h1>" +
      (excerpt ? '<p class="post-lede">' + esc(excerpt) + "</p>" : "") +
      cover +
      '<div class="post-content">' + html + "</div>" +
      (tags ? '<div class="post-tags">' + tags + "</div>" : "") +
      '<div class="post-back"><a class="text-link" href="blog.html">' + esc(translate("blogPage.back")) +
        '<svg class="icon icon--arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg></a></div>';
  }

  function setMeta(name, value, attr) {
    if (!value) return;
    var selector = attr === "property"
      ? 'meta[property="' + name + '"]'
      : 'meta[name="' + name + '"]';
    var element = document.querySelector(selector);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attr === "property" ? "property" : "name", name);
      document.head.appendChild(element);
    }
    element.setAttribute("content", value);
  }

  function applySettings() {
    if (!settingsCache) {
      api("site_settings?select=*&id=eq.1&limit=1")
        .then(function (rows) {
          settingsCache = rows && rows[0] ? rows[0] : null;
          paintSettings();
        })
        .catch(function () {});
      return;
    }
    paintSettings();
  }

  function paintSettings() {
    if (!settingsCache) return;

    document.querySelectorAll("[data-cms-setting-html]").forEach(function (element) {
      var htmlKey = element.getAttribute("data-cms-setting-html");
      var htmlValue = localized(settingsCache, htmlKey);
      if (htmlValue) element.innerHTML = htmlValue;
    });

    document.querySelectorAll("[data-cms-setting]").forEach(function (element) {
      var key = element.getAttribute("data-cms-setting");
      var value = localized(settingsCache, key);
      if (!value) return;
      if (element.tagName === "A") {
        if (key === "email") element.setAttribute("href", "mailto:" + value);
        else if (key === "phone") element.setAttribute("href", "tel:" + value.replace(/[^\d+]/g, ""));
        else if (key === "whatsapp") element.setAttribute("href", "https://wa.me/" + value.replace(/\D/g, ""));
      }
      element.textContent = value;
    });

    var PHONE_PATTERN = /(\+?\d[\d\s().-]{7,}\d)/;
    var EMAIL_PATTERN = /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/;

    // Never write text into an icon span: on contact cards the icon is the
    // first span inside the link, and overwriting it destroyed the SVG.
    function contactTextElement(link) {
      var explicit = link.querySelector(
        ".contact-channel__value, .contact-direct__value"
      );
      if (explicit) return explicit;

      var spans = link.querySelectorAll("span");
      for (var index = 0; index < spans.length; index += 1) {
        var span = spans[index];
        if (span.querySelector("svg")) continue;
        if (span.classList.contains("contact-channel__icon")) continue;
        if (span.classList.contains("contact-direct__icon")) continue;
        return span;
      }

      return null;
    }

    function setContactText(link, value, pattern) {
      var element = contactTextElement(link);
      if (!element) return;

      var current = element.textContent || "";
      if (pattern.test(current)) {
        element.textContent = current.replace(pattern, value);
      } else if (!element.hasAttribute("data-i18n")) {
        element.textContent = value;
      }
    }

    var email = settingsCache.email;
    if (email) {
      document.querySelectorAll('a[href^="mailto:"]').forEach(function (link) {
        link.setAttribute("href", "mailto:" + email);
        setContactText(link, email, EMAIL_PATTERN);
      });
    }

    var phone = settingsCache.phone;
    if (phone) {
      var tel = String(phone).replace(/[^\d+]/g, "");
      document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
        link.setAttribute("href", "tel:" + tel);
        setContactText(link, phone, PHONE_PATTERN);
      });
    }

    var whatsapp = settingsCache.whatsapp;
    if (whatsapp) {
      var digits = String(whatsapp).replace(/\D/g, "");
      document.querySelectorAll('a[href*="wa.me/"]').forEach(function (link) {
        var search = "";
        try {
          search = new URL(link.href).search;
        } catch (error) {
          search = "";
        }
        link.setAttribute("href", "https://wa.me/" + digits + search);
      });
    }

    if (lang() === "en" && document.body.getAttribute("data-page") === "home") {
      if (settingsCache.seo_title) document.title = settingsCache.seo_title;
      if (settingsCache.seo_description) setMeta("description", settingsCache.seo_description);
    }
  }

  function renderProjectDetail() {
    var container = document.querySelector("[data-project]");
    if (!container) return;

    var params = new URLSearchParams(window.location.search);
    var slug = params.get("slug");
    if (!slug) {
      container.innerHTML = '<p class="cms-empty">' + esc(translate("projectPage.notFound")) + "</p>";
      return;
    }

    if (projectDetailCache && projectDetailCache.slug === slug) {
      paintProjectDetail(projectDetailCache, container);
      return;
    }

    container.innerHTML = '<p class="cms-empty">' + esc(translate("projectPage.loading")) + "</p>";

    api("projects?select=*&published=eq.true&slug=eq." + encodeURIComponent(slug) + "&limit=1")
      .then(function (rows) {
        if (!rows || !rows.length) {
          container.innerHTML = '<p class="cms-empty">' + esc(translate("projectPage.notFound")) + "</p>";
          return;
        }
        projectDetailCache = rows[0];
        paintProjectDetail(projectDetailCache, container);
      })
      .catch(function () {
        container.innerHTML = '<p class="cms-empty">' + esc(translate("projectPage.notFound")) + "</p>";
      });
  }

  function paintProjectDetail(project, container) {
    var title = localized(project, "title");
    var category = localized(project, "category");
    var summary = localized(project, "summary");
    var description = localized(project, "description");
    var cover = project.cover_url
      ? '<img class="project-detail__cover" src="' + esc(project.cover_url) + '" alt="' + esc(title) + '" loading="eager" decoding="async">'
      : "";
    var technologies = splitList(project.technologies);
    var techHtml = technologies.map(function (tech) {
      return "<span>" + esc(tech) + "</span>";
    }).join("");
    var actions = "";
    if (project.demo_url) {
      actions += '<a class="btn" href="' + esc(project.demo_url) + '" target="_blank" rel="noopener noreferrer">' + esc(translate("projectPage.live")) + "</a>";
    }
    if (project.source_url) {
      actions += '<a class="btn btn--ghost" href="' + esc(project.source_url) + '" target="_blank" rel="noopener noreferrer">' + esc(translate("projectPage.source")) + "</a>";
    }
    var html = "";
    if (window.marked && typeof window.marked.parse === "function") {
      html = window.marked.parse(description || "");
    } else {
      html = (description || "").split(/\n{2,}/).map(function (paragraph) {
        return "<p>" + esc(paragraph).replace(/\n/g, "<br>") + "</p>";
      }).join("");
    }

    document.title = title + " — Thomas Hondo Chacha";
    setMeta("description", summary || "");
    setMeta("og:title", title, "property");
    setMeta("og:description", summary || "", "property");
    if (project.cover_url) setMeta("og:image", project.cover_url, "property");
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", "https://www.thomashondochacha.co.ke/project.html?slug=" + encodeURIComponent(project.slug));

    container.innerHTML =
      '<p class="project-detail__meta">' + esc(category || "") + " · " + esc(statusLabel(project.status)) + "</p>" +
      '<h1 class="project-detail__title">' + esc(title) + "</h1>" +
      (summary ? '<p class="project-detail__summary">' + esc(summary) + "</p>" : "") +
      '<div class="project-detail__actions">' + actions + "</div>" +
      cover +
      '<div class="project-detail__body">' + html + "</div>" +
      (techHtml ? '<div class="project-detail__tech">' + techHtml + "</div>" : "") +
      '<div class="project-detail__back"><a class="text-link" href="projects.html">' + esc(translate("projectPage.back")) +
        '<svg class="icon icon--arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg></a></div>';
  }

  function ensureBlogNav() {
    var navList = document.querySelector(".nav-list");
    if (navList && !navList.querySelector('[href="blog.html"]')) {
      var item = document.createElement("li");
      var link = document.createElement("a");
      link.className = "nav-link";
      link.href = "blog.html";
      link.setAttribute("data-i18n", "nav.blog");
      link.textContent = lang() === "sw" ? "Blogu" : "Blog";
      if (document.body.getAttribute("data-page") === "blog") link.setAttribute("aria-current", "page");
      item.appendChild(link);
      var projectsLink = navList.querySelector('[href="projects.html"]');
      if (projectsLink && projectsLink.parentElement) {
        navList.insertBefore(item, projectsLink.parentElement.nextSibling);
      } else {
        navList.appendChild(item);
      }
    }

    var footerLinks = document.querySelector(".footer__links");
    if (footerLinks && !footerLinks.querySelector('[href="blog.html"]')) {
      var footerLink = document.createElement("a");
      footerLink.className = "footer__link";
      footerLink.href = "blog.html";
      footerLink.setAttribute("data-i18n", "nav.blog");
      footerLink.textContent = lang() === "sw" ? "Blogu" : "Blog";
      var footerProjects = footerLinks.querySelector('[href="projects.html"]');
      if (footerProjects && footerProjects.parentElement) {
        footerLinks.insertBefore(footerLink, footerProjects.nextSibling);
      } else {
        footerLinks.appendChild(footerLink);
      }
    }
  }

  function refreshLanguage() {
    ensureBlogNav();
    document.querySelectorAll('[data-i18n="nav.blog"]').forEach(function (link) {
      link.textContent = lang() === "sw" ? "Blogu" : "Blog";
    });
    if (projectsCache && projectsCache.length) paintProjects();
    if (postsCache) paintBlogList();
    if (projectDetailCache) {
      var detail = document.querySelector("[data-project]");
      if (detail) paintProjectDetail(projectDetailCache, detail);
    }
    paintSettings();
  }

  function init() {
    ensureBlogNav();
    applySettings();
    renderProjects();
    renderBlogList();
    renderPost();
    renderProjectDetail();
  }

  document.addEventListener("thc:languagechange", refreshLanguage);

  if (document.readyState === "complete") {
    window.setTimeout(init, 0);
  } else {
    window.addEventListener("load", function () {
      window.setTimeout(init, 0);
    });
  }
})();
