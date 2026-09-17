import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json({ limit: "10mb" }));

  // AI Route using Groq
  app.post("/api/generate-lore", async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      
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
      
      res.json(JSON.parse(content));
    } catch (error) {
      console.error("AI Generation error:", error);
      res.status(500).json({ error: "Failed to generate lore" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
