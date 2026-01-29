const OpenAI = require('openai');

module.exports = async (req, res) => {
  // 1. Pastikan cuma terima POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Cek API Key
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'API Key server belum disetting' });
  }

  const { messages } = req.body;

  try {
    // 3. Setup Client
    const client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    // 4. Request ke Groq
    const completion = await client.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
    });

    // 5. Balikin jawaban ke frontend
    res.status(200).json({ result: completion.choices[0].message.content });

  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: 'Gagal mengambil data dari Groq', details: error.message });
  }
};
