import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import "dotenv/config";
import generatePortraitHandler from "./api/generate-portrait.js";
import generateLoreHandler from "./api/generate-lore.js";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Routes (using the exact same files as Vercel)
  app.post("/api/generate-portrait", generatePortraitHandler);
  app.post("/api/generate-lore", generateLoreHandler);

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
