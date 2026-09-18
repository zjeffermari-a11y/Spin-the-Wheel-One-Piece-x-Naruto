export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body || {};
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'Server configuration error: Missing OPENAI_API_KEY'
      });
    }

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Missing prompt'
      });
    }

    const payload = {
      model: 'gpt-image-2.5-sunburst',
      prompt: `Generate a One Piece-inspired anime Wanted Poster character portrait.

The image itself must contain ONLY the character artwork.
Do not add poster text, bounty numbers, UI, borders, logos, watermarks, or typography.

Character Description:
${prompt}`,
      n: 1,
      size: '1024x1024',
      quality: 'high',
      output_format: 'jpeg',
      output_compression: 75,
      background: 'opaque'
    };

    const response = await fetch(
      'https://api.openai.com/v1/images/generations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI image generation failed"
      });
    }

    const imageBase64 = data?.data?.[0]?.b64_json;

    if (!imageBase64) {
      console.error('Unexpected OpenAI response:', data);

      return res.status(502).json({
        error: 'OpenAI returned no image data'
      });
    }

    return res.status(200).json({
      url: `data:image/jpeg;base64,${imageBase64}`
    });

  } catch (error) {
    console.error("Portrait Generation error:", error);

    return res.status(500).json({
      error: error instanceof Error
        ? error.message
        : String(error)
    });
  }
}