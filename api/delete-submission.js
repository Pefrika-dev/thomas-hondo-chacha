const SUPABASE_URL = "https://pumbpmgclnxisfkdaanm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_dbDtzuRs1Ll8QZDYskQKSg_8LfoeDhD";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { email } = body || {};

    if (!email) {
      res.status(400).json({ error: "Missing email" });
      return;
    }

    // Note: This endpoint relies on a Supabase RLS delete policy.
    // If the policy is not configured, Supabase will return an error.
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/contact_submissions?email=eq.${encodeURIComponent(email)}`,
      {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        }
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Delete failed:", response.status, text);
      res.status(response.status).json({ error: "Delete failed", detail: text });
      return;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Internal error" });
  }
};
