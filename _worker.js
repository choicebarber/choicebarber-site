export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle form POSTs to /post-a-job
    if (url.pathname === "/post-a-job" && request.method === "POST") {
      const form = await request.formData();
      const fields = {};
      for (const [key, value] of form.entries()) {
        fields[key] = value;
      }

      const airtableUrl = 
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_TABLE_NAME}`;
      const airtableRes = await fetch(airtableUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      });

      if (!airtableRes.ok) {
        return new Response("❌ Couldn’t save your job.", { status: 500 });
      }

      return Response.redirect(`${url.origin}/jobs`, 303);
    }

    // All other requests just serve your static files
    return env.ASSETS.fetch(request);
  },
};
