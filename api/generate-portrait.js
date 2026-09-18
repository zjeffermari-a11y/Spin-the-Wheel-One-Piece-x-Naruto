export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Server configuration error: Missing OpenAI API Key' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    const payload = {
      model: "gpt-image-2.5-sunburst", // User preferred model
      prompt: `Generate a One Piece anime style Wanted Poster portrait for this character. The art should be a character portrait with no extra text or UI. Character Description: ${prompt}`,
      n: 1,
      size: "1024x1024",
      response_format: "url"
    };

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.text();
        console.error("OpenAI Image API Error:", err);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;
    
    res.status(200).json({ url: imageUrl });
  } catch (error) {
    console.error("Portrait Generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate portrait" });
  }
}
