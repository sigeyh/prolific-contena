export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { transaction_request_id } = req.body;

  if (!transaction_request_id) {
    return res.status(400).json({ error: 'Missing transaction_request_id' });
  }

  try {
    const response = await fetch('https://megapay.co.ke/backend/v1/transactionstatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: "MGPYCN5rjePf",
        email: "kemeirowan@gmail.com",
        transaction_request_id: transaction_request_id
      })
    });
    
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("MegaPay status Non-JSON Response:", text);
      return res.status(500).json({ error: "Invalid JSON from status API", details: text.substring(0, 250) });
    }
    
    return res.status(200).json(data);
  } catch (err) {
    console.error("MegaPay transactionstatus error:", err);
    return res.status(500).json({ error: err.message });
  }
}
