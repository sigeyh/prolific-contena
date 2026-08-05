export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { amount, phone_number, external_reference } = req.body;

  if (!phone_number || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Format phone number to 2547XXXXXXXX
  let formattedPhone = phone_number.replace(/\D/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.slice(1);
  } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
    formattedPhone = '254' + formattedPhone;
  } else if (formattedPhone.startsWith('+')) {
    formattedPhone = formattedPhone.slice(1);
  }

  try {
    const rawResponse = await fetch('https://megapay.co.ke/backend/v1/initiatestk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: "MGPYCN5rjePf",
        email: "kemeirowan@gmail.com",
        amount: amount.toString(),
        msisdn: formattedPhone,
        reference: external_reference,
        till_number: "9824375",
        account_name: "Hakika"
      })
    });

    const text = await rawResponse.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("MegaPay Non-JSON Response:", text);
      return res.status(500).json({ error: "Upstream returned non-JSON", details: text.substring(0, 250) });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("MegaPay initiatestk error:", err);
    return res.status(500).json({ error: err.message });
  }
}
