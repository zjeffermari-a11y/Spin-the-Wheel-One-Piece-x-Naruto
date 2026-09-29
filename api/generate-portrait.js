import { handleCors } from '../server-utils/cors.js';
import { setTimeout as delay } from 'node:timers/promises';
import { validText, generationDeadline, generationError } from '../server-utils/generation.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body || {};
    if (!validText(prompt, 8000)) {
      return res.status(400).json({ error: 'prompt must be a nonempty string of at most 8000 characters' });
    }
    const HIGGSFIELD_API_KEY_ID = process.env.HIGGSFIELD_API_KEY_ID;
    const HIGGSFIELD_API_KEY_SECRET = process.env.HIGGSFIELD_API_KEY_SECRET;

    if (!HIGGSFIELD_API_KEY_ID || !HIGGSFIELD_API_KEY_SECRET) {
      return res.status(500).json({
        error: 'Server configuration error: Missing HIGGSFIELD_API_KEY_ID or HIGGSFIELD_API_KEY_SECRET'
      });
    }

    const signal = generationDeadline();

    const payload = {
      prompt: `Generate a One Piece-inspired anime Wanted Poster character portrait. The image itself must contain ONLY the character artwork. Do not add poster text, bounty numbers, UI, borders, logos, watermarks, or typography. Character Description: ${prompt}`
    };

    const initialResponse = await fetch('https://api.higgsfield.ai/higgsfield-ai/soul/v2/standard', {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${HIGGSFIELD_API_KEY_ID}:${HIGGSFIELD_API_KEY_SECRET}`
      },
      body: JSON.stringify(payload)
    });

    const initialData = await initialResponse.json();

    if (!initialResponse.ok) {
      throw new Error('Provider rejected generation');
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
      await delay(2000, undefined, { signal });
      
      const statusResponse = await fetch(status_url, {
        signal,
        headers: {
          'Authorization': `Key ${HIGGSFIELD_API_KEY_ID}:${HIGGSFIELD_API_KEY_SECRET}`
        }
      });
      
      const statusData = await statusResponse.json();
      
      if (!statusResponse.ok) {
        throw new Error('Provider status check failed');
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
    return generationError(res, error);
  }
}
