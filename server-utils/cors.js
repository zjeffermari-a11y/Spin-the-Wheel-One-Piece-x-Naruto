const allowedOrigins = new Set([
    'https://spin-the-wheel-one-piece-x-naruto.vercel.app',
    'http://tauri.localhost',
    'https://tauri.localhost',
    'tauri://localhost',
    'http://localhost:3000',
    'http://localhost:4173'
]);

// CORS controls browser access; it is not authentication or a usage quota.
export function handleCors(req, res) {
    res.setHeader('Vary', 'Origin');
    res.setHeader('Cache-Control', 'no-store');
    const origin = req.headers?.origin;
    if (origin && !allowedOrigins.has(origin)) {
        res.status(403).json({ error: 'Origin not allowed' });
        return true;
    }
    if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return true;
    }
    return false;
}
