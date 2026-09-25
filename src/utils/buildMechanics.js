import { PROGRESSION_CATEGORIES } from '../data/progression.js';

export const hasSelection = item => Boolean(item?.name && item.name !== 'None');
export const isMonkeyEnma = build => ['Monkey Enma', 'Monkey King Enma'].includes(build.summon?.name);
const isMythicEnma = build => build.summon?.name === 'Monkey King Enma';

// Only these named sources have explicit awakening mechanics. Unknown powers
// remain usable without letting a generic awakening roll invent new abilities.
const FRUIT_AWAKENINGS = {
    'Hito Hito: Nika': 'Rubberize nearby terrain through contact and use elastic environmental rebounds; no unrestricted reality rewriting.',
    'Ito Ito': 'Convert nearby nonliving terrain into controllable strings; no conversion of living opponents.',
    'Mochi Mochi': 'Convert nearby nonliving terrain into mochi for binding and attack angles; no automatic capture.'
};

export function awakeningTarget(build) {
    if (isMythicEnma(build)) return { id: 'summon', name: 'Monkey King Inheritance' };
    if (FRUIT_AWAKENINGS[build.df?.name]) return { id: 'df', name: build.df.name };
    return null;
}

export function progressionOptions(category, build) {
    if (category.id === 'summon_bond') return hasSelection(build.summon) ? category.options : [];
    if (category.id === 'awakening') {
        const target = awakeningTarget(build);
        return target ? category.options.map(option => ({ ...option, name: `${option.name} — ${target.name}`, target: target.id })) : [];
    }
    return category.options;
}

export function resolveBuildMechanics(build) {
    const target = awakeningTarget(build);
    const stage = target && build.awakening?.target === target.id ? Math.max(0, Math.min(4, build.awakening.stage ?? 0)) : 0;
    const abilities = [];
    const notes = [];
    const add = (name, desc) => abilities.push({ name, desc });
    for (const category of PROGRESSION_CATEGORIES) {
        const item = build[category.id];
        if (hasSelection(item)) notes.push(`${category.name}: ${item.name}${typeof item.val === 'number' ? ` (${item.val}/100)` : ''}. ${category.desc}.`);
    }
    notes.push('For mastery/control/endurance/bond rolls: 20 means brief or unreliable execution, 40 basic competence, 60 reliable technique, 80 advanced coordination, 95 exceptional precision, and 100 the best finite expression. Low bond means Enma assists reluctantly and sharing is brief, not that unlocked powers disappear. Weapon mastery never turns a staff into a sword.');
    if (isMonkeyEnma(build)) {
        add('Adamantine Partner', 'Monkey Enma transforms between an intelligent ally and an extending adamantine staff. Keep the rolled weapon as an alternative. Ally and staff are the same entity, never two independent combatants.');
        if ((build.weapon_mastery?.val ?? 0) >= 60) add('Staff Cage', 'Weapon Mastery enables precise extension and coordinated staff positioning to trap or deflect; the target must be caught within the formation.');
    }
    if (isMythicEnma(build)) {
        notes.push('Monkey King inheritance is an original crossover evolution, not a claim about Naruto canon. Enma the sword is unrelated. Awakening grants access; Weapon Mastery controls staff execution, Ability Mastery controls inherited powers, and Summon Bond controls coordination and the strength of sharing. Low rolls reduce reliability, not access.');
        if (stage >= 1) add('Ruyi Resonance', 'Briefly vary staff size and striking weight through Enma; stirring resonance is short and imprecise.');
        if (stage >= 2) add('Ruyi Jingu Bang', 'Deliberately resize the staff and shift its striking weight. Large extensions require space, chakra and physical control; this does not increase the wielder’s base strength.');
        if (stage >= 3) {
            add('Monkey King Mantle', 'Temporarily share Enma’s cloud-riding movement, hair-clone decoys and animal disguises. Clones share a finite energy budget and cannot duplicate other rolled powers; disguises do not copy abilities.');
        }
        if (stage >= 4) add('Great Sage Inheritance', 'Chain the unlocked staff, cloud, clone and disguise techniques in one integrated mantle. This improves transitions, not the set of powers. No immortality, infinite clones or automatic victory.');
        notes.push('Only the inheritance abilities explicitly listed below are active. Dormant inheritance leaves the base ally/staff available. Enma’s absence or a broken summon connection ends the shared mantle.');
    } else if (target?.id === 'df') {
        if (stage >= 2) add(stage === 2 ? 'Partial Fruit Awakening' : 'Fruit Awakening', `${FRUIT_AWAKENINGS[build.df.name]} ${stage === 2 ? 'Only brief, local manifestations are available.' : stage === 3 ? 'Active manifestations consume substantial stamina.' : 'Integrated control improves transitions but retains stamina costs.'}`);
        else notes.push('Fruit awakening is dormant or stirring: no additional awakening technique is active.');
    }
    notes.push('Mastery never grants unselected powers or replaces Haki/chakra prerequisites. Chakra Control governs efficiency, Chakra Reserves govern available chakra, Stamina governs sustained physical effort, and Durability governs damage resistance. None grants infinite energy. Ambition guides motives and techniques, never numerical power or a free ability. Missing progression rolls in legacy saves mean unspecified, not zero skill or free awakening.');
    return { abilities, notes, stage, target };
}

export function mechanicsBrief(build) {
    const { abilities, notes } = resolveBuildMechanics(build);
    return `RESOLVED BUILD RULES (authoritative):\n${notes.map(note => `- ${note}`).join('\n')}\nEXPLICIT ADDITIONAL ABILITIES:\n${abilities.length ? abilities.map(a => `- ${a.name}: ${a.desc}`).join('\n') : '- None. Use selected base abilities only.'}`;
}

// Small adjustments preserve the existing stat scale. Staff and rolled weapon
// contribute once, and missing progression fields leave legacy stats untouched.
export function progressionBonuses(build) {
    const result = { str: 0, spd: 0, dur: 0, iq: 0, haki: 0, chrk: 0, abl: 0, hax: 0, overall: 0 };
    const offset = id => hasSelection(build[id]) ? (build[id].val - 60) / 10 : 0;
    if ((hasSelection(build.weapon) && build.weapon.name !== 'Bare Fists') || isMonkeyEnma(build)) result.abl += offset('weapon_mastery');
    if (['df', 'dojutsu', 'trait', 'jutsu_nin', 'jutsu_gen', 'jutsu_sen', 'jutsu_kg', 'jutsu_kt'].some(id => hasSelection(build[id])) || hasSelection(build.summon)) result.abl += offset('ability_mastery');
    result.chrk += offset('chakra_control');
    result.overall += offset('stamina');
    if (hasSelection(build.summon)) result.abl += offset('summon_bond');
    result.hax += resolveBuildMechanics(build).stage * 2;
    return result;
}
