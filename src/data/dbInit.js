import { opData } from './opData.js';
import { narutoData } from './narutoData.js';
import { CATEGORIES } from './categories.js';
import { ninjutsuData } from './ninjutsuData.js';
import { taijutsuData } from './taijutsuData.js';
import { genjutsuData } from './genjutsuData.js';
import { kekkeiGenkaiData, kekkeiTotaData } from './kekkeiData.js';
import { senjutsuData } from './senjutsuData.js';

function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

// Ability data mapping — canonical technique pools per category
const ABILITY_POOLS = {
    jutsu_nin: ninjutsuData,
    jutsu_tai: taijutsuData,
    jutsu_gen: genjutsuData,
    jutsu_kg: kekkeiGenkaiData,
    jutsu_kt: kekkeiTotaData,
    jutsu_sen: senjutsuData,
};

const POOL_SIZE = 50;

export function initDatabases() {
    // Deep clone the categories so we don't mutate the imported constant
    const categories = JSON.parse(JSON.stringify(CATEGORIES));
    const characterPool = [...opData, ...narutoData];
    
    const characterBenchmarks = ['vessel', 'iq'];
    const hakiBenchmarks = ['haki_obs', 'haki_arm', 'haki_conq'];
    const abilityBenchmarks = Object.keys(ABILITY_POOLS);

    for (let cat of categories) {
        let pool = [];

        // Character benchmarks — use character pool
        if (characterBenchmarks.includes(cat.id)) { 
            pool = shuffleArray([...characterPool]); 
        }
        // Haki benchmarks — filter OP characters who have that haki type, keep canonical
        else if (hakiBenchmarks.includes(cat.id)) { 
            pool = shuffleArray([...opData.filter(c => c.haki && c.haki.includes(cat.id.replace('haki_', '')))]); 
        }
        // Ability benchmarks — use dedicated canonical technique pools
        else if (abilityBenchmarks.includes(cat.id)) {
            pool = shuffleArray([...ABILITY_POOLS[cat.id]]);
        }
        else { 
            continue; // Categories with hardcoded options (race, origin, etc.)
        }

        cat.options = pool.slice(0, POOL_SIZE);
    }

    return categories;
}
