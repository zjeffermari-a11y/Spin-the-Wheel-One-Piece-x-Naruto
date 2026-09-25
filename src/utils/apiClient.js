// Public configuration only. Provider credentials belong on the server.
const baseUrl = (import.meta.env?.VITE_API_BASE_URL || '').replace(/\/$/, '');

export async function postApi(path, body, { timeoutMs = 65000 } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(`${baseUrl}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal
        });
        if (!response.ok) throw new Error(`Generation service returned ${response.status}`);
        return await response.json();
    } finally {
        clearTimeout(timer);
    }
}
