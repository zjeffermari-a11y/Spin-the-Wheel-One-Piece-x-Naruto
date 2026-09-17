const fs = require('fs');
let code = fs.readFileSync('src/components/Wheel.jsx', 'utf8');

const target = `const fontSize = Math.max(8, Math.min(18, Math.floor(r * arc * 0.4)));
            // Hide text if extremely narrow to prevent complete black blur, or just draw it.
            if (options.length > 50) {
                // Too many, just don't draw text, or draw a tiny line
            }`;

const replacement = `const fontSize = Math.max(8, Math.min(18, Math.floor(r * arc * 0.4)));
            if (options.length > 25) {
               // Don't draw text if too crowded, rely on the HUD
               ctx.restore();
               currentAngle += arc;
               continue;
            }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/Wheel.jsx', code);
