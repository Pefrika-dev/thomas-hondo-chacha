/* ==========================================================================
   Thomas Hondo Chacha — Project enquiry form
   Validates locally, saves the enquiry, prepares a reviewable message and
   opens WhatsApp/email as the chosen follow-up channel.
   ========================================================================== */
(function () {
  "use strict";

  var PHONE_INTERNATIONAL = "254705023432";
  var EMAIL_ADDRESS = "thomashondochacha@gmail.com";
  var state = {
    initialised: false,
    form: null,
    invalidFields: new Set(),
    reviewOpen: false,
    lastSaveOk: null,
    submitting: false
  };

  var fieldConfig = [
    { name: "name", errorKey: "contactPage.formErrorName" },
    { name: "email", errorKey: "contactPage.formErrorEmail" },
    { name: "phone", errorKey: "contactPage.formErrorPhone", optional: true },
    { name: "projectType", errorKey: "contactPage.formErrorProjectType" },
    { name: "description", errorKey: "contactPage.formErrorDescription" },
    { name: "contactMethod", errorKey: "contactPage.formErrorContact" }
  ];

  function t(key, replacements) {
    return window.Language.t(key, replacements);
  }

  function getControl(name) {
    return state.form.querySelector('[name="' + name + '"]');
  }

  function getErrorElement(name) {
    return state.form.querySelector('[data-error-for="' + name + '"]');
  }

  function getRadioValue(name) {
    var checked = state.form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : "";
  }

  function getValues() {
    return {
      name: (getControl("name").value || "").trim(),
      email: (getControl("email").value || "").trim(),
      phone: (getControl("phone").value || "").trim(),
      projectType: getControl("projectType").value,
      description: (getControl("description").value || "").trim(),
      contactMethod: getRadioValue("contactMethod")
    };
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
  }

  function isValidPhone(value) {
    if (!value) {
      return true;
    }

    var digits = value.replace(/\D/g, "");
    return /^[+()\d\s-]{7,24}$/.test(value) && digits.length >= 7 && digits.length <= 15;
  }

  function isFieldValid(name, values) {
    switch (name) {
      case "name":
        return values.name.length >= 2;
      case "email":
        return isValidEmail(values.email);
      case "phone":
        return isValidPhone(values.phone);
      case "projectType":
        return values.projectType !== "";
      case "description":
        return values.description.length >= 20;
      case "contactMethod":
        return ["whatsapp", "email", "phone"].indexOf(values.contactMethod) !== -1;
      default:
        return true;
    }
  }

  function setFieldInvalid(name, invalid) {
    var control = getControl(name);
    var error = getErrorElement(name);
    var config = fieldConfig.filter(function (item) {
      return item.name === name;
    })[0];

    if (name === "contactMethod") {
      state.form.querySelectorAll('input[name="contactMethod"]').forEach(function (input) {
        input.setAttribute("aria-invalid", invalid ? "true" : "false");
      });
    } else if (control) {
      control.setAttribute("aria-invalid", invalid ? "true" : "false");
    }

    if (error) {
      error.textContent = invalid && config ? t(config.errorKey) : "";
      error.classList.toggle("is-visible", Boolean(invalid));
    }

    if (invalid) {
      state.invalidFields.add(name);
    } else {
      state.invalidFields.delete(name);
    }
  }

  function clearAllErrors() {
    state.invalidFields.clear();
    fieldConfig.forEach(function (config) {
      setFieldInvalid(config.name, false);
    });

    var response = document.getElementById("form-response");
    if (response) {
      response.textContent = "";
      response.hidden = true;
    }
  }

  function updateErrorCopy() {
    fieldConfig.forEach(function (config) {
      if (state.invalidFields.has(config.name)) {
        var error = getErrorElement(config.name);
        if (error) {
          error.textContent = t(config.errorKey);
        }
      }
    });

    var response = document.getElementById("form-response");

    if (!response) {
      return;
    }

    if (state.invalidFields.size > 0) {
      response.textContent = t("contactPage.formErrorSummary");
      response.hidden = false;
    } else {
      response.textContent = "";
      response.hidden = true;
    }
  }

  function projectTypeLabel(value) {
    var select = getControl("projectType");
    var option = select ? select.querySelector('option[value="' + value + '"]') : null;
    return option ? option.textContent.trim() : value;
  }

  function contactMethodLabel(value) {
    if (value === "email") {
      return t("contactPage.formEmailContact");
    }
    if (value === "phone") {
      return t("contactPage.formPhoneContact");
    }
    return t("contactPage.formWhatsappContact");
  }

  function buildMessage(values) {
    return t("contactPage.formMessageTemplate", {
      name: values.name,
      email: values.email,
      phone: values.phone || t("contactPage.formNotProvided"),
      projectType: projectTypeLabel(values.projectType),
      contactMethod: contactMethodLabel(values.contactMethod),
      description: values.description
    });
  }

  function setReviewLinks(message, values) {
    var whatsapp = document.querySelector("[data-review-whatsapp]");
    var email = document.querySelector("[data-review-email]");
    var reviewMessage = document.querySelector("[data-review-message]");

    if (whatsapp) {
      whatsapp.href = "https://wa.me/" + PHONE_INTERNATIONAL + "?text=" + encodeURIComponent(message);
    }

    if (email) {
      var subject = t("contactPage.formEmailSubject", {
        name: values.name,
        projectType: projectTypeLabel(values.projectType)
      });
      email.href =
        "mailto:" +
        EMAIL_ADDRESS +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(message);
    }

    if (reviewMessage) {
      reviewMessage.value = message;
    }
  }

  function updateReview() {
    var values = getValues();
    var message = buildMessage(values);
    setReviewLinks(message, values);
    return message;
  }

  function updateSaveConfirmation() {
    var element = document.querySelector("[data-review-confirmation]");
    if (!element) {
      return;
    }

    if (state.lastSaveOk === null) {
      element.hidden = true;
      element.textContent = "";
      element.classList.remove("is-error");
      return;
    }

    element.hidden = false;
    element.classList.toggle("is-error", !state.lastSaveOk);
    element.textContent = t(
      state.lastSaveOk ? "contactPage.formSavedConfirmation" : "contactPage.formSaveFailed"
    );
  }

  function openReview() {
    var panel = document.querySelector("[data-review-panel]");
    var heading = document.getElementById("review-title");
    var response = document.getElementById("form-response");
    var copyStatus = document.querySelector("[data-copy-status]");
    var values = getValues();
    var message = updateReview();

    if (!panel) {
      return;
    }

    if (copyStatus) {
      copyStatus.textContent = "";
    }

    if (response) {
      response.hidden = true;
      response.textContent = "";
    }

    updateSaveConfirmation();
    panel.hidden = false;
    state.reviewOpen = true;
    panel.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start"
    });

    window.setTimeout(function () {
      if (heading) {
        heading.focus({ preventScroll: true });
      }
    }, 100);

    // Keep the message value in the field for assistive technology and manual
    // review. It is never submitted to a server by this website.
    var reviewMessage = document.querySelector("[data-review-message]");
    if (reviewMessage && message) {
      reviewMessage.value = message;
    }
  }

  function closeReview(returnFocus) {
    var panel = document.querySelector("[data-review-panel]");
    if (panel) {
      panel.hidden = true;
    }
    state.reviewOpen = false;

    if (returnFocus) {
      var name = getControl("name");
      if (name) {
        name.focus();
      }
    }
  }

  function validateAll() {
    var values = getValues();
    var firstInvalid = null;

    fieldConfig.forEach(function (config) {
      var valid = isFieldValid(config.name, values);

      if (!valid && !firstInvalid) {
        firstInvalid = config.name;
      }

      setFieldInvalid(config.name, !valid);
    });

    var response = document.getElementById("form-response");
    if (state.invalidFields.size > 0) {
      if (response) {
        response.textContent = t("contactPage.formErrorSummary");
        response.hidden = false;
      }

      if (firstInvalid) {
        var focusTarget =
          firstInvalid === "contactMethod"
            ? state.form.querySelector('input[name="contactMethod"]')
            : getControl(firstInvalid);

        if (focusTarget) {
          focusTarget.focus();
        }
      }

      closeReview(false);
      return false;
    }

    if (response) {
      response.hidden = true;
      response.textContent = "";
    }

    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (state.submitting || !validateAll()) {
      return;
    }

    state.submitting = true;
    state.lastSaveOk = null;

    var values = getValues();
    var submitButton = event.submitter || state.form.querySelector('button[type="submit"]');
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timeout = window.setTimeout(function () {
      if (controller) controller.abort();
    }, 10000);

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
    }

    try {
      var response = await fetch('/api/submit-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: values.name,
          email: values.email,
          phone: values.phone,
          project_type: values.projectType,
          project_description: values.description,
          preferred_contact: values.contactMethod
        }),
        signal: controller ? controller.signal : undefined
      });

      state.lastSaveOk = response.ok;

      if (!response.ok) {
        console.error('Failed to save submission:', response.status);
      }
    } catch (err) {
      state.lastSaveOk = false;
      console.error('Failed to save submission:', err);
    } finally {
      window.clearTimeout(timeout);
      state.submitting = false;

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }
    }

    openReview();
  }

  function handleBlur(event) {
    var name = event.target.name;
    if (!name) {
      return;
    }

    var config = fieldConfig.filter(function (item) {
      return item.name === name;
    })[0];

    if (!config) {
      return;
    }

    var values = getValues();
    setFieldInvalid(name, !isFieldValid(name, values));
    updateErrorCopy();
  }

  function handleInput(event) {
    var name = event.target.name;

    if (!name) {
      return;
    }

    if (state.invalidFields.has(name)) {
      var values = getValues();
      if (isFieldValid(name, values)) {
        setFieldInvalid(name, false);
        updateErrorCopy();
      }
    }
  }

  function handleReset() {
    window.setTimeout(function () {
      clearAllErrors();
      closeReview(false);
      state.lastSaveOk = null;
      var copyStatus = document.querySelector("[data-copy-status]");
      if (copyStatus) {
        copyStatus.textContent = "";
      }
    }, 0);
  }

  function copyMessage() {
    var messageField = document.querySelector("[data-review-message]");
    var copyStatus = document.querySelector("[data-copy-status]");
    var message = messageField ? messageField.value : updateReview();

    function showStatus(text) {
      if (copyStatus) {
        copyStatus.textContent = text;
      }
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(message)
        .then(function () {
          showStatus(t("contactPage.formCopied"));
        })
        .catch(function () {
          fallbackCopy(messageField, message, showStatus);
        });
    } else {
      fallbackCopy(messageField, message, showStatus);
    }
  }

  function fallbackCopy(messageField, message, showStatus) {
    if (!messageField) {
      showStatus(t("contactPage.formCopyError"));
      return;
    }

    messageField.focus();
    messageField.select();

    try {
      var success = document.execCommand("copy");
      showStatus(success ? t("contactPage.formCopied") : t("contactPage.formCopyError"));
    } catch (error) {
      showStatus(t("contactPage.formCopyError"));
    }
  }

  function preselectService() {
    var select = getControl("projectType");
    if (!select) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var requested = params.get("service");

    if (!requested) {
      return;
    }

    var option = select.querySelector('option[value="' + requested.replace(/"/g, "") + '"]');
    if (option) {
      select.value = requested;
    }
  }

  function bindEvents() {
    state.form.addEventListener("submit", handleSubmit);
    state.form.addEventListener("reset", handleReset);
    state.form.addEventListener("blur", handleBlur, true);
    state.form.addEventListener("input", handleInput);
    state.form.addEventListener("change", handleInput);

    var copyButton = document.querySelector("[data-copy-message]");
    if (copyButton) {
      copyButton.addEventListener("click", copyMessage);
    }

    var editButton = document.querySelector("[data-edit-enquiry]");
    if (editButton) {
      editButton.addEventListener("click", function () {
        closeReview(true);
      });
    }

    document.addEventListener("thc:languagechange", function () {
      updateErrorCopy();

      var copyStatus = document.querySelector("[data-copy-status]");
      if (copyStatus) {
        copyStatus.textContent = "";
      }

      if (state.reviewOpen) {
        updateReview();
        updateSaveConfirmation();
      }
    });
  }

  function init() {
    if (state.initialised) {
      return;
    }

    state.form = document.getElementById("contact-form");

    if (!state.form) {
      return;
    }

    state.initialised = true;
    preselectService();
    bindEvents();
  }

  window.ContactForm = {
    init: init
  };
})();
