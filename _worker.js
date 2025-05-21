export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (
      (url.pathname === "/post-a-job" || url.pathname === "/post-a-job/") &&
      request.method === "POST"
    ) {
      // 1. Parse the JSON body:
      const fields = await request.json();

      // 2. Send to Airtable:
      const airtableUrl =
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_TABLE_NAME}`;
      const airtableRes = await fetch(airtableUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        // Airtable expects { fields: { <colName>: value, … } }
        body: JSON.stringify({ fields }),
      });

      if (!airtableRes.ok) {
        return new Response("❌ Couldn’t save your job.", { status: 500 });
      }

      // 3. Return JSON so your page can confirm success
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // All other requests fall back to static files
    return env.ASSETS.fetch(request);
  },
};
