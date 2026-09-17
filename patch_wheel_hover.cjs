const fs = require('fs');
let code = fs.readFileSync('src/components/Wheel.jsx', 'utf8');

// We need to add onCurrentOptionChange prop
const compStartTarget = `const Wheel = forwardRef(({ options, onTick }, ref) => {`;
const compStartReplacement = `const Wheel = forwardRef(({ options, onTick, onCurrentOptionChange }, ref) => {`;
code = code.replace(compStartTarget, compStartReplacement);

const trackTicksTarget = `                        const prevSegmentCount = Math.floor(prevRot / segmentAngle);
                        const newSegmentCount = Math.floor(accumulatedAngle / segmentAngle);
                        
                        if (prevSegmentCount !== newSegmentCount) {
                            if (onTick) onTick();
                        }`;

const trackTicksReplacement = `                        const prevSegmentCount = Math.floor(prevRot / segmentAngle);
                        const newSegmentCount = Math.floor(accumulatedAngle / segmentAngle);
                        
                        if (prevSegmentCount !== newSegmentCount) {
                            if (onTick) onTick();
                        }
                        
                        // Calculate currently hovered option based on targetAngle logic
                        // The wheel is at 'currentAngle'. The pointer is at -PI/2.
                        // So the active segment is determined by where -PI/2 falls.
                        // Wait, it's easier: accumulatedAngle modulo 2PI.
                        let normalizedRot = accumulatedAngle % (Math.PI * 2);
                        if (normalizedRot < 0) normalizedRot += Math.PI * 2;
                        
                        // The 0-index slice starts at 0 and goes to segmentAngle.
                        // But the wheel is rotated by normalizedRot. So the slice at top-center (-PI/2) is:
                        // -PI/2 - normalizedRot
                        let topAngle = -Math.PI / 2 - normalizedRot;
                        if (topAngle < 0) topAngle += Math.PI * 2;
                        
                        let hoveredIndex = Math.floor(topAngle / segmentAngle) % options.length;
                        if (hoveredIndex < 0) hoveredIndex += options.length;
                        if (onCurrentOptionChange) {
                           onCurrentOptionChange(options[hoveredIndex]);
                        }`;

code = code.replace(trackTicksTarget, trackTicksReplacement);

// Also we should only draw text if options.length < 25, otherwise it's just colors, or draw it tiny.
// "I know it can be really hard to read. But there's an option to it." - User means it's fine if it's hard to read, we should just let it be. But maybe we make the font size smaller.
const fontSizeTarget = `const fontSize = Math.max(10, Math.min(18, Math.floor(r * arc * 0.4)));`;
const fontSizeReplacement = `const fontSize = Math.max(8, Math.min(18, Math.floor(r * arc * 0.4)));
            // Hide text if extremely narrow to prevent complete black blur, or just draw it.
            if (options.length > 50) {
                // Too many, just don't draw text, or draw a tiny line
            }`;

code = code.replace(fontSizeTarget, fontSizeReplacement);

fs.writeFileSync('src/components/Wheel.jsx', code);
