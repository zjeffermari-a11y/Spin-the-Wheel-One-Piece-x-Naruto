export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, systemInstruction } = req.body;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    const payload = {
      model: "openai/gpt-oss-120b", // User preferred model
      messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    };

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Groq API error: ${response.status} ${err}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content || "";
    content = content.replace(/\s*```json\s*/gi, '').replace(/\s*```\s*/gi, '').trim();
    
    res.status(200).json(JSON.parse(content));
  } catch (error) {
    console.error("AI Generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate lore" });
  }
}
