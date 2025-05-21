export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1) Catch POSTs to /post-a-job
    if (
      (url.pathname === "/post-a-job" || url.pathname === "/post-a-job/") &&
      request.method === "POST"
    ) {
      try {
        // 1. Read the JSON body from the client
        const {
          title,
          description,
          employmentType,
          location,
          salary,
          contact
        } = await request.json();

        // 2. Map to your exact Airtable column names
        const airtableFields = {
          "Job Title": title,
          "Job Description": description,
          "Employment Type": employmentType,
          "Location": location,
          "Compensation": salary,
          "Contact Email": contact
        };

        // 3. Build the Airtable API URL (encode table name to handle spaces)
        const table = encodeURIComponent(env.AIRTABLE_TABLE_NAME);
        const airtableUrl = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${table}`;

        // 4. Send the POST to Airtable
        const airtableRes = await fetch(airtableUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.AIRTABLE_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ fields: airtableFields })
        });

        // 5. If Airtable returns an error, show its message
        if (!airtableRes.ok) {
          const errorText = await airtableRes.text();
          return new Response(
            `❌ Airtable error ${airtableRes.status}: ${errorText}`,
            { status: 500 }
          );
        }

        // 6. On success, return JSON so your page can show the success message
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (err) {
        // Catch any JSON parsing or other runtime errors
        return new Response(
          `❌ Worker exception: ${err.message}`,
          { status: 500 }
        );
      }
    }

    // 2) All other requests fall back to serving your static site
    return env.ASSETS.fet
