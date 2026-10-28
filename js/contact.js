/* ==========================================================================
   Thomas Hondo Chacha — Project enquiry form
   Validates locally, saves the enquiry, then opens the preferred contact
   channel (WhatsApp or email) with the prepared message. A single Submit
   button drives the whole flow and the form clears itself afterwards.
   ========================================================================== */
(function () {
  "use strict";

  var PHONE_INTERNATIONAL = "254705023432";
  var EMAIL_ADDRESS = "thomashondochacha@gmail.com";
  var state = {
    initialised: false,
    form: null,
    invalidFields: new Set(),
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

  // Phone numbers are optional, but when given they must strictly start with
  // a plus sign followed by 7 to 15 digits, e.g. +254705023432.
  function isValidPhone(value) {
    if (!value) {
      return true;
    }

    var digits = value.replace(/\D/g, "");
    return value.charAt(0) === "+" && digits.length >= 7 && digits.length <= 15;
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

  function setResponse(message, ok) {
    var response = document.getElementById("form-response");
    if (!response) {
      return;
    }

    if (!message) {
      response.textContent = "";
      response.hidden = true;
      response.classList.remove("is-success");
      return;
    }

    response.textContent = message;
    response.hidden = false;
    response.classList.toggle("is-success", Boolean(ok));
  }

  function clearAllErrors() {
    state.invalidFields.clear();
    fieldConfig.forEach(function (config) {
      setFieldInvalid(config.name, false);
    });
    setResponse("", false);
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

    if (state.invalidFields.size > 0) {
      setResponse(t("contactPage.formErrorSummary"), false);
    } else {
      setResponse("", false);
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

  function clearForm() {
    getControl("name").value = "";
    getControl("email").value = "";
    getControl("phone").value = "";
    getControl("projectType").value = "";
    getControl("description").value = "";

    var whatsappInput = state.form.querySelector(
      'input[name="contactMethod"][value="whatsapp"]'
    );
    if (whatsappInput) {
      whatsappInput.checked = true;
    }
  }

  // Opens the chosen channel immediately, while the browser still sees a user
  // gesture, so the new tab or mail client is not blocked as a popup.
  function openPreparedChannel(values, message) {
    var link = document.createElement("a");
    var href = "";

    if (values.contactMethod === "whatsapp") {
      href = "https://wa.me/" + PHONE_INTERNATIONAL + "?text=" + encodeURIComponent(message);
    } else if (values.contactMethod === "email") {
      var subject = t("contactPage.formEmailSubject", {
        name: values.name,
        projectType: projectTypeLabel(values.projectType)
      });
      href =
        "mailto:" +
        EMAIL_ADDRESS +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(message);
    } else {
      return false;
    }

    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
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

    if (state.invalidFields.size > 0) {
      setResponse(t("contactPage.formErrorSummary"), false);

      if (firstInvalid) {
        var focusTarget =
          firstInvalid === "contactMethod"
            ? state.form.querySelector('input[name="contactMethod"]')
            : getControl(firstInvalid);

        if (focusTarget) {
          focusTarget.focus();
        }
      }

      return false;
    }

    setResponse("", false);
    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (state.submitting || !validateAll()) {
      return;
    }

    state.submitting = true;

    var values = getValues();
    var message = buildMessage(values);
    var submitButton = event.submitter || state.form.querySelector('button[type="submit"]');
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timeout = window.setTimeout(function () {
      if (controller) controller.abort();
    }, 10000);

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
    }

    // Hand the message to WhatsApp or email straight away, before the network
    // request, so browsers do not treat it as a blocked popup.
    openPreparedChannel(values, message);

    var saved = false;

    try {
      var response = await fetch("/api/submit-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
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

      saved = response.ok;

      if (!response.ok) {
        console.error("Failed to save submission:", response.status);
      }
    } catch (err) {
      saved = false;
      console.error("Failed to save submission:", err);
    } finally {
      window.clearTimeout(timeout);
      state.submitting = false;

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }
    }

    if (saved) {
      clearForm();
      clearAllErrors();
      setResponse(t("contactPage.formSavedConfirmation"), true);
    } else {
      setResponse(t("contactPage.formSaveFailed"), false);
    }
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
    state.form.addEventListener("blur", handleBlur, true);
    state.form.addEventListener("input", handleInput);
    state.form.addEventListener("change", handleInput);

    document.addEventListener("thc:languagechange", function () {
      updateErrorCopy();
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
