import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import "dotenv/config";
import generatePortraitHandler from "./api/generate-portrait.js";
import generateLoreHandler from "./api/generate-lore.js";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
  app.use(express.json({ limit: "256kb" }));

  // API Routes (using the exact same files as Vercel)
  app.all("/api/generate-portrait", generatePortraitHandler);
  app.all("/api/generate-lore", generateLoreHandler);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { setHeaders(res, filePath) { if (filePath.endsWith('sw.js')) res.setHeader('Cache-Control', 'no-cache'); } }));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = error?.type === 'entity.too.large' ? 413 : error?.type === 'entity.parse.failed' ? 400 : 500;
    res.status(status).json({ error: status === 413 ? 'Request too large' : status === 400 ? 'Invalid JSON' : 'Internal server error' });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
