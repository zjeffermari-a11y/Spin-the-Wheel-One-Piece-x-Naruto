export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body || {};
    const HIGGSFIELD_API_KEY_ID = process.env.HIGGSFIELD_API_KEY_ID;
    const HIGGSFIELD_API_KEY_SECRET = process.env.HIGGSFIELD_API_KEY_SECRET;

    if (!HIGGSFIELD_API_KEY_ID || !HIGGSFIELD_API_KEY_SECRET) {
      return res.status(500).json({
        error: 'Server configuration error: Missing HIGGSFIELD_API_KEY_ID or HIGGSFIELD_API_KEY_SECRET'
      });
    }

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Missing prompt'
      });
    }

    const payload = {
      prompt: `Generate a One Piece-inspired anime Wanted Poster character portrait. The image itself must contain ONLY the character artwork. Do not add poster text, bounty numbers, UI, borders, logos, watermarks, or typography. Character Description: ${prompt}`
    };

    const initialResponse = await fetch('https://api.higgsfield.ai/higgsfield-ai/soul/v2/standard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${HIGGSFIELD_API_KEY_ID}:${HIGGSFIELD_API_KEY_SECRET}`
      },
      body: JSON.stringify(payload)
    });

    const initialData = await initialResponse.json();

    if (!initialResponse.ok) {
      return res.status(initialResponse.status).json({
        error: initialData?.detail || initialData?.error || "Higgsfield API generation request failed"
      });
    }

    const { status_url } = initialData;
    
    if (!status_url) {
      return res.status(502).json({
        error: 'Higgsfield API returned no status URL'
      });
    }

    // Polling loop
    const maxRetries = 25; // 25 * 2s = 50 seconds max
    let retries = 0;
    
    while (retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(status_url, {
        headers: {
          'Authorization': `Key ${HIGGSFIELD_API_KEY_ID}:${HIGGSFIELD_API_KEY_SECRET}`
        }
      });
      
      const statusData = await statusResponse.json();
      
      if (!statusResponse.ok) {
        return res.status(statusResponse.status).json({
          error: statusData?.error || "Higgsfield status check failed"
        });
      }

      if (statusData.status === 'completed') {
        const imageUrl = statusData.images?.[0]?.url;
        if (!imageUrl) {
          return res.status(502).json({ error: 'Higgsfield returned completed status but no image URL' });
        }
        
        // Return the image URL directly (no need for base64 unless required, but the frontend currently expects `url: "..."`)
        // Wait, does the frontend expect base64 or a URL? It expects a string that it sets as the image src.
        // The previous implementation returned `{ url: "data:image/jpeg;base64,..." }`.
        // A direct URL will work perfectly in an <img src="..." />!
        return res.status(200).json({ url: imageUrl });
      } else if (statusData.status === 'failed') {
        return res.status(500).json({ error: 'Higgsfield generation failed internally' });
      }
      
      // If status is 'queued' or 'processing', we continue the loop
      retries++;
    }

    return res.status(504).json({ error: 'Higgsfield image generation timed out after 50 seconds' });

  } catch (error) {
    console.error("Portrait Generation error:", error);

    return res.status(500).json({
      error: error instanceof Error
        ? error.message
        : String(error)
    });
  }
}