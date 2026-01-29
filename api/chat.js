import OpenAI from 'openai';

export default async function handler(req, res) {
  // 1. Cek Method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Cek API Key
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'API Key server belum disetting' });
  }

  try {
    // 3. Setup Client
    const client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const { messages } = req.body;

    // 4. Request ke Groq
    const completion = await client.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
    });

    // 5. Jawaban
    return res.status(200).json({ result: completion.choices[0].message.content });

  } catch (error) {
    console.error("Backend Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
