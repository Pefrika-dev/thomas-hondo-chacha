/* ==========================================================================
   Contact form collector.

   Protects the lead inbox:
   * only the site's own origins may post (no wildcard CORS)
   * a hidden honeypot field silently absorbs bot submissions
   * per-visitor throttle (best effort on serverless)
   * strict length caps and format checks before anything reaches Supabase
   ========================================================================== */
const crypto = require('crypto');

const SUPABASE_URL = "https://pumbpmgclnxisfkdaanm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_dbDtzuRs1Ll8QZDYskQKSg_8LfoeDhD";

const ALLOWED_ORIGINS = new Set([
  "https://www.thomashondochacha.co.ke",
  "https://thomashondochacha.co.ke",
  "https://thomas-hondo-chacha.vercel.app"
]);

const LIMITS = {
  full_name: 120,
  email: 200,
  phone: 32,
  project_type: 60,
  project_description: 4000,
  preferred_contact: 40
};

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map();

function text(value, max) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max);
}

function clientKey(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const ip = forwarded || (req.socket && req.socket.remoteAddress) || "";
  const agent = String(req.headers["user-agent"] || "");
  return crypto.createHash("sha256").update(`${ip}|${agent}`).digest("hex").slice(0, 32);
}

function allowed(req) {
  const key = clientKey(req);
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(key, { start: now, count: 1 });
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_PER_WINDOW;
}

module.exports = async (req, res) => {
  const origin = req.headers.origin;

  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    res.status(403).json({ error: "Origin not allowed" });
    return;
  }
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!allowed(req)) {
    res.status(429).json({ error: "Too many attempts. Please try again later." });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (error) {
      body = null;
    }
  }
  if (!body || typeof body !== "object") {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  /* Honeypot: a real visitor never fills a hidden "company website" field.
     Answer 200 so a bot cannot tell that it was filtered out. */
  if (text(body.company_website, 200)) {
    res.status(200).json({ success: true });
    return;
  }

  const full_name = text(body.full_name, LIMITS.full_name);
  const email = text(body.email, LIMITS.email);
  const phone = text(body.phone, LIMITS.phone);
  const project_type = text(body.project_type, LIMITS.project_type);
  const project_description = text(body.project_description, LIMITS.project_description);
  const preferred_contact = text(body.preferred_contact, LIMITS.preferred_contact);

  if (!full_name || !email || !project_type || !project_description || !preferred_contact) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }

  if (["whatsapp", "email", "phone"].indexOf(preferred_contact) === -1) {
    res.status(400).json({ error: "Invalid preferred contact method" });
    return;
  }

  if (phone && !/^\+?[0-9][0-9\s()-]{6,24}$/.test(phone)) {
    res.status(400).json({ error: "Invalid phone number" });
    return;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/contact_submissions`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        full_name,
        email,
        phone: phone || null,
        project_type,
        project_description,
        preferred_contact
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Supabase insert failed:", response.status, detail);
      res.status(500).json({ error: "Failed to save submission" });
      return;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Contact submission error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
