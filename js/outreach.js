/* Outreach sender — renders into the admin "Outreach" tab.
   Admin-only: this file is loaded by admin.html behind the Content Studio login. */
(function () {
  "use strict";

  const root = document.getElementById("outreachRoot");
  if (!root) return;

  const leads = [
    {
      id: "daima",
      name: "Daima Communications",
      number: "0701 127 577",
      note: "Warm — quotation already drafted, demo reviewed. Best first message.",
      text: "Hello, this is Thomas Hondo Chacha. I built the Daima Communications catalogue demo that your team reviewed, and the quotation for the production shop is ready: M-Pesa checkout, stock control and order management on top of the 38-product catalogue. Could we take 10 minutes this week to agree what goes into phase one? If it is no longer a priority, just say so and I will not follow up. — Thomas, 0705 023 432"
    },
    {
      id: "togotane",
      name: "Radio Togotane 88.3 FM",
      number: "0714 426 619",
      note: "Existing client — domain, ad rates, presenter profiles. Settle which email to publish.",
      text: "Hello, Thomas Hondo Chacha here. The station site is live. The next step I would suggest is your own domain, an advertising rates page and presenter profiles, so advertisers can reach you directly instead of through a post. Also: which email should be published, togotaneradiofm@gmail.com or info.togotaneradio@gmail.com? I can prepare both changes this week."
    },
    {
      id: "hood",
      name: "The Yads Hood Hotel",
      number: "0785 859 400",
      note: "Demo built, not commissioned. Offer to show it in person or send screenshots.",
      text: "Hello, this is Thomas Hondo Chacha, a software engineer in Migori. I built a 10-page website and booking system for The Yads Hood Hotel: rooms, facilities, a booking form and an admin panel for the staff. It is not commissioned, so nothing is published and nothing is owed. I can show it to you in person or send screenshots. If it fits, we agree a scope; if not, that is fine. — Thomas, 0705 023 432"
    },
    {
      id: "marowa",
      name: "Marowa Store Hardware",
      number: "0716 865 976",
      note: "Demo live — send https://marowa-store-migori-demo.netlify.app/ only if they ask.",
      text: "Hello, Thomas Hondo Chacha here. The Marowa storefront demo is live, and the production backend is written up: quotation requests, stock levels and an admin view so the counter and the website show the same numbers. Can we set 15 minutes to confirm what the first phase covers? If the timing is wrong, just tell me and I will stop. — Thomas, 0705 023 432"
    },
    {
      id: "kimwanya",
      name: "Kimwanya Enterprises",
      number: "0718 266 967",
      note: "Site and admin built, proposal ready. Do not send a link until the live URL is confirmed.",
      text: "Hello, Thomas Hondo Chacha here. The Kimwanya site, property pages and admin are built, and the proposal is ready. Before we take it live I need to confirm the listings and where enquiries should land. When are you free for a short call? — Thomas, 0705 023 432"
    },
    {
      id: "florence",
      name: "Florence Hotel",
      number: "0717 055 036",
      note: "Publicly posted 'website coming soon'. Strongest cold lead.",
      text: "Hello, this is Thomas Hondo Chacha, a software engineer in Migori. I saw the Florence Hotel post saying a website is coming soon. I build hotel sites where booking enquiries come straight to WhatsApp, with room pages and conference details, so you are not paying OTA commission on every guest. Would a 10-minute call this week be useful? Examples of my work: https://www.thomashondochacha.co.ke/projects.html?utm_source=whatsapp&utm_medium=outreach&utm_campaign=florence"
    },
    {
      id: "kowuoke",
      name: "Kowuoke Karabok Hardware",
      number: "0710 174 742",
      note: "Facebook only. Reuse the quotation-commerce pattern.",
      text: "Hello, Thomas Hondo Chacha here, software engineer in Migori. I build hardware shop sites with product lists and quotation requests, and the structure is already built from a similar Migori shop. If you would like customers to see doors, cement and prices before they walk in, I can show you how it works in 10 minutes. If it is not useful, just say so. — Thomas, 0705 023 432"
    },
    {
      id: "dela",
      name: "Dela Boss Outfits",
      number: "0758 102 552",
      note: "14-page demo live. Offer the link before asking for anything.",
      text: "Hello, Thomas Hondo Chacha here. I built a 14-page site for Dela Boss Outfits: collections, photos and WhatsApp order buttons. It is not live yet. Would you like the link to review it? If it fits, we agree a small scope to publish it; if not, just say so. — Thomas, 0705 023 432"
    },
    {
      id: "justine",
      name: "Justine De SALONIST",
      number: "0794 393 827",
      note: "9-page demo with booking admin, sends bookings to WhatsApp.",
      text: "Hello, Thomas Hondo Chacha here. I built a 9-page site and booking admin for Justine De SALONIST: services, prices and a booking form that sends straight to WhatsApp. It is ready to review. Shall I send you the link? — Thomas, 0705 023 432"
    }
  ];

  const emailLead = {
    id: "sda",
    name: "SDA Migori Central",
    number: "sdamigoricentral@gmail.com",
    subject: "Migori Central SDA — the church site needs a new domain",
    body: "Dear Migori Central SDA Church,\n\nThomas Hondo Chacha here. I built the bilingual church website and the dashboard behind it, but the old address, sdamigoricentral.org, no longer resolves, so the site currently has no working home. I can move it to a new domain, reconnect the dashboard and hand over the login details so the church controls it.\n\nMay I send you the details and a price for the domain and the move? There is no obligation.\n\nThomas Hondo Chacha\n+254 705 023 432\nhttps://www.thomashondochacha.co.ke/"
  };

  const KEY = "thc-outreach-sent";
  let sent;
  try {
    sent = new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));
  } catch {
    sent = new Set();
  }

  function mark(id, on) {
    if (on) sent.add(id);
    else sent.delete(id);
    try { localStorage.setItem(KEY, JSON.stringify([...sent])); } catch { /* storage disabled */ }
  }

  function waHref(number, text) {
    const digits = String(number).replace(/\D/g, "");
    const intl = digits.startsWith("0") ? "254" + digits.slice(1) : digits;
    return "https://wa.me/" + intl + "?text=" + encodeURIComponent(text);
  }

  function rules() {
    const el = document.createElement("div");
    el.className = "outreach-rules";
    el.innerHTML = "<strong>Rules:</strong> max 5 first messages a day · 09:00–11:30 and 14:00–16:30 · " +
      "one business per message · no forwards or groups · after sending, log <code>first_send</code> in " +
      "<code>outreach/tracker.csv</code>. Follow up on day 3 and day 8 only, then stop.";
    return el;
  }

  function card(item) {
    const el = document.createElement("section");
    el.className = "outreach-card" + (sent.has(item.id) ? " is-done" : "");

    const row = document.createElement("div");
    row.className = "outreach-row";
    const name = document.createElement("span");
    name.className = "outreach-name";
    name.textContent = item.name;
    const num = document.createElement("span");
    num.className = "outreach-num";
    num.textContent = item.number;
    row.append(name, num);

    const note = document.createElement("p");
    note.className = "outreach-note";
    note.textContent = item.note || "";

    const msg = document.createElement("div");
    msg.className = "outreach-msg";
    msg.textContent = item.subject ? item.subject + "\n\n" + item.body : item.text;

    const actions = document.createElement("div");
    actions.className = "outreach-actions";

    const href = item.subject
      ? "mailto:" + item.number + "?subject=" + encodeURIComponent(item.subject) + "&body=" + encodeURIComponent(item.body)
      : waHref(item.number, item.text);

    const send = document.createElement("a");
    send.className = "outreach-send" + (item.subject ? " is-mail" : "");
    send.href = href;
    send.target = "_blank";
    send.rel = "noopener noreferrer";
    send.textContent = item.subject ? "Open email" : "Open WhatsApp";

    const copy = document.createElement("button");
    copy.className = "outreach-copy";
    copy.type = "button";
    copy.textContent = "Copy text";
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(item.subject ? item.subject + "\n\n" + item.body : item.text);
        copy.textContent = "Copied";
        setTimeout(() => { copy.textContent = "Copy text"; }, 1500);
      } catch {
        copy.textContent = "Select the text above";
      }
    });

    const done = document.createElement("label");
    done.className = "outreach-done";
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = sent.has(item.id);
    box.addEventListener("change", () => {
      mark(item.id, box.checked);
      el.classList.toggle("is-done", box.checked);
    });
    done.append(box, document.createTextNode("Sent"));

    actions.append(send, copy, done);
    el.append(row, note, msg, actions);
    return el;
  }

  function composer() {
    const el = document.createElement("section");
    el.className = "outreach-card outreach-composer";

    const row = document.createElement("div");
    row.className = "outreach-row";
    const name = document.createElement("span");
    name.className = "outreach-name";
    name.textContent = "Custom outreach — any prospect";
    const num = document.createElement("span");
    num.className = "outreach-num";
    num.textContent = "manual";
    row.append(name, num);

    const fields = document.createElement("div");
    fields.className = "outreach-fields";

    const numLabel = document.createElement("label");
    numLabel.textContent = "Recipient";
    const numInput = document.createElement("input");
    numInput.type = "tel";
    numInput.placeholder = "0717 055 036 or +254717055036";

    const textLabel = document.createElement("label");
    textLabel.textContent = "Message (WhatsApp text)";
    const textInput = document.createElement("textarea");
    textInput.placeholder = "Hello, this is Thomas Hondo Chacha... Would you be open to a quick call?";

    const actions = document.createElement("div");
    actions.className = "outreach-actions";

    const gen = document.createElement("button");
    gen.className = "outreach-copy";
    gen.type = "button";
    gen.textContent = "Generate WhatsApp link";
    const link = document.createElement("a");
    link.className = "outreach-send";
    link.href = "#";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open WhatsApp";
    const hint = document.createElement("span");
    hint.className = "outreach-hint";
    hint.textContent = "Link is generated for the number you type; open it and send.";

    gen.addEventListener("click", () => {
      const number = numInput.value.trim();
      const text = textInput.value.trim();
      if (!number || !text) {
        gen.textContent = "Add a number and a message first";
        setTimeout(() => { gen.textContent = "Generate WhatsApp link"; }, 1800);
        return;
      }
      link.href = waHref(number, text);
      gen.textContent = "Regenerate";
    });

    actions.append(gen, link, hint);
    fields.append(numLabel, numInput, textLabel, textInput, actions);
    el.append(row, fields);
    return el;
  }

  root.append(rules(), composer());
  leads.forEach((lead) => root.append(card(lead)));
  root.append(card(emailLead));
})();
