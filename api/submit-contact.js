const SUPABASE_URL = "https://pumbpmgclnxisfkdaanm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_dbDtzuRs1Ll8QZDYskQKSg_8LfoeDhD";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const {
      full_name,
      email,
      phone,
      project_type,
      project_description,
      preferred_contact
    } = body || {};

    if (!full_name || !email || !project_type || !project_description || !preferred_contact) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

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
