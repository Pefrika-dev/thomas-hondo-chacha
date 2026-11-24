/* Daily Lead Radar — admin Outreach panel.
   Sends no messages. It only displays public-source leads and opens manual
   WhatsApp/email links that Thomas must review and send himself. */
(function () {
  "use strict";

  var panel = document.querySelector("[data-lead-radar]");
  if (!panel) return;

  var body = panel.querySelector("[data-radar-body]");
  var empty = panel.querySelector("[data-radar-empty]");
  var countEl = panel.querySelector("[data-radar-count]");
  var feedbackEl = panel.querySelector("[data-radar-feedback]");
  var setupEl = panel.querySelector("[data-radar-setup]");
  var filterEl = panel.querySelector("[data-radar-filter]");
  var todayEl = panel.querySelector("[data-radar-today]");
  var scanBtn = panel.querySelector("[data-radar-scan]");
  var refreshBtn = panel.querySelector("[data-radar-refresh]");
  if (!body || !scanBtn || !refreshBtn) return;

  var STATUS_LABELS = {
    new: "New",
    contacted: "Contacted",
    replied: "Replied",
    won: "Won",
    lost: "Lost",
    do_not_contact: "Do not contact"
  };

  var leads = [];
  var session = null;
  var initialised = false;
  var loading = false;
  var scanning = false;

  function today() {
    try {
      var parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Nairobi", year: "numeric", month: "2-digit", day: "2-digit"
      }).formatToParts(new Date());
      var pick = function (type) {
        var hit = parts.find(function (part) { return part.type === type; });
        return hit ? hit.value : "";
      };
      return pick("year") + "-" + pick("month") + "-" + pick("day");
    } catch (error) {
      return new Date().toISOString().slice(0, 10);
    }
  }

  function setSetup(text, state) {
    if (!setupEl) return;
    setupEl.textContent = text;
    setupEl.classList.toggle("is-ready", state === "ready");
    setupEl.classList.toggle("is-error", state === "error");
  }

  function setFeedback(text, isError) {
    if (!feedbackEl) return;
    feedbackEl.textContent = text || "";
    feedbackEl.classList.toggle("is-error", Boolean(isError));
    feedbackEl.classList.toggle("is-ok", Boolean(text) && !isError);
  }

  function setBusy(on) {
    scanning = on;
    scanBtn.disabled = on;
    refreshBtn.disabled = on;
    scanBtn.textContent = on ? "Scanning…" : "Scan today’s 5";
  }

  async function ensureSession() {
    if (!window.thcSupabase || !window.thcSupabase.auth) {
      setSetup("Supabase library not loaded", "error");
      return false;
    }
    var result = await window.thcSupabase.auth.getSession();
    var next = result && result.data ? result.data.session : null;
    if (!next || !next.user || !next.access_token) {
      session = null;
      setSetup("Log in to the admin first", "error");
      return false;
    }
    session = next;
    setSetup("Supabase ready", "ready");
    return true;
  }

  function messageFor(lead) {
    var signal = lead.signal || "The public listing shows a local business.";
    return "Hello, this is Thomas Hondo Chacha, a software engineer in Migori. " +
      "I found " + (lead.business_name || "your business") + " listed on OpenStreetMap" +
      (lead.location ? " in " + lead.location : "") + ". " + signal + " " +
      "I build simple, mobile-first websites and WhatsApp enquiry buttons for local businesses. " +
      "Would a 10-minute call this week be useful? If it is not useful, just say so and I will not follow up. " +
      "— Thomas, 0705 023 432";
  }

  function subjectFor(lead) {
    return "A simple website for " + (lead.business_name || "your business") + "?";
  }

  function digitsOf(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function waLink(lead) {
    return "https://wa.me/" + digitsOf(lead.phone) + "?text=" + encodeURIComponent(messageFor(lead));
  }

  function mailLink(lead) {
    return "mailto:" + encodeURIComponent(lead.email || "") +
      "?subject=" + encodeURIComponent(subjectFor(lead)) +
      "&body=" + encodeURIComponent(messageFor(lead));
  }

  function makeLink(href, text, className) {
    var link = document.createElement("a");
    link.href = href;
    link.textContent = text;
    link.className = className || "radar__link";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
  }

  function makeButton(text, className, handler) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = className || "radar__btn";
    button.textContent = text;
    if (handler) button.addEventListener("click", handler);
    return button;
  }

  function sourceCell(lead) {
    var cell = document.createElement("td");
    if (lead.source_url) {
      cell.append(makeLink(lead.source_url, "OpenStreetMap ↗"));
    } else {
      cell.textContent = "—";
    }
    var stamp = document.createElement("span");
    stamp.className = "radar__muted";
    stamp.textContent = lead.scan_date || "";
    cell.append(stamp);
    return cell;
  }

  function statusCell(lead) {
    var cell = document.createElement("td");
    var key = String(lead.status || "new").replace(/[^a-z_]/g, "");
    var pill = document.createElement("span");
    pill.className = "radar__status-pill is-" + key;
    pill.textContent = STATUS_LABELS[key] || key || "New";

    var select = document.createElement("select");
    select.className = "radar__status";
    select.setAttribute("aria-label", "Status for " + (lead.business_name || "lead"));
    Object.keys(STATUS_LABELS).forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = STATUS_LABELS[value];
      if (value === key) option.selected = true;
      select.append(option);
    });

    select.addEventListener("change", async function () {
      var nextStatus = select.value;
      var contactedAt = nextStatus === "new" ? null : (lead.contacted_at || new Date().toISOString());
      setFeedback("Saving status…", false);
      var result = await window.thcSupabase
        .from("outreach_leads")
        .update({ status: nextStatus, contacted_at: contactedAt })
        .eq("id", lead.id);
      if (result.error) {
        setFeedback("Could not save that status: " + result.error.message, true);
        select.value = key;
        return;
      }
      lead.status = nextStatus;
      lead.contacted_at = contactedAt;
      setFeedback("Status saved.", false);
      render();
    });

    cell.append(pill, select);
    return cell;
  }

  function detailRow(lead, colSpan) {
    var row = document.createElement("tr");
    row.className = "radar__detail-row";
    row.hidden = true;
    var cell = document.createElement("td");
    cell.colSpan = colSpan;

    var grid = document.createElement("div");
    grid.className = "radar__detail";

    var messageBlock = document.createElement("div");
    messageBlock.className = "radar__detail-block";
    var messageLabel = document.createElement("span");
    messageLabel.className = "radar__detail-label";
    messageLabel.textContent = "Manual message — review before sending";
    var message = document.createElement("textarea");
    message.className = "radar__message";
    message.readOnly = true;
    message.value = messageFor(lead);
    var actions = document.createElement("div");
    actions.className = "radar__detail-actions";

    actions.append(makeButton("Copy text", "radar__btn", async function () {
      try {
        await navigator.clipboard.writeText(message.value);
        setFeedback("Message copied. Open WhatsApp or email and send it yourself.", false);
      } catch (error) {
        message.focus();
        message.select();
        setFeedback("Select the message above and copy it manually.", true);
      }
    }));

    actions.append(makeLink(waLink(lead), "Open WhatsApp ↗", "radar__btn is-primary"));
    if (lead.email) {
      actions.append(makeLink(mailLink(lead), "Open email ↗", "radar__btn"));
    } else {
      var noEmail = document.createElement("span");
      noEmail.className = "radar__muted";
      noEmail.textContent = "No public email found — phone only.";
      actions.append(noEmail);
    }
    if (lead.website) {
      actions.append(makeLink(lead.website, "Website ↗", "radar__btn"));
    }

    messageBlock.append(messageLabel, message, actions);

    var noteBlock = document.createElement("div");
    noteBlock.className = "radar__detail-block";
    var noteLabel = document.createElement("span");
    noteLabel.className = "radar__detail-label";
    noteLabel.textContent = "Private note";
    var notes = document.createElement("textarea");
    notes.className = "radar__notes";
    notes.placeholder = "Reply, next action date, or why this lead was closed.";
    notes.value = lead.notes || "";
    var saveNote = makeButton("Save note", "radar__btn", async function () {
      var result = await window.thcSupabase
        .from("outreach_leads")
        .update({ notes: notes.value.slice(0, 5000) })
        .eq("id", lead.id);
      if (result.error) {
        setFeedback("Could not save the note: " + result.error.message, true);
        return;
      }
      lead.notes = notes.value.slice(0, 5000);
      setFeedback("Note saved.", false);
    });
    var noteActions = document.createElement("div");
    noteActions.className = "radar__detail-actions";
    noteActions.append(saveNote);

    var sourceNote = document.createElement("p");
    sourceNote.className = "radar__source-note";
    sourceNote.textContent = "Source: OpenStreetMap contributors (ODbL). Verify the listing before contacting.";
    if (lead.phone_source_url && lead.phone_source_url !== lead.source_url) {
      sourceNote.append(document.createElement("br"));
      sourceNote.append(makeLink(lead.phone_source_url, "Where the public phone was found ↗"));
    }
    if (lead.email && lead.email_source_url && lead.email_source_url !== lead.source_url) {
      sourceNote.append(document.createElement("br"));
      sourceNote.append(makeLink(lead.email_source_url, "Where the public email was found ↗"));
    }

    noteBlock.append(noteLabel, notes, noteActions, sourceNote);
    grid.append(messageBlock, noteBlock);
    cell.append(grid);
    row.append(cell);
    return row;
  }

  function render() {
    body.textContent = "";
    var filter = filterEl ? filterEl.value : "all";
    var todayOnly = todayEl ? todayEl.checked : false;
    var todayValue = today();
    var rows = leads.filter(function (lead) {
      var statusOk = filter === "all" || lead.status === filter;
      var dateOk = !todayOnly || lead.scan_date === todayValue;
      return statusOk && dateOk;
    });

    rows.forEach(function (lead) {
      var row = document.createElement("tr");

      var nameCell = document.createElement("td");
      var name = document.createElement("strong");
      name.className = "radar__name";
      name.textContent = lead.business_name || "Unnamed business";
      var type = document.createElement("span");
      type.className = "radar__type";
      type.textContent = lead.business_type || "Local business";
      nameCell.append(name, type);
      row.append(nameCell);

      var contactCell = document.createElement("td");
      if (lead.phone) {
        contactCell.append(makeLink("tel:" + digitsOf(lead.phone), lead.phone, "radar__contact"));
      } else {
        contactCell.textContent = "—";
      }
      if (lead.email) {
        var mail = document.createElement("span");
        mail.className = "radar__muted";
        mail.textContent = lead.email;
        contactCell.append(mail);
      }
      if (lead.website) {
        contactCell.append(makeLink(lead.website, "Website ↗", "radar__muted"));
      }
      row.append(contactCell);

      var locationCell = document.createElement("td");
      locationCell.textContent = lead.location || "—";
      row.append(locationCell);

      var opportunityCell = document.createElement("td");
      opportunityCell.className = "radar__opportunity";
      var signal = document.createElement("span");
      signal.className = "radar__signal";
      signal.textContent = lead.signal || "Public source listing";
      var opportunity = document.createElement("span");
      opportunity.textContent = lead.service_opportunity || "Review the public listing and decide the right next step.";
      opportunityCell.append(signal, opportunity);
      row.append(opportunityCell);

      row.append(sourceCell(lead));
      row.append(statusCell(lead));

      var actionsCell = document.createElement("td");
      var actions = document.createElement("div");
      actions.className = "radar__actions";
      var detail = detailRow(lead, 7);
      var toggle = makeButton("Review", "radar__btn", function () {
        detail.hidden = !detail.hidden;
        toggle.textContent = detail.hidden ? "Review" : "Hide";
      });
      actions.append(toggle);
      actions.append(makeLink(waLink(lead), "WhatsApp ↗", "radar__btn is-primary"));
      if (lead.email) actions.append(makeLink(mailLink(lead), "Email ↗", "radar__btn"));
      actionsCell.append(actions);
      row.append(actionsCell);

      body.append(row, detail);
    });

    if (empty) empty.hidden = rows.length > 0;
    if (countEl) {
      var todayCount = leads.filter(function (lead) { return lead.scan_date === todayValue; }).length;
      countEl.textContent = rows.length + " shown · " + leads.length + " saved · " + todayCount + " today";
    }
  }

  async function load() {
    if (!ensureSession) return;
    if (!session && !(await ensureSession())) return;
    var result = await window.thcSupabase
      .from("outreach_leads")
      .select("*")
      .order("scan_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(120);
    if (result.error) {
      setFeedback("Lead table is not ready. Apply supabase/outreach-leads.sql in Supabase, then refresh.", true);
      leads = [];
      render();
      return;
    }
    leads = result.data || [];
    render();
  }

  async function init() {
    if (loading) return;
    loading = true;
    try {
      if (await ensureSession()) await load();
    } finally {
      loading = false;
    }
  }

  async function maybeInit() {
    if (initialised || loading) return;
    var dashboard = document.getElementById("dashboard");
    if (dashboard && !dashboard.classList.contains("active")) {
      setSetup("Log in to the admin first", "error");
      return;
    }
    initialised = true;
    await init();
  }

  async function scan() {
    if (scanning) return;
    if (!(await ensureSession())) return;
    setBusy(true);
    setFeedback("Checking public sources. This can take up to a minute…", false);
    try {
      var response = await fetch("/api/outreach-scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + session.access_token
        },
        body: "{}"
      });
      var data = {};
      try { data = await response.json(); } catch (error) { data = {}; }
      if (!response.ok || !data.ok) {
        setFeedback(data.error || "The scan failed. Please try again.", true);
        return;
      }
      setFeedback(data.message || "Scan complete.", false);
      await load();
    } catch (error) {
      setFeedback("Could not reach the scan API. Check your connection and try again.", true);
    } finally {
      setBusy(false);
    }
  }

  scanBtn.addEventListener("click", scan);
  refreshBtn.addEventListener("click", async function () {
    await init();
    setFeedback("Lead list refreshed.", false);
  });
  if (filterEl) filterEl.addEventListener("change", render);
  if (todayEl) todayEl.addEventListener("change", render);

  var dashboard = document.getElementById("dashboard");
  if (dashboard && window.MutationObserver) {
    new MutationObserver(maybeInit).observe(dashboard, { attributes: true, attributeFilter: ["class"] });
  }
  document.querySelectorAll('[data-tab="outreach"]').forEach(function (button) {
    button.addEventListener("click", function () { setTimeout(maybeInit, 40); });
  });

  if (window.thcSupabase && window.thcSupabase.auth && typeof window.thcSupabase.auth.onAuthStateChange === "function") {
    window.thcSupabase.auth.onAuthStateChange(function (event) {
      if (event === "SIGNED_IN") {
        initialised = false;
        maybeInit();
      }
      if (event === "SIGNED_OUT") {
        initialised = false;
        session = null;
        leads = [];
        render();
        setSetup("Log in to the admin first", "error");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", maybeInit);
  } else {
    maybeInit();
  }
})();
