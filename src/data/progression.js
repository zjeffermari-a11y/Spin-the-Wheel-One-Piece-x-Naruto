const tiers = (names) => names.map((name, i) => ({ name, rarity: ['C', 'U', 'R', 'E', 'L', 'M'][i], val: [20, 40, 60, 80, 95, 100][i] }));

export const PROGRESSION_CATEGORIES = [
    { id: 'weapon_mastery', name: 'Weapon Mastery', desc: 'Precision and technique with your available armaments', options: tiers(['Novice', 'Trained', 'Master', 'Legendary', 'Unrivaled', 'Weapon Sovereign']) },
    { id: 'ability_mastery', name: 'Ability Mastery', desc: 'Control and creative application of selected powers', options: tiers(['Unstable', 'Practiced', 'Adept', 'Expert', 'Perfected', 'Transcendent']) },
    { id: 'chakra_control', name: 'Chakra Control', desc: 'Chakra efficiency and precision, independent of reserves', options: tiers(['Wasteful', 'Steady', 'Efficient', 'Precise', 'Surgical', 'Perfect']) },
    { id: 'stamina', name: 'Stamina', desc: 'How long you can sustain physical effort', options: tiers(['Brief Burst', 'Conditioned', 'Veteran Endurance', 'Tireless', 'Monstrous', 'Mythic Endurance']) },
    { id: 'summon_bond', name: 'Summon Bond', desc: 'Trust and coordination with your summoned partner', options: tiers(['Reluctant', 'Cooperative', 'Trusted', 'Synchronized', 'Soulbound', 'One Will']), isDynamic: true, parentCatId: 'summon' },
    { id: 'awakening', name: 'Awakening State', desc: 'Active evolution of one eligible selected power', options: ['Dormant', 'Stirring', 'Partial', 'Awakened', 'Fully Integrated'].map((name, stage) => ({ name, stage, rarity: ['C', 'U', 'R', 'L', 'M'][stage], val: stage * 25 })), isDynamic: true },
    { id: 'ambition', name: 'Ambition', desc: 'The purpose behind your power', options: ['Protect My Homeland', 'Find Absolute Freedom', 'Uncover the Lost History', 'Unite Divided Peoples', 'Become Pirate King', 'Become Hokage', 'Master Every Chosen Art', 'Surpass the Gods'].map(name => ({ name, rarity: 'C' })) }
];

export const PROGRESSION_IDS = PROGRESSION_CATEGORIES.map(category => category.id);
