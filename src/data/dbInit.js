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
    const opBenchmarks = ['haki_obs', 'haki_arm', 'haki_conq'];
    const narutoBenchmarks = ['jutsu_nin', 'jutsu_tai', 'jutsu_gen', 'jutsu_kg', 'jutsu_kt', 'jutsu_sen'];

    for (let cat of categories) {
        let pool = [];
        if (generalBenchmarks.includes(cat.id)) { 
            pool = shuffleArray([...characterPool]); 
        }
        else if (opBenchmarks.includes(cat.id)) { 
            pool = shuffleArray([...opData.filter(c => c.haki && c.haki.includes(cat.id.replace('haki_', '')))]); 
        }
        else if (narutoBenchmarks.includes(cat.id)) { 
            pool = shuffleArray([...narutoData.filter(c => c.jutsu && c.jutsu.includes(cat.id.replace('jutsu_', '')))]); 
        }
        else { 
            continue; 
        }

        if (['haki_conq', 'jutsu_kt', 'jutsu_kg', 'jutsu_sen'].includes(cat.id)) { 
            pool.unshift({ name: 'None', rarity: 'C', val: 0 }); 
        }
        cat.options = pool.slice(0, 20);
    }

    return categories;
}
