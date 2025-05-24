export async function onRequestPost({ request, env }) {
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

    // 2. Map to Airtable column names
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

    // 3. Build the Airtable API URL
    const base = env.AIRTABLE_BASE_ID;
    const table = encodeURIComponent(env.AIRTABLE_TABLE_NAME);
    const url = `https://api.airtable.com/v0/${base}/${table}`;

    // 4. Send POST request to Airtable
    const airtableRes = await fetch(url, {
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
      return new Response(`❌ Airtable error ${airtableRes.status}: ${errorText}`, { status: 500 });
    }

    // 6. On success, return JSON
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(`❌ Worker exception: ${err.message}`, { status: 500 });
  }
}
