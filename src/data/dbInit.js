import { opData } from './opData.js';
import { narutoData } from './narutoData.js';
import { CATEGORIES } from './categories.js';

function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

export function initDatabases() {
    // Deep clone the categories so we don't mutate the imported constant
    const categories = JSON.parse(JSON.stringify(CATEGORIES));
    const characterPool = [...opData, ...narutoData];
    
    const generalBenchmarks = ['vessel', 'iq'];

    for (let cat of categories) {
        let pool = [];
        
        if (generalBenchmarks.includes(cat.id)) { 
            pool = shuffleArray([...characterPool]); 
            cat.options = pool.slice(0, 50); // Cut to 50 slices as requested? Or just use all. Let's just use 50 so it's not too crowded on the wheel.
        } else {
            // Use the hardcoded options defined in categories.js directly (which are already canon hax/abilities)
            // But we can shuffle them if we want? No, let's just leave them as they are, or shuffle them.
            // Actually, we'll shuffle them to make the wheel look random!
            if (cat.options && Array.isArray(cat.options)) {
                // Keep 'None' at the top if it exists, or just shuffle everything
                let options = [...cat.options];
                // For the wheel, order doesn't matter, it's just visual.
                // But wait, the categories.js has them sorted by rarity usually. 
                // Let's just leave them as they are! The Wheel component handles the display.
            }
        }
    }

    return categories;
}