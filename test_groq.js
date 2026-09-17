const apiKey = process.env.VITE_GROQ_API_KEY;
fetch('https://api.groq.com/openai/v1/models', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
}).then(r => r.json()).then(d => {
    console.log(d.data.map(m => m.id));
}).catch(console.error);
