import { resolveBuildMechanics, hasSelection } from './buildMechanics.js';
import { calculateSynergies } from './gameLogic.js';
import { getLoreCapsule } from '../data/loreCodex.js';

export function generateLocalLore(build) {
    const signature = Object.keys(build).sort().map(key => `${key}:${build[key]?.name || ''}`).join('|');
    let seed = 0;
    for (const char of signature) seed = (Math.imul(seed, 31) + char.charCodeAt(0)) >>> 0;
    const name = ['Aren', 'Kairo', 'Renka', 'Sora', 'Mira', 'Taren', 'Akira', 'Neri'][seed % 8] + ' ' + ['Vale', 'Ash', 'Reef', 'Dawn', 'Reed', 'Crest', 'Stone', 'Flint'][(seed >>> 8) % 8];
    const selected = (key, fallback) => hasSelection(build[key]) ? build[key].name : fallback;
    const resolved = resolveBuildMechanics(build);
    const sourceKey = ['df', 'jutsu_nin', 'dojutsu', 'jutsu_tai', 'weapon'].find(key => hasSelection(build[key]) && getLoreCapsule(key, build[key].name));
    const source = sourceKey ? build[sourceKey].name : selected('style', 'basic close combat');
    const capsule = source === 'Hito Hito: Nika'
        ? 'Use the selected fruit’s rubber body for elastic strikes; environmental awakening is available only through the explicit unlocked abilities.'
        : sourceKey ? getLoreCapsule(sourceKey, source) : 'Use ordinary positioning and physical strikes; no additional supernatural technique is granted.';
    const mastery = selected('ability_mastery', 'unspecified');
    const stamina = selected('stamina', 'unspecified');
    const control = selected('chakra_control', 'unspecified');
    const armament = selected('weapon', 'unarmed combat');
    const lastUnlock = resolved.abilities.at(-1);
    const synergy = calculateSynergies(build).list.find(item => ['One Staff, Two Minds', 'Trusted Partnership', 'Measured Release', 'Coated Precision', 'Awakened Expression'].includes(item.name));
    return {
        generation_source: 'local',
        name,
        epithet: `${selected('origin', 'Unknown Shores')} — ${selected('ambition', 'A Path Still Unwritten')}`,
        bio: `${name} comes from ${selected('origin', 'an unrecorded homeland')}, with ${selected('race', 'an unspecified race')} heritage and allegiance to ${selected('faction', 'no faction')}. The character combines ${selected('style', 'basic fighting instincts')} with ${armament}, guided by ${selected('combat', 'unspecified')} combat mastery. ${name} pursues the ambition “${selected('ambition', 'choose a purpose beyond survival')}” through the powers actually selected in this build. ${hasSelection(build.summon) ? `The bond with ${build.summon.name} is ${selected('summon_bond', 'unspecified')}, while awakening remains ${selected('awakening', 'unselected')}` : 'Every victory depends on the available techniques and careful positioning'}.`,
        custom_synergy: synergy ? { ...synergy, bonuses: {} } : null,
        signature_abilities: [
            { name: `${source}: Opening Pressure`, desc: `${name} uses ${source} to test an opening before committing. ${capsule} Execution follows ${mastery} Ability Mastery; the source’s conditions and energy costs still apply.` },
            { name: 'Measured Reposition', desc: `${name} uses ordinary footwork to disengage after an exchange, then resets for ${selected('style', 'close combat')}. This grants no flight, teleportation or immunity. Sustained movement follows ${stamina} Stamina; any selected chakra technique still uses its own reserves with ${control} Chakra Control.` },
            { name: lastUnlock ? `${lastUnlock.name}: Decisive Sequence` : `${armament}: Decisive Commitment`, desc: lastUnlock ? `${lastUnlock.desc} ${name} commits this unlocked technique after an opening; execution follows the selected mastery and bond, with finite stamina and chakra.` : `${name} commits a timed ${armament} attack after creating an opening. Precision follows ${selected('weapon_mastery', 'unspecified')} Weapon Mastery and selected Combat Mastery; the move grants no new weapon effect, Haki or awakening and spends physical effort.` }
        ]
    };
}

export function isUsableLore(value) {
    return Boolean(value && typeof value.name === 'string' && value.name.trim() && typeof value.bio === 'string' && value.bio.trim() && Array.isArray(value.signature_abilities) && value.signature_abilities.length === 3 && value.signature_abilities.every(a => typeof a?.name === 'string' && typeof a?.desc === 'string' && a.name.trim() && a.desc.trim()));
}

export async function generateCharacterContent({ build, mode = 'local', online = true, generateLore, generatePortrait }) {
    const fallback = generateLocalLore(build);
    if (mode === 'local' || !online) return { lore: fallback, portraitUrl: null, notice: mode === 'local' ? 'Created on this device using templates.' : 'You are offline. Created on this device using templates.' };
    const [loreResult, portraitResult] = await Promise.allSettled([
        Promise.resolve().then(generateLore), Promise.resolve().then(generatePortrait)
    ]);
    const validLore = loreResult.status === 'fulfilled' && isUsableLore(loreResult.value);
    const portraitUrl = portraitResult.status === 'fulfilled' && typeof portraitResult.value?.url === 'string' && /^https?:\/\//.test(portraitResult.value.url) ? portraitResult.value.url : null;
    return {
        lore: validLore ? { ...loreResult.value, generation_source: 'ai' } : fallback,
        portraitUrl,
        notice: [validLore ? 'AI lore generated.' : 'AI lore was unavailable. Your character uses local templates.', portraitUrl ? '' : 'Portrait unavailable; your character is ready to save.'].filter(Boolean).join(' ')
    };
}
