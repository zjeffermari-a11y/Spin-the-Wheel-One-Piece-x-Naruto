require('dotenv').config();
const apiKey = process.env.VITE_GROQ_API_KEY;
fetch('https://api.groq.com/openai/v1/models', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
}).then(r => r.json()).then(d => {
    console.log(d);
}).catch(console.error);
