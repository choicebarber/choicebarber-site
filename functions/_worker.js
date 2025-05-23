export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ——— 1) POST /post-a-job → Airtable submission
    if (
      (url.pathname === "/post-a-job" || url.pathname === "/post-a-job/") &&
      request.method === "POST"
    ) {
      try {
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

        const airtableFields = {
          "Job Title": title,
          "Job Description": description,
          "Employment Type": employmentType,
          "Compensation": compensation,
          "Location": location,
          "Barbershop/Salon Name": salonName,
          "Website (optional)": website,
          "Social Media (optional)": socialMedia,
          "Contact Email": contactEmail
        };

        const table = encodeURIComponent(env.AIRTABLE_TABLE_NAME);
        const airtableUrl = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${table}`;

        const airtableRes = await fetch(airtableUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.AIRTABLE_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ fields: airtableFields })
        });

        if (!airtableRes.ok) {
          const errorText = await airtableRes.text();
          return new Response(
            `❌ Airtable error ${airtableRes.status}: ${errorText}`,
            { status: 500 }
          );
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json" }
        });

      } catch (err) {
        return new Response(`❌ Worker exception: ${err.message}`, {
          status: 500
        });
      }
    }

    // ——— 2) GET /api/jobs → fetch latest (and optional location filter)
    if (url.pathname === "/api/jobs" && request.method === "GET") {
      try {
        const locationFilter = url.searchParams.get("location") || "";
        const airtableUrl = new URL(
          `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_TABLE_NAME}`
        );
        // Sort by creation time descending
        airtableUrl.searchParams.set("sort[0][field]", "Created");
        airtableUrl.searchParams.set("sort[0][direction]", "desc");
        // If a location query, filter by that field
        if (locationFilter) {
          const formula = `FIND("${locationFilter.replace(/"/g,'\\"')}",{Location})`;
          airtableUrl.searchParams.set("filterByFormula", formula);
        }

        const resp = await fetch(airtableUrl.toString(), {
          headers: { Authorization: `Bearer ${env.AIRTABLE_API_KEY}` }
        });
        if (!resp.ok) throw new Error(`Airtable status ${resp.status}`);
        const { records } = await resp.json();
        return new Response(JSON.stringify(records), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(`❌ Error fetching jobs: ${err.message}`, {
          status: 500
        });
      }
    }

    // ——— 3) All other requests → serve your static files
    return env.ASSETS.fetch(request);
  }
};

