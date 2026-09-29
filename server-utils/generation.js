export function validText(value, limit = 32000) {
    return typeof value === 'string' && value.trim().length > 0 && value.length <= limit;
}

// A single deadline covers submission, polling and response-body reads.
export function generationDeadline(milliseconds = 55000) {
    return AbortSignal.timeout(milliseconds);
}

export function generationError(res, error) {
    const timeout = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    // Never log provider bodies, prompts, URLs or credentials.
    console.error('Generation request failed', { category: timeout ? 'timeout' : 'upstream' });
    return res.status(timeout ? 504 : 502).json({
        error: timeout ? 'Generation timed out' : 'Generation service unavailable'
    });
}
