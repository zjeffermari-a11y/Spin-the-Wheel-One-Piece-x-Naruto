const fs = require('fs');
let code = fs.readFileSync('src/utils/OllamaService.js', 'utf8');

const target = `const FALLBACK_MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.6-27b', 'qwen/qwen3.8-27b'];`;
const replacement = `const FALLBACK_MODELS = [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant',
    'llama3-70b-8192',
    'llama3-8b-8192',
    'mixtral-8x7b-32768',
    'openai/gpt-oss-120b', 
    'openai/gpt-oss-20b', 
    'qwen/qwen3.8-27b'
];`;

code = code.replace(target, replacement);

const targetPriority = `const priority = ['120b', '70b', '27b', '20b', '8b'];`;
const replacementPriority = `const priority = ['70b', '120b', '27b', '20b', '8b'];`;

code = code.replace(targetPriority, replacementPriority);

fs.writeFileSync('src/utils/OllamaService.js', code);
