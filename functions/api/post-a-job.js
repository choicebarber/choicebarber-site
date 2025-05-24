export async function onRequestPost({ request, env }) {
  try {
    // 1. Parse the JSON body
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

    // 2. Map to your Airtable field names
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

    // 3. Build Airtable URL
    const baseId = env.AIRTABLE_BASE_ID;
    const tableName = encodeURIComponent(env.AIRTABLE_TABLE_NAME);
    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableName}`;

    // 4. POST to Airtable
    const airtableRes = await fetch(airtableUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.AIRTABLE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fields: airtableFields })
    });

    const airtableData = await airtableRes.json();
    if (!airtableRes.ok) {
      throw new Error(
        `Airtable error ${airtableRes.status}: ${JSON.stringify(airtableData)}`
      );
    }

    // 5. Return success
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
