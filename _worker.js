export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Only intercept POST /post-a-job
    if (
      (url.pathname === "/post-a-job" || url.pathname === "/post-a-job/") &&
      request.method === "POST"
    ) {
      try {
        // 1. Parse the JSON body from the form
        const {
          title,
          description,
          employmentType,
          compensation,
          location,
          salonName,
          website,
          socialMedia,
          contactEmail
        } = await request.json();

        // 2. Map to Airtable columns (must match exactly)
        const airtableFields = {
          "Job Title": title,
          "Job Description": description,
          "Employment Type": employmentType,
          "Compensation": compensation,
          "Location": location,
          "Barbershop/Salon Name": salonName,
          "Website(optional)": website,
          "Social Media (optional)": socialMedia,
          "Contact Email": contactEmail
        };

        // 3. Build the Airtable API URL
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

        // 5. Handle Airtable errors
        if (!airtableRes.ok) {
          const errorText = await airtableRes.text();
          return new Response(
            `❌ Airtable error ${airtableRes.status}: ${errorText}`,
            { status: 500 }
          );
        }

        // 6. On success, tell the client
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { "Content-Type": "application/json" } }
        );

      } catch (err) {
        // Catch JSON parsing or other runtime errors
        return new Response(
          `❌ Worker exception: ${err.message}`,
          { status: 500 }
        );
      }
    }

    // All other requests—serve static files
    return env.ASSETS.fetch(request);
  }
};
