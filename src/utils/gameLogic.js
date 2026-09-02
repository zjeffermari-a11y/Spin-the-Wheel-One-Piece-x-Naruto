export function calculateSynergies(build) {
    const syns = [];
    let bonuses = { str: 0, spd: 0, dur: 0, iq: 0, haki: 0, chrk: 0, abl: 0, hax: 0, overall: 0 };
    const getVal = (cat) => build[cat] ? build[cat].name : '';
    const getTag = (cat) => build[cat] ? build[cat].tag : '';

    const vessel = getVal('vessel');
    const race = getVal('race');
    const df = getVal('df');
    const dfType = getVal('df_type');
    const dfTag = getTag('df');
    const dojutsu = getVal('dojutsu');
    const trait = getVal('trait');
    const traitTag = getTag('trait');
    const style = getVal('style');
    const ninTag = getTag('jutsu_nin');

    if (df !== 'None' && race === 'Fish-Man') { syns.push({ name: '🚫 CURSED FISH-MAN', desc: 'A Fish-Man that cannot swim. Tragic.' }); bonuses.dur -= 10; bonuses.overall -= 2; }
    if (dojutsu === 'Rinnegan' && getVal('jutsu_sen')) { syns.push({ name: '🌟 SIX PATHS', desc: 'Approaching godhood.' }); bonuses.overall += 15; }
    if (style === 'Swordsmanship' && build.weapon?.name === 'Bare Fists') { syns.push({ name: '❓ CONFUSED SWORDSMAN', desc: 'A swordsman without a sword.' }); bonuses.iq -= 10; bonuses.str -= 5; }
    if (dfType === 'Logia' && build.dur?.val >= 80) { syns.push({ name: '👻 INTANGIBLE BODY', desc: 'Logia intangibility with natural toughness.' }); bonuses.dur += 12; bonuses.hax += 8; }
    if (dfType === 'Mythical Zoan' && build.haki_conq?.val >= 70) { syns.push({ name: '👑 DIVINE BEAST', desc: 'A mythical creature backed by the will of a king.' }); bonuses.str += 10; bonuses.overall += 10; }
    if (dfType === 'Ancient Zoan' && build.str?.val >= 80) { syns.push({ name: '🦖 PREHISTORIC POWER', desc: 'Ancient beast strength meets raw physical prowess.' }); bonuses.str += 15; bonuses.dur += 10; }
    if (dfType === 'Logia' && race === 'Lunarian') { syns.push({ name: '🔥 ELEMENTAL GOD', desc: 'A Lunarian wielding elemental intangibility.' }); bonuses.abl += 15; bonuses.dur += 10; bonuses.overall += 5; }
    if ((dfType === 'Zoan' || dfType === 'Ancient Zoan') && style === 'Taijutsu Specialist') { syns.push({ name: '🐾 FERAL FIGHTER', desc: 'Zoan transformation with martial arts mastery.' }); bonuses.str += 8; bonuses.spd += 8; }
    if ((dojutsu === 'Rinnegan' || dojutsu === 'Tenseigan') && trait === 'Six Paths Body') { syns.push({ name: '🧿 TRUE SIX PATHS', desc: 'The eyes and body of a god.' }); bonuses.overall += 20; bonuses.hax += 15; }
    if (traitTag === 'tech' && (dfTag === 'lightning' || ninTag === 'lightning')) { syns.push({ name: '⚡ OVERCHARGED', desc: 'Using electricity to supercharge cybernetics.' }); bonuses.spd += 10; bonuses.abl += 10; }
    if ((trait === 'Uzumaki Lineage' || trait === 'Senju Lineage') && build.dur?.val >= 80) { syns.push({ name: '❤️ IMMENSE VITALITY', desc: 'Legendary life force and stamina.' }); bonuses.chrk += 15; bonuses.dur += 10; }
    if (vessel === 'Shanks' && build.haki_conq?.val >= 90) { syns.push({ name: '🔴 RED HAIR\'S WILL', desc: 'Shanks\' body combined with supreme Conqueror\'s Haki.' }); bonuses.haki += 15; bonuses.overall += 5; }
    if (vessel === 'Naruto Uzumaki' && build.jinchuriki_beast?.name === 'Kurama (9-Tails)') { syns.push({ name: '🦊 PERFECT JINCHURIKI', desc: 'Naruto\'s vessel paired with immense tailed beast chakra.' }); bonuses.chrk += 20; bonuses.abl += 10; }

    if (vessel === 'Saitama' && style === 'Taijutsu Specialist') { syns.push({ name: '👊 ONE PUNCH POTENTIAL', desc: "Saitama's body combined with martial arts mastery." }); bonuses.str += 25; bonuses.spd += 15; bonuses.overall += 10; }
    if (vessel === 'Goku' && trait === 'Saiyan Blood') { syns.push({ name: '💥 TRUE SAIYAN', desc: "Goku's vessel with the authentic Saiyan bloodline." }); bonuses.str += 15; bonuses.dur += 15; bonuses.overall += 10; }
    if (vessel === 'Toji Fushiguro' && trait === 'Heavenly Restriction') { syns.push({ name: '🔪 SORCERER KILLER', desc: 'The ultimate anti-magic physical build.' }); bonuses.str += 20; bonuses.spd += 20; bonuses.abl -= 20; bonuses.hax += 10; }
    if (trait === 'Immortality' && build.dur?.val >= 90) { syns.push({ name: '🛡️ ABSOLUTE DEFENSE', desc: 'Immortal and naturally impenetrable.' }); bonuses.dur += 25; bonuses.hax += 15; }
    if (trait === 'Six Paths Body' && vessel === 'Madara Uchiha') { syns.push({ name: '👻 GHOST OF THE UCHIHA', desc: "Madara's body pushed to the absolute pinnacle." }); bonuses.chrk += 15; bonuses.hax += 10; bonuses.overall += 10; }

    return { list: syns, bonuses };
}
