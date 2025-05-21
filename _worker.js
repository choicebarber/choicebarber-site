export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (
      (url.pathname === "/post-a-job" || url.pathname === "/post-a-job/") &&
      request.method === "POST"
    ) {
      try {
// 1. Parse JSON body
const {
  title,
  description,
  employmentType,
  compensation,
  location,
  salonName,
  website,
  socialMedia,      // <-- grab this now
  contactEmail
} = await request.json();

// 2. Map to Airtable columns
const airtableFields = {
  "Job Title": title,
  "Job Description": description,
  "Employment Type": employmentType,
  "Compensation": compensation,
  "Location": location,
  "Barbershop/Salon Name": salonName,
  "Website (optional)": website,          // exact column name
  "Social Media (optional)": socialMedia, // exact column name
  "Contact Email": contactEmail
};


        // 3. Build URL
        const table = encodeURIComponent(env.AIRTABLE_TABLE_NAME);
        const airtableUrl = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${table}`;

        // 4. Send to Airtable
        const airtableRes = await fetch(airtableUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.AIRTABLE_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ fields: airtableFields })
        });

        // 5. Surface errors
        if (!airtableRes.ok) {
          const errorText = await airtableRes.text();
          return new Response(
            `❌ Airtable error ${airtableRes.status}: ${errorText}`,
            { status: 500 }
          );
        }

        // 6. Success
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (err) {
        return new Response(
          `❌ Worker exception: ${err.message}`,
          { status: 500 }
        );
      }
    }

    // Fallback to static assets
    return env.ASSETS.fetch(request);
  }
};
