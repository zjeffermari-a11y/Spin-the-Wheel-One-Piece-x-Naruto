import { calculateSynergies } from './gameLogic.js';
import { PROGRESSION_IDS } from '../data/progression.js';

export function calculateBuildStats(finalBuild) {
    const getVal = (catId) => finalBuild[catId] ? (finalBuild[catId].val || 50) : 50;

    // Calculate synergies
    const hardcoded = calculateSynergies(finalBuild);
    const synergyStats = { str: 0, spd: 0, dur: 0, iq: 0, haki: 0, pwr: 0, hax: 0 };
    let overallMultiplier = 1.0;

    ['str', 'spd', 'dur', 'iq', 'haki'].forEach(s => { synergyStats[s] += (hardcoded.bonuses[s] || 0); });
    synergyStats.pwr += ((hardcoded.bonuses.chrk || 0) + (hardcoded.bonuses.abl || 0));
    synergyStats.hax += (hardcoded.bonuses.hax || 0);
    overallMultiplier += ((hardcoded.bonuses.overall || 0) / 100);

    // Calculate final stats using the original formula
    const chrk = ((getVal('jutsu_nin') + getVal('jutsu_gen') + getVal('jutsu_sen')) / 3);
    const abl = Math.max(getVal('df'), getVal('dojutsu'), getVal('jutsu_kg'), getVal('jutsu_kt'));
    let baseHax = 0;
    for (const key in finalBuild) {
        const item = finalBuild[key];
        if (!item || item.name === 'None' || PROGRESSION_IDS.includes(key) || item.name === 'Monkey King Enma') continue;
        
        if (item.tag === 'hax') {
            baseHax += 30;
        } else if (item.val >= 100) {
            baseHax += 20;
        } else if (item.val >= 95) {
            baseHax += 10;
        }
    }
    const hax = baseHax;
    const finalStats = {
        str: getVal('str') + (finalBuild.race?.baseStats ? (finalBuild.race.baseStats.str - 50) * 0.5 : 0) + synergyStats.str,
        spd: getVal('spd') + (finalBuild.race?.baseStats ? (finalBuild.race.baseStats.spd - 50) * 0.5 : 0) + (getVal('jutsu_tai') * 0.2) + synergyStats.spd,
        dur: getVal('dur') + (finalBuild.race?.baseStats ? (finalBuild.race.baseStats.dur - 50) * 0.5 : 0) + (getVal('jutsu_tai') * 0.2) + synergyStats.dur,
        iq: getVal('iq') + synergyStats.iq,
        haki: (getVal('haki_obs') * 0.4 + getVal('haki_arm') * 0.4 + getVal('haki_conq') * 0.6) + synergyStats.haki,
        pwr: ((chrk + abl) / 1.5) + synergyStats.pwr,
        hax: hax + synergyStats.hax
    };
    for (let k in finalStats) finalStats[k] = Math.min(100, Math.max(0, finalStats[k]));

    const potMult = finalBuild.potential ? finalBuild.potential.val : 1.0;
    const avg = Object.values(finalStats).reduce((a, b) => a + b, 0) / 7;
    const overallPower = Math.min(100, Math.max(0, (avg * potMult) * overallMultiplier));

    return { stats: finalStats, overall: overallPower, synergies: hardcoded.list };
}
