/* ==========================================================================
   Thomas Hondo Chacha — AI chat assistant
   A lightweight bilingual chat widget backed by /api/ai-chat.
   ========================================================================== */
(function () {
  "use strict";

  var AI_ENDPOINT = "/api/ai-chat";
  var CONTACT_ENDPOINT = "/api/submit-contact";
  var WHATSAPP_NUMBER = "254705023432";
  var MAX_USER_MESSAGES = 20;
  var MAX_TRANSCRIPT_MESSAGES = 8;

  var copy = {
    en: {
      launcher: "AI Assistant",
      launcherAria: "Open the AI assistant chat",
      title: "AI assistant",
      status: "Online · replies instantly",
      greeting:
        "Hi, I'm Thomas's AI assistant. Ask me about services, projects, pricing or how to get in touch. I can reply in English or Kiswahili.",
      inputLabel: "Your question",
      placeholder: "Ask about services, projects or pricing…",
      send: "Send message",
      close: "Close chat",
      you: "You",
      assistant: "AI",
      thinking: "Thinking…",
      limit:
        "You've reached this session's message limit. Please use WhatsApp or the contact form.",
      error:
        "Sorry, I couldn't reply just now. Please use WhatsApp or the contact form below.",
      lead: "Leave your details",
      whatsapp: "WhatsApp",
      contact: "Contact form",
      leadTitle: "Leave your details",
      leadSub: "Thomas will reply within 24 hours.",
      back: "Back to chat",
      name: "Full name",
      email: "Email address",
      phone: "Phone (optional)",
      details: "What do you need?",
      detailsPlaceholder: "Briefly describe your project or question.",
      submit: "Send details",
      sending: "Sending…",
      leadError:
        "We couldn't save your details. Please use WhatsApp or the contact form so your message isn't lost.",
      leadSuccess:
        "Thank you. We have received your message and will reply within 24 hours.",
      leadPrivacy:
        "Your details are saved securely and visible only to Thomas. Chat messages are processed by Google Gemini.",
      required: "Please complete the required fields.",
      invalidEmail: "Please enter a valid email address.",
      shortDetails: "Please add a little more detail (at least 20 characters).",
      whatsappMessage:
        "Hello Thomas, I visited your website and would like to discuss a project."
    },
    sw: {
      launcher: "Msaidizi AI",
      launcherAria: "Fungua mazungumzo na msaidizi wa AI",
      title: "Msaidizi wa AI",
      status: "Yupo mtandaoni · hujibu papo hapo",
      greeting:
        "Habari! Mimi ni msaidizi wa AI wa Thomas. Niulize kuhusu huduma, miradi, bei au jinsi ya kuwasiliana. Naweza kujibu kwa Kiingereza au Kiswahili.",
      inputLabel: "Swali lako",
      placeholder: "Uliza kuhusu huduma, miradi au bei…",
      send: "Tuma ujumbe",
      close: "Funga mazungumzo",
      you: "Wewe",
      assistant: "AI",
      thinking: "Inafikiri…",
      limit:
        "Umefikia kikomo cha ujumbe kwa kipindi hiki. Tafadhali tumia WhatsApp au fomu ya mawasiliano.",
      error:
        "Samahani, siwezi kujibu sasa. Tafadhali tumia WhatsApp au fomu ya mawasiliano hapa chini.",
      lead: "Acha taarifa zako",
      whatsapp: "WhatsApp",
      contact: "Fomu ya mawasiliano",
      leadTitle: "Acha taarifa zako",
      leadSub: "Thomas atakujibu ndani ya saa 24.",
      back: "Rudi kwenye mazungumzo",
      name: "Jina kamili",
      email: "Barua pepe",
      phone: "Simu (si lazima)",
      details: "Unahitaji nini?",
      detailsPlaceholder: "Eleza kwa ufupi mradi au swali lako.",
      submit: "Tuma taarifa",
      sending: "Inatuma…",
      leadError:
        "Hatukuweza kuhifadhi taarifa zako. Tafadhali tumia WhatsApp au fomu ya mawasiliano ili ujumbe wako usipotee.",
      leadSuccess:
        "Asante. Tumepokea ujumbe wako na tutakujibu ndani ya saa 24.",
      leadPrivacy:
        "Taarifa zako huhifadhiwa kwa usalama na zinaonekana kwa Thomas pekee. Ujumbe wa mazungumzo husindikwa na Google Gemini.",
      required: "Tafadhali jaza sehemu zinazohitajika.",
      invalidEmail: "Tafadhali weka barua pepe sahihi.",
      shortDetails: "Tafadhali ongeza maelezo kidogo (angalau herufi 20).",
      whatsappMessage:
        "Habari Thomas, nimetembelea tovuti yako na ningependa kuzungumzia mradi."
    }
  };

  var state = {
    open: false,
    busy: false,
    leadOpen: false,
    leadSubmitting: false,
    language: "en",
    messages: [],
    greeting: null
  };

  var el = {};

  function getLanguage() {
    if (window.Language && typeof window.Language.get === "function") {
      return window.Language.get() === "sw" ? "sw" : "en";
    }

    var language = (document.documentElement.getAttribute("lang") || "").toLowerCase();
    return language.indexOf("sw") === 0 ? "sw" : "en";
  }

  function t(key) {
    var pack = copy[state.language] || copy.en;
    return pack[key] || copy.en[key] || key;
  }

  function whatsappUrl() {
    return (
      "https://wa.me/" +
      WHATSAPP_NUMBER +
      "?text=" +
      encodeURIComponent(t("whatsappMessage"))
    );
  }

  function build() {
    var root = document.createElement("div");
    root.className = "ai-chat";
    root.setAttribute("data-ai-chat", "true");
    root.innerHTML =
      '<button class="ai-chat__launcher" type="button" data-chat-launcher data-copy-aria="launcherAria" aria-label="Open the AI assistant chat" aria-expanded="false" aria-controls="ai-chat-panel" aria-haspopup="dialog">' +
      '<span class="ai-chat__launcher-icon" aria-hidden="true">' +
      '<svg class="icon" viewBox="0 0 24 24" focusable="false"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"/></svg>' +
      "</span>" +
      '<span class="ai-chat__launcher-text" data-copy="launcher">AI Assistant</span>' +
      '<span class="ai-chat__launcher-dot" aria-hidden="true"></span>' +
      "</button>" +
      '<section class="ai-chat__panel" id="ai-chat-panel" role="dialog" aria-labelledby="ai-chat-title" hidden>' +
      '<header class="ai-chat__header">' +
      '<div class="ai-chat__identity">' +
      '<span class="ai-chat__mark" aria-hidden="true">THC</span>' +
      "<div>" +
      '<p class="ai-chat__title" id="ai-chat-title" data-copy="title">AI assistant</p>' +
      '<p class="ai-chat__status"><span class="ai-chat__status-dot" aria-hidden="true"></span><span data-copy="status">Online · replies instantly</span></p>' +
      "</div>" +
      "</div>" +
      '<button class="ai-chat__close" type="button" data-chat-close data-copy-aria="close" aria-label="Close chat">' +
      '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
      "</button>" +
      "</header>" +
      '<div class="ai-chat__chat-view" data-chat-view>' +
      '<div class="ai-chat__body" data-chat-body>' +
      '<div class="ai-chat__messages" id="ai-chat-messages" data-chat-messages role="log" aria-live="polite" aria-relevant="additions text"></div>' +
      "</div>" +
      '<form class="ai-chat__composer" data-chat-form>' +
      '<label class="visually-hidden" for="ai-chat-input" data-copy="inputLabel">Your question</label>' +
      '<textarea class="ai-chat__input" id="ai-chat-input" data-chat-input rows="1" maxlength="1200" data-copy-placeholder="placeholder" placeholder="Ask about services, projects or pricing…"></textarea>' +
      '<button class="ai-chat__send" type="submit" data-chat-send data-copy-aria="send" aria-label="Send message" disabled>' +
      '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z"/></svg>' +
      "</button>" +
      "</form>" +
      '<div class="ai-chat__actions">' +
      '<button class="ai-chat__action" type="button" data-chat-lead data-copy="lead">Leave your details</button>' +
      '<a class="ai-chat__action" href="#" target="_blank" rel="noopener noreferrer" data-chat-whatsapp data-copy="whatsapp">WhatsApp</a>' +
      '<a class="ai-chat__action" href="contact.html" data-chat-contact data-copy="contact">Contact form</a>' +
      "</div>" +
      "</div>" +
      '<div class="ai-chat__lead-view" data-chat-lead-view hidden>' +
      '<div class="ai-chat__lead-head">' +
      '<button class="ai-chat__back" type="button" data-chat-back data-copy-aria="back" aria-label="Back to chat">' +
      '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>' +
      "</button>" +
      "<div>" +
      '<p class="ai-chat__lead-title" data-copy="leadTitle">Leave your details</p>' +
      '<p class="ai-chat__lead-sub" data-copy="leadSub">Thomas will reply within 24 hours.</p>' +
      "</div>" +
      "</div>" +
      '<form class="ai-chat__lead-form" data-chat-lead-form novalidate>' +
      '<label class="ai-chat__field" for="ai-chat-lead-name"><span data-copy="name">Full name</span><input id="ai-chat-lead-name" name="name" type="text" autocomplete="name" maxlength="80" required></label>' +
      '<label class="ai-chat__field" for="ai-chat-lead-email"><span data-copy="email">Email address</span><input id="ai-chat-lead-email" name="email" type="email" inputmode="email" autocomplete="email" maxlength="254" required></label>' +
      '<label class="ai-chat__field" for="ai-chat-lead-phone"><span data-copy="phone">Phone (optional)</span><input id="ai-chat-lead-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="24"></label>' +
      '<label class="ai-chat__field" for="ai-chat-lead-details"><span data-copy="details">What do you need?</span><textarea id="ai-chat-lead-details" name="details" rows="4" minlength="20" maxlength="1200" required data-copy-placeholder="detailsPlaceholder"></textarea></label>' +
      '<p class="ai-chat__form-error" data-chat-form-error role="alert" hidden></p>' +
      '<button class="ai-chat__lead-submit" type="submit" data-chat-lead-submit data-copy="submit">Send details</button>' +
      '<p class="ai-chat__disclaimer" data-copy="leadPrivacy">Your details are saved securely and visible only to Thomas. Chat messages are processed by Google Gemini.</p>' +
      '<div class="ai-chat__lead-links">' +
      '<a class="ai-chat__action" href="#" target="_blank" rel="noopener noreferrer" data-chat-whatsapp data-copy="whatsapp">WhatsApp</a>' +
      '<a class="ai-chat__action" href="contact.html" data-chat-contact data-copy="contact">Contact form</a>' +
      "</div>" +
      "</form>" +
      '<div class="ai-chat__lead-success" data-chat-lead-success hidden>' +
      '<span class="ai-chat__success-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" focusable="false"><path d="m5 12 4 4L19 6"/></svg></span>' +
      '<p data-chat-success-text role="status" aria-live="polite"></p>' +
      '<button class="ai-chat__action" type="button" data-chat-back data-copy="back">Back to chat</button>' +
      "</div>" +
      "</div>" +
      "</section>";

    document.body.appendChild(root);
    return root;
  }

  function cacheElements() {
    el.root = document.querySelector("[data-ai-chat]");
    el.launcher = el.root.querySelector("[data-chat-launcher]");
    el.panel = el.root.querySelector("#ai-chat-panel");
    el.close = el.root.querySelector("[data-chat-close]");
    el.chatView = el.root.querySelector("[data-chat-view]");
    el.leadView = el.root.querySelector("[data-chat-lead-view]");
    el.body = el.root.querySelector("[data-chat-body]");
    el.messages = el.root.querySelector("[data-chat-messages]");
    el.form = el.root.querySelector("[data-chat-form]");
    el.input = el.root.querySelector("[data-chat-input]");
    el.send = el.root.querySelector("[data-chat-send]");
    el.leadButton = el.root.querySelector("[data-chat-lead]");
    el.leadForm = el.root.querySelector("[data-chat-lead-form]");
    el.leadName = el.root.querySelector("#ai-chat-lead-name");
    el.leadEmail = el.root.querySelector("#ai-chat-lead-email");
    el.leadPhone = el.root.querySelector("#ai-chat-lead-phone");
    el.leadDetails = el.root.querySelector("#ai-chat-lead-details");
    el.leadSubmit = el.root.querySelector("[data-chat-lead-submit]");
    el.leadError = el.root.querySelector("[data-chat-form-error]");
    el.leadSuccess = el.root.querySelector("[data-chat-lead-success]");
    el.leadSuccessText = el.root.querySelector("[data-chat-success-text]");
    el.whatsappLinks = Array.prototype.slice.call(
      el.root.querySelectorAll("[data-chat-whatsapp]")
    );
  }

  function updateCopy() {
    el.root.querySelectorAll("[data-copy]").forEach(function (element) {
      element.textContent = t(element.getAttribute("data-copy"));
    });

    el.root.querySelectorAll("[data-copy-placeholder]").forEach(function (element) {
      element.setAttribute(
        "placeholder",
        t(element.getAttribute("data-copy-placeholder"))
      );
    });

    el.root.querySelectorAll("[data-copy-aria]").forEach(function (element) {
      element.setAttribute("aria-label", t(element.getAttribute("data-copy-aria")));
    });

    el.whatsappLinks.forEach(function (link) {
      link.href = whatsappUrl();
    });

    if (!el.leadSuccess.hidden) {
      el.leadSuccessText.textContent = t("leadSuccess");
    }
  }

  function scrollBottom() {
    if (!el.body) {
      return;
    }

    el.body.scrollTop = el.body.scrollHeight;
  }

  function addMessage(role, text) {
    var row = document.createElement("div");
    row.className = "ai-chat__message ai-chat__message--" + role;

    var label = document.createElement("span");
    label.className = "ai-chat__message-label";
    label.textContent = role === "user" ? t("you") : t("assistant");

    var bubble = document.createElement("p");
    bubble.className = "ai-chat__bubble";
    bubble.textContent = text;

    row.appendChild(label);
    row.appendChild(bubble);
    el.messages.appendChild(row);
    scrollBottom();
    return row;
  }

  function renderGreeting() {
    if (state.messages.length) {
      return;
    }

    if (state.greeting && state.greeting.isConnected) {
      var existingBubble = state.greeting.querySelector(".ai-chat__bubble");
      if (existingBubble) {
        existingBubble.textContent = t("greeting");
      }
      return;
    }

    state.greeting = addMessage("assistant", t("greeting"));
  }

  function showTyping() {
    hideTyping();

    var row = document.createElement("div");
    row.className = "ai-chat__message ai-chat__message--assistant ai-chat__typing";
    row.setAttribute("data-chat-typing", "true");

    var label = document.createElement("span");
    label.className = "ai-chat__message-label";
    label.textContent = t("assistant");

    var bubble = document.createElement("span");
    bubble.className = "ai-chat__bubble ai-chat__typing-bubble";
    bubble.setAttribute("role", "status");
    bubble.setAttribute("aria-live", "polite");

    var sr = document.createElement("span");
    sr.className = "visually-hidden";
    sr.textContent = t("thinking");

    var dots = document.createElement("span");
    dots.className = "ai-chat__dots";
    dots.setAttribute("aria-hidden", "true");
    dots.innerHTML = "<span></span><span></span><span></span>";

    bubble.appendChild(sr);
    bubble.appendChild(dots);
    row.appendChild(label);
    row.appendChild(bubble);
    el.messages.appendChild(row);
    el.messages.setAttribute("aria-busy", "true");
    scrollBottom();
  }

  function hideTyping() {
    var typing = el.messages.querySelector("[data-chat-typing]");
    if (typing) {
      typing.remove();
    }
    el.messages.setAttribute("aria-busy", "false");
  }

  function updateSendState() {
    el.send.disabled = state.busy || !el.input.value.trim();
  }

  function resizeInput() {
    el.input.style.height = "auto";
    el.input.style.height = Math.min(el.input.scrollHeight, 112) + "px";
  }

  function openChat() {
    state.open = true;
    el.panel.hidden = false;
    el.root.classList.add("is-open");
    el.launcher.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("ai-chat-open");

    window.setTimeout(function () {
      if (state.leadOpen) {
        el.leadName.focus();
      } else {
        el.input.focus();
      }
      scrollBottom();
    }, 80);
  }

  function closeChat() {
    state.open = false;
    el.panel.hidden = true;
    el.root.classList.remove("is-open");
    el.launcher.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("ai-chat-open");
    el.launcher.focus();
  }

  function setLeadView(open) {
    state.leadOpen = open;
    el.chatView.hidden = open;
    el.leadView.hidden = !open;

    if (open) {
      el.leadForm.hidden = false;
      el.leadSuccess.hidden = true;
      el.leadError.hidden = true;
      el.leadError.textContent = "";
      window.setTimeout(function () {
        el.leadName.focus();
      }, 60);
      return;
    }

    if (state.open) {
      window.setTimeout(function () {
        el.input.focus();
      }, 60);
    }
  }

  function showLeadError(message) {
    el.leadError.textContent = message;
    el.leadError.hidden = false;
  }

  function clearLeadError() {
    el.leadError.textContent = "";
    el.leadError.hidden = true;
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function sendMessage() {
    if (state.busy) {
      return;
    }

    var text = el.input.value.trim();
    if (!text) {
      return;
    }

    var userMessages = state.messages.filter(function (message) {
      return message.role === "user";
    });

    if (userMessages.length >= MAX_USER_MESSAGES) {
      addMessage("assistant", t("limit"));
      return;
    }

    addMessage("user", text);
    state.messages.push({ role: "user", content: text });
    el.input.value = "";
    resizeInput();
    state.busy = true;
    updateSendState();
    showTyping();

    var controller = new AbortController();
    var timeout = window.setTimeout(function () {
      controller.abort();
    }, 30000);

    fetch(AI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: state.messages.slice(-10),
        language: state.language,
        page: window.location.pathname
      }),
      signal: controller.signal
    })
      .then(function (response) {
        return response
          .json()
          .catch(function () {
            return {};
          })
          .then(function (data) {
            return { ok: response.ok, status: response.status, data: data };
          });
      })
      .then(function (result) {
        window.clearTimeout(timeout);
        hideTyping();

        var reply = result.data && result.data.reply;
        if (!result.ok || !reply) {
          var fallback =
            (result.data && result.data.fallback) ||
            (result.status === 429 ? t("limit") : t("error"));
          addMessage("assistant", fallback);
          return;
        }

        addMessage("assistant", reply);
        state.messages.push({ role: "assistant", content: reply });
      })
      .catch(function () {
        window.clearTimeout(timeout);
        hideTyping();
        addMessage("assistant", t("error"));
      })
      .finally(function () {
        state.busy = false;
        updateSendState();

        if (state.open && !state.leadOpen && window.innerWidth > 760) {
          el.input.focus({ preventScroll: true });
        }
      });
  }

  function handleLeadSubmit(event) {
    event.preventDefault();

    if (state.leadSubmitting) {
      return;
    }

    var name = el.leadName.value.trim();
    var email = el.leadEmail.value.trim();
    var phone = el.leadPhone.value.trim();
    var details = el.leadDetails.value.trim();

    clearLeadError();

    if (!name || !email || !details) {
      showLeadError(t("required"));
      if (!name) {
        el.leadName.focus();
      } else if (!email) {
        el.leadEmail.focus();
      } else {
        el.leadDetails.focus();
      }
      return;
    }

    if (!isValidEmail(email)) {
      showLeadError(t("invalidEmail"));
      el.leadEmail.focus();
      return;
    }

    if (details.length < 20) {
      showLeadError(t("shortDetails"));
      el.leadDetails.focus();
      return;
    }

    var transcript = state.messages
      .slice(-MAX_TRANSCRIPT_MESSAGES)
      .map(function (message) {
        return (message.role === "user" ? "Client" : "AI") + ": " + message.content;
      })
      .join("\n");

    var description = "AI chat enquiry\n\n" + details;
    if (transcript) {
      description += "\n\nConversation:\n" + transcript;
    }

    if (description.length > 2000) {
      description = description.slice(0, 1990) + "…";
    }

    state.leadSubmitting = true;
    el.leadSubmit.disabled = true;
    el.leadSubmit.textContent = t("sending");

    fetch(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: name,
        email: email,
        phone: phone || null,
        project_type: "other",
        project_description: description,
        preferred_contact: phone ? "phone" : "email"
      })
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("save failed");
        }

        el.leadForm.hidden = true;
        el.leadSuccess.hidden = false;
        el.leadSuccessText.textContent = t("leadSuccess");
        el.leadForm.reset();
        clearLeadError();
      })
      .catch(function () {
        showLeadError(t("leadError"));
      })
      .finally(function () {
        state.leadSubmitting = false;
        el.leadSubmit.disabled = false;
        el.leadSubmit.textContent = t("submit");
      });
  }

  function bind() {
    el.launcher.addEventListener("click", function () {
      if (state.open) {
        closeChat();
      } else {
        openChat();
      }
    });

    el.close.addEventListener("click", closeChat);

    el.form.addEventListener("submit", function (event) {
      event.preventDefault();
      sendMessage();
    });

    el.input.addEventListener("input", function () {
      resizeInput();
      updateSendState();
    });

    el.input.addEventListener("keydown", function (event) {
      if (event.isComposing) {
        return;
      }

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    });

    el.leadButton.addEventListener("click", function () {
      setLeadView(true);
    });

    el.root.querySelectorAll("[data-chat-back]").forEach(function (button) {
      button.addEventListener("click", function () {
        setLeadView(false);
      });
    });

    el.leadForm.addEventListener("submit", handleLeadSubmit);

    document.addEventListener("keydown", function (event) {
      if (!state.open || event.key !== "Escape") {
        return;
      }

      if (state.leadOpen) {
        event.preventDefault();
        setLeadView(false);
        return;
      }

      event.preventDefault();
      closeChat();
    });

    document.addEventListener("thc:languagechange", function () {
      state.language = getLanguage();
      updateCopy();
      renderGreeting();
    });
  }

  function init() {
    if (document.querySelector("[data-ai-chat]")) {
      return;
    }

    if (!document.body) {
      return;
    }

    state.language = getLanguage();
    build();
    cacheElements();
    bind();
    updateCopy();
    renderGreeting();
    updateSendState();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
