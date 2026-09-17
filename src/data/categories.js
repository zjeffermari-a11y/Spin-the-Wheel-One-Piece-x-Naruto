
export const strengthTiers = [
    { name: 'Average Human', rarity: 'C', val: 10 },
    { name: 'Athletic', rarity: 'C', val: 20 },
    { name: 'Peak Human', rarity: 'C', val: 30 },
    { name: 'Superhuman (Low)', rarity: 'U', val: 40 },
    { name: 'Superhuman (Mid)', rarity: 'U', val: 50 },
    { name: 'Superhuman (High)', rarity: 'U', val: 60 },
    { name: 'Building Level', rarity: 'R', val: 70 },
    { name: 'City Block Level', rarity: 'R', val: 75 },
    { name: 'Town Level', rarity: 'R', val: 80 },
    { name: 'City Level', rarity: 'E', val: 85 },
    { name: 'Mountain Level', rarity: 'E', val: 90 },
    { name: 'Island Level', rarity: 'E', val: 95 },
    { name: 'Country Level', rarity: 'L', val: 97 },
    { name: 'Continental Level', rarity: 'L', val: 98 },
    { name: 'Planetary Level', rarity: 'M', val: 100 }
];

export const speedTiers = [
    { name: 'Average Human', rarity: 'C', val: 10 },
    { name: 'Athletic', rarity: 'C', val: 20 },
    { name: 'Peak Human', rarity: 'C', val: 30 },
    { name: 'Superhuman', rarity: 'U', val: 40 },
    { name: 'Subsonic', rarity: 'U', val: 50 },
    { name: 'Transonic', rarity: 'U', val: 60 },
    { name: 'Supersonic', rarity: 'R', val: 70 },
    { name: 'Hypersonic', rarity: 'R', val: 75 },
    { name: 'High Hypersonic', rarity: 'R', val: 80 },
    { name: 'Massively Hypersonic', rarity: 'E', val: 85 },
    { name: 'Sub-Relativistic', rarity: 'E', val: 90 },
    { name: 'Relativistic', rarity: 'E', val: 95 },
    { name: 'Speed of Light', rarity: 'L', val: 98 },
    { name: 'Faster Than Light (FTL)', rarity: 'M', val: 100 },
    { name: 'Infinite', rarity: 'M', val: 105 }
];

export const durabilityTiers = [
    { name: 'Average Human', rarity: 'C', val: 10 },
    { name: 'Athletic', rarity: 'C', val: 20 },
    { name: 'Peak Human', rarity: 'C', val: 30 },
    { name: 'Wall Level', rarity: 'U', val: 40 },
    { name: 'Room Level', rarity: 'U', val: 50 },
    { name: 'Building Level', rarity: 'U', val: 60 },
    { name: 'City Block Level', rarity: 'R', val: 70 },
    { name: 'Town Level', rarity: 'R', val: 75 },
    { name: 'City Level', rarity: 'R', val: 80 },
    { name: 'Mountain Level', rarity: 'E', val: 85 },
    { name: 'Island Level', rarity: 'E', val: 90 },
    { name: 'Country Level', rarity: 'L', val: 95 },
    { name: 'Continental Level', rarity: 'L', val: 98 },
    { name: 'Planetary Level', rarity: 'M', val: 100 },
    { name: 'Absolute Immunity', rarity: 'M', val: 105 }
];

export const combatTiers = [
    { name: 'Civilian', rarity: 'C', val: 10 },
    { name: 'Brawler', rarity: 'C', val: 20 },
    { name: 'Trained Fighter', rarity: 'C', val: 30 },
    { name: 'Martial Artist', rarity: 'U', val: 40 },
    { name: 'Veteran Soldier', rarity: 'U', val: 50 },
    { name: 'Elite Assassin', rarity: 'U', val: 60 },
    { name: 'Master', rarity: 'R', val: 70 },
    { name: 'Grandmaster', rarity: 'R', val: 80 },
    { name: 'Legendary', rarity: 'E', val: 90 },
    { name: 'Unrivaled', rarity: 'L', val: 98 },
    { name: 'God of War', rarity: 'M', val: 100 }
];

export const chakraTiers = [
    { name: 'Civilian', rarity: 'C', val: 10 },
    { name: 'Genin Level', rarity: 'C', val: 25 },
    { name: 'Chunin Level', rarity: 'C', val: 40 },
    { name: 'Jonin Level', rarity: 'U', val: 60 },
    { name: 'Anbu Captain', rarity: 'U', val: 70 },
    { name: 'Kage Level', rarity: 'R', val: 80 },
    { name: 'Bijuu (Tailed Beast) Level', rarity: 'E', val: 90 },
    { name: 'Senju Level', rarity: 'E', val: 95 },
    { name: 'Six Paths Level', rarity: 'L', val: 98 },
    { name: 'Infinite / Otsutsuki', rarity: 'M', val: 100 }
];

// Expanded Canonical Abilities!
const ninjutsuOptions = [
    { name: 'None', rarity: 'C', val: 0 },
    { name: 'Clone Jutsu', rarity: 'C', val: 10 },
    { name: 'Transformation Jutsu', rarity: 'C', val: 10 },
    { name: 'Body Replacement', rarity: 'C', val: 15 },
    { name: 'Fireball Jutsu', rarity: 'U', val: 40 },
    { name: 'Water Dragon Jutsu', rarity: 'U', val: 50 },
    { name: 'Mud Wall', rarity: 'U', val: 45 },
    { name: 'Shadow Clone Jutsu', rarity: 'U', val: 60 },
    { name: 'Chidori', rarity: 'R', val: 75 },
    { name: 'Rasengan', rarity: 'R', val: 75 },
    { name: 'Purple Electricity', rarity: 'R', val: 78 },
    { name: 'Wind Style: Rasenshuriken', rarity: 'E', val: 88, tag: 'hax' },
    { name: 'Hiraishin', rarity: 'E', val: 92, tag: 'hax' },
    { name: 'Edo Tensei', rarity: 'E', val: 95, tag: 'hax' },
    { name: 'Reaper Death Seal', rarity: 'E', val: 90 },
    { name: 'Tengai Shinsei', rarity: 'L', val: 98 },
    { name: "Indra's Arrow", rarity: 'L', val: 100 },
    { name: 'Six Paths: Ultra-Big Ball Rasenshuriken', rarity: 'M', val: 100 }
];

const taijutsuOptions = [
    { name: 'None', rarity: 'C', val: 0 },
    { name: 'Leaf Whirlwind', rarity: 'C', val: 20 },
    { name: 'Lion Combo', rarity: 'C', val: 30 },
    { name: 'Primary Lotus', rarity: 'U', val: 50 },
    { name: 'Hidden Lotus', rarity: 'U', val: 60 },
    { name: 'Cherry Blossom Impact', rarity: 'U', val: 65 },
    { name: 'Heavenly Foot of Pain', rarity: 'R', val: 75 },
    { name: 'Eight Trigrams 64 Palms', rarity: 'R', val: 80 },
    { name: 'Eight Trigrams 128 Palms', rarity: 'E', val: 85 },
    { name: 'Morning Peacock', rarity: 'E', val: 88 },
    { name: 'Daytime Tiger', rarity: 'E', val: 92 },
    { name: 'Evening Elephant', rarity: 'L', val: 96 },
    { name: 'Night Guy', rarity: 'M', val: 100, tag: 'hax' }
];

const genjutsuOptions = [
    { name: 'None', rarity: 'C', val: 0 },
    { name: 'Demonic Illusion: Hell Viewing', rarity: 'C', val: 30 },
    { name: 'Temple of Nirvana', rarity: 'U', val: 50 },
    { name: 'Bringer-of-Darkness', rarity: 'R', val: 70 },
    { name: 'Ephemera', rarity: 'R', val: 75 },
    { name: 'Tsukuyomi', rarity: 'E', val: 90, tag: 'hax' },
    { name: 'Kotoamatsukami', rarity: 'E', val: 95, tag: 'hax' },
    { name: 'Izanagi', rarity: 'L', val: 98, tag: 'hax' },
    { name: 'Izanami', rarity: 'L', val: 98, tag: 'hax' },
    { name: 'Infinite Tsukuyomi', rarity: 'M', val: 105, tag: 'hax' }
];

const kekkeiGenkaiOptions = [
    { name: 'None', rarity: 'C', val: 0 },
    { name: 'Ice Release', rarity: 'U', val: 60 },
    { name: 'Boil Release', rarity: 'U', val: 65 },
    { name: 'Lava Release', rarity: 'R', val: 75 },
    { name: 'Scorch Release', rarity: 'R', val: 75 },
    { name: 'Magnet Release', rarity: 'R', val: 78 },
    { name: 'Explosion Release', rarity: 'R', val: 80 },
    { name: 'Storm Release', rarity: 'E', val: 85 },
    { name: 'Dead Bone Pulse (Shikotsumyaku)', rarity: 'E', val: 88 },
    { name: 'Wood Release', rarity: 'L', val: 98 },
    { name: 'Rinne-Sharingan', rarity: 'M', val: 100, tag: 'hax' }
];

const kekkeiTotaOptions = [
    { name: 'None', rarity: 'C', val: 0 },
    { name: 'Particle Style: Dismantling Jutsu', rarity: 'L', val: 95, tag: 'hax' }
];

const senjutsuOptions = [
    { name: 'None', rarity: 'C', val: 0 },
    { name: 'Curse Mark (Level 1)', rarity: 'U', val: 50 },
    { name: 'Curse Mark (Level 2)', rarity: 'R', val: 70 },
    { name: 'Imperfect Toad Sage Mode', rarity: 'R', val: 75 },
    { name: 'Toad Sage Mode', rarity: 'E', val: 88 },
    { name: 'Snake Sage Mode', rarity: 'E', val: 88 },
    { name: 'Slug Sage Mode', rarity: 'E', val: 88 },
    { name: 'Wood Sage Mode', rarity: 'L', val: 96 },
    { name: 'Six Paths Sage Mode', rarity: 'M', val: 100, tag: 'hax' }
];

// Combine it all
export const devilFruitDB = [
        { name: "Gomu Gomu (Base)", type: "paramecia", rarity: "U", val: 65, tag: "rubber" },
        { name: "Bara Bara", type: "paramecia", rarity: "C", val: 50, tag: "split" },
        { name: "Sube Sube", type: "paramecia", rarity: "C", val: 45, tag: "smooth" },
        { name: "Bomu Bomu", type: "paramecia", rarity: "C", val: 50, tag: "bomb" },
        { name: "Doru Doru", type: "paramecia", rarity: "U", val: 60, tag: "wax" },
        { name: "Hana Hana", type: "paramecia", rarity: "U", val: 70, tag: "limbs" },
        { name: "Doku Doku", type: "paramecia", rarity: "R", val: 82, tag: "poison" },
        { name: "Nikyu Nikyu", type: "paramecia", rarity: "R", val: 85, tag: "repel" },
        { name: "Mochi Mochi", type: "paramecia", rarity: "R", val: 88, tag: "mochi" },
        { name: "Ito Ito", type: "paramecia", rarity: "R", val: 85, tag: "string" },
        { name: "Jiki Jiki", type: "paramecia", rarity: "E", val: 90, tag: "magnet" },
        { name: "Ope Ope", type: "paramecia", rarity: "E", val: 95, tag: "hax" },
        { name: "Zushi Zushi", type: "paramecia", rarity: "E", val: 92, tag: "gravity" },
        { name: "Gura Gura", type: "paramecia", rarity: "L", val: 100, tag: "destruct" },
        { name: "Hobi Hobi", type: "paramecia", rarity: "L", val: 98, tag: "hax" },
        { name: "Moku Moku", type: "logia", rarity: "E", val: 55, tag: "smoke" },
        { name: "Suna Suna", type: "logia", rarity: "E", val: 75, tag: "sand" },
        { name: "Numa Numa", type: "logia", rarity: "E", val: 65, tag: "swamp" },
        { name: "Yuki Yuki", type: "logia", rarity: "E", val: 70, tag: "ice" },
        { name: "Mera Mera", type: "logia", rarity: "E", val: 85, tag: "fire" },
        { name: "Hie Hie", type: "logia", rarity: "E", val: 88, tag: "ice" },
        { name: "Goro Goro", type: "logia", rarity: "E", val: 92, tag: "lightning" },
        { name: "Pika Pika", type: "logia", rarity: "E", val: 94, tag: "light" },
        { name: "Yami Yami", type: "logia", rarity: "E", val: 96, tag: "darkness" },
        { name: "Magu Magu", type: "logia", rarity: "E", val: 100, tag: "fire" },
        { name: "Ushi Ushi: Bison", type: "zoan", rarity: "C", val: 50, tag: "beast" },
        { name: "Inu Inu: Wolf", type: "zoan", rarity: "C", val: 55, tag: "beast" },
        { name: "Neko Neko: Leopard", type: "zoan", rarity: "U", val: 68, tag: "beast" },
        { name: "Ushi Ushi: Giraffe", type: "zoan", rarity: "U", val: 65, tag: "beast" },
        { name: "Ryu Ryu: Pteranodon", type: "ancient_zoan", rarity: "L", val: 88, tag: "dino" },
        { name: "Ryu Ryu: Brachiosaurus", type: "ancient_zoan", rarity: "L", val: 90, tag: "dino" },
        { name: "Zou Zou: Mammoth", type: "ancient_zoan", rarity: "L", val: 85, tag: "dino" },
        { name: "Ryu Ryu: Spinosaurus", type: "ancient_zoan", rarity: "L", val: 86, tag: "dino" },
        { name: "Tori Tori: Phoenix", type: "mythical_zoan", rarity: "M", val: 98, tag: "heal" },
        { name: "Inu Inu: Okuchi no Makami", type: "mythical_zoan", rarity: "M", val: 96, tag: "ice" },
        { name: "Hito Hito: Daibutsu", type: "mythical_zoan", rarity: "M", val: 97, tag: "shockwave" },
        { name: "Uo Uo: Seiryu", type: "mythical_zoan", rarity: "M", val: 100, tag: "dragon" },
        { name: "Hito Hito: Nika", type: "mythical_zoan", rarity: "M", val: 105, tag: "hax toon" }
];

export const CATEGORIES = [
    { id: 'race', name: 'Race', desc: 'Your genetic lineage', options: [{ name: 'Human', rarity: 'C', baseStats: { str: 50, spd: 50, dur: 50 } }, { name: 'Fish-Man', rarity: 'U', baseStats: { str: 70, spd: 60, dur: 65 } }, { name: 'Mink', rarity: 'U', baseStats: { str: 60, spd: 75, dur: 55 } }, { name: 'Skypiean', rarity: 'U', baseStats: { str: 55, spd: 65, dur: 50 } }, { name: 'Dwarf', rarity: 'R', baseStats: { str: 40, spd: 90, dur: 40 } }, { name: 'Buccaneer', rarity: 'E', baseStats: { str: 90, spd: 40, dur: 85 } }, { name: 'Oni', rarity: 'E', baseStats: { str: 95, spd: 70, dur: 95 } }, { name: 'Lunarian', rarity: 'L', baseStats: { str: 85, spd: 85, dur: 100 } }, { name: 'Ancient Giant', rarity: 'L', baseStats: { str: 100, spd: 30, dur: 95 } }, { name: 'Cyborg', rarity: 'U' }, { name: 'Tontatta', rarity: 'R' }] },
    { id: 'vessel', name: 'Physical Vessel', desc: 'Whose base physical body do you possess?', options: [] },
    { id: 'origin', name: 'Origin', desc: 'Where were you born?', options: [{ name: 'East Blue', rarity: 'C' }, { name: 'Grand Line', rarity: 'C' }, { name: 'Wano', rarity: 'U' }, { name: 'Konoha', rarity: 'U' }, { name: 'Suna', rarity: 'U' }, { name: 'Kumo', rarity: 'U' }, { name: 'Fish-Man Island', rarity: 'R' }, { name: 'Skypiea', rarity: 'R' }, { name: 'Elbaf', rarity: 'E' }, { name: 'Laugh Tale', rarity: 'L' }, { name: 'Mary Geoise', rarity: 'L' }, { name: 'Iwa', rarity: 'U' }, { name: 'Kiri', rarity: 'U' }, { name: 'Otogakure', rarity: 'R' }, { name: 'Amegakure', rarity: 'R' }, { name: 'Dressrosa', rarity: 'U' }, { name: 'Alabasta', rarity: 'U' }, { name: 'Water 7', rarity: 'C' }] },
    { id: 'faction', name: 'Faction', desc: 'Your allegiance or organization', options: [{ name: 'Pirate', rarity: 'C' }, { name: 'Marine', rarity: 'C' }, { name: 'Shinobi', rarity: 'C' }, { name: 'Samurai', rarity: 'U' }, { name: 'Rogue Ninja', rarity: 'U' }, { name: 'Revolutionary Army', rarity: 'R' }, { name: 'Anbu', rarity: 'R' }, { name: 'CP9', rarity: 'R' }, { name: 'CP0', rarity: 'E' }, { name: 'Akatsuki', rarity: 'E' }, { name: 'Kara', rarity: 'E' }, { name: 'Knight of God', rarity: 'E' }, { name: 'Tenryuubito', rarity: 'L' }, { name: 'Gorosei', rarity: 'L' }, { name: 'Ōtsutsuki Clan', rarity: 'L' }, { name: 'Seven Warlords', rarity: 'E' }, { name: 'Yonko Crew', rarity: 'E' }, { name: 'Bounty Hunter', rarity: 'U' }] },
    { id: 'trait', name: 'Special Trait', desc: 'Physiological modifications or lineages', options: [{ name: 'None', rarity: 'C', val: 0 }, { name: 'D. Clan Will', rarity: 'U', val: 50 }, { name: 'Voice of All Things', rarity: 'R', val: 75 }, { name: 'Jinchūriki', rarity: 'C', val: 95, tag: 'jinchuriki' }, { name: 'Germa 66 Enhancements', rarity: 'R', val: 80 }, { name: 'Hashirama Cells', rarity: 'E', val: 90 }, { name: 'Claw Marks', rarity: 'E', val: 92, tag: 'hax' }, { name: 'Karma Seal', rarity: 'L', val: 98, tag: 'hax' }, { name: 'Shinju Biology', rarity: 'L', val: 100, tag: 'hax' }, { name: 'Shinjutsu: Reflection', rarity: 'L', val: 105, tag: 'hax' }, { name: 'Shinjutsu: Omnipotence', rarity: 'M', val: 105, tag: 'hax' }, { name: 'Uzumaki Lineage', rarity: 'U', val: 65 }, { name: 'Senju Lineage', rarity: 'R', val: 80 }] },
    { id: 'jinchuriki_beast', name: 'Tailed Beast', desc: 'Which Tailed Beast resides within you?', options: [], isDynamic: true, parentCatId: 'trait' },
    { id: 'str', name: 'Strength Benchmark', desc: 'Raw physical power tier', options: strengthTiers },
    { id: 'spd', name: 'Speed Benchmark', desc: 'Movement and reaction tier', options: speedTiers },
    { id: 'dur', name: 'Durability Benchmark', desc: 'Endurance and toughness tier', options: durabilityTiers },
    { id: 'combat', name: 'Combat Mastery', desc: 'Overall fighting capability', options: combatTiers },
    { id: 'iq', name: 'Battle IQ', desc: 'Tactical thinking and adaptability', options: [] },
    { id: 'chakra_cap', name: 'Chakra Reserves', desc: 'Total chakra pool', options: chakraTiers },
    { id: 'df_type', name: 'Devil Fruit Type', desc: 'What class of Devil Fruit did fate choose?', options: [{ name: 'None', rarity: 'C', val: 0, tag: 'none' }, { name: 'Paramecia', rarity: 'U', val: 70 }, { name: 'Logia', rarity: 'E', val: 90 }, { name: 'Zoan', rarity: 'U', val: 70 }, { name: 'Ancient Zoan', rarity: 'L', val: 82 }, { name: 'Mythical Zoan', rarity: 'M', val: 95 }] },
    { id: 'df', name: 'Devil Fruit', desc: 'Your specific fruit power', options: [
        { name: "Gomu Gomu (Base)", type: "paramecia", rarity: "U", val: 65, tag: "rubber" },
        { name: "Bara Bara", type: "paramecia", rarity: "C", val: 50, tag: "split" },
        { name: "Sube Sube", type: "paramecia", rarity: "C", val: 45, tag: "smooth" },
        { name: "Bomu Bomu", type: "paramecia", rarity: "C", val: 50, tag: "bomb" },
        { name: "Doru Doru", type: "paramecia", rarity: "U", val: 60, tag: "wax" },
        { name: "Hana Hana", type: "paramecia", rarity: "U", val: 70, tag: "limbs" },
        { name: "Doku Doku", type: "paramecia", rarity: "R", val: 82, tag: "poison" },
        { name: "Nikyu Nikyu", type: "paramecia", rarity: "R", val: 85, tag: "repel" },
        { name: "Mochi Mochi", type: "paramecia", rarity: "R", val: 88, tag: "mochi" },
        { name: "Ito Ito", type: "paramecia", rarity: "R", val: 85, tag: "string" },
        { name: "Jiki Jiki", type: "paramecia", rarity: "E", val: 90, tag: "magnet" },
        { name: "Ope Ope", type: "paramecia", rarity: "E", val: 95, tag: "hax" },
        { name: "Zushi Zushi", type: "paramecia", rarity: "E", val: 92, tag: "gravity" },
        { name: "Gura Gura", type: "paramecia", rarity: "L", val: 100, tag: "destruct" },
        { name: "Hobi Hobi", type: "paramecia", rarity: "L", val: 98, tag: "hax" },
        { name: "Moku Moku", type: "logia", rarity: "E", val: 55, tag: "smoke" },
        { name: "Suna Suna", type: "logia", rarity: "E", val: 75, tag: "sand" },
        { name: "Numa Numa", type: "logia", rarity: "E", val: 65, tag: "swamp" },
        { name: "Yuki Yuki", type: "logia", rarity: "E", val: 70, tag: "ice" },
        { name: "Mera Mera", type: "logia", rarity: "E", val: 85, tag: "fire" },
        { name: "Hie Hie", type: "logia", rarity: "E", val: 88, tag: "ice" },
        { name: "Goro Goro", type: "logia", rarity: "E", val: 92, tag: "lightning" },
        { name: "Pika Pika", type: "logia", rarity: "E", val: 94, tag: "light" },
        { name: "Yami Yami", type: "logia", rarity: "E", val: 96, tag: "darkness" },
        { name: "Magu Magu", type: "logia", rarity: "E", val: 100, tag: "fire" },
        { name: "Ushi Ushi: Bison", type: "zoan", rarity: "C", val: 50, tag: "beast" },
        { name: "Inu Inu: Wolf", type: "zoan", rarity: "C", val: 55, tag: "beast" },
        { name: "Neko Neko: Leopard", type: "zoan", rarity: "U", val: 68, tag: "beast" },
        { name: "Ushi Ushi: Giraffe", type: "zoan", rarity: "U", val: 65, tag: "beast" },
        { name: "Ryu Ryu: Pteranodon", type: "ancient_zoan", rarity: "L", val: 88, tag: "dino" },
        { name: "Ryu Ryu: Brachiosaurus", type: "ancient_zoan", rarity: "L", val: 90, tag: "dino" },
        { name: "Zou Zou: Mammoth", type: "ancient_zoan", rarity: "L", val: 85, tag: "dino" },
        { name: "Ryu Ryu: Spinosaurus", type: "ancient_zoan", rarity: "L", val: 86, tag: "dino" },
        { name: "Tori Tori: Phoenix", type: "mythical_zoan", rarity: "M", val: 98, tag: "heal" },
        { name: "Inu Inu: Okuchi no Makami", type: "mythical_zoan", rarity: "M", val: 96, tag: "ice" },
        { name: "Hito Hito: Daibutsu", type: "mythical_zoan", rarity: "M", val: 97, tag: "shockwave" },
        { name: "Uo Uo: Seiryu", type: "mythical_zoan", rarity: "M", val: 100, tag: "dragon" },
        { name: "Hito Hito: Nika", type: "mythical_zoan", rarity: "M", val: 105, tag: "hax toon" }
    ], isDynamic: true, parentCatId: 'df_type' },
    { id: 'dojutsu', name: 'Dōjutsu', desc: 'Ocular ninja abilities', options: [{ name: 'None', rarity: 'C', val: 0 }, { name: 'Byakugan', rarity: 'U', val: 75 }, { name: 'Sharingan (1 Tomoe)', rarity: 'C', val: 60 }, { name: 'Sharingan (2 Tomoe)', rarity: 'U', val: 70 }, { name: 'Sharingan (3 Tomoe)', rarity: 'U', val: 80 }, { name: 'Mangekyō Sharingan', rarity: 'R', val: 88 }, { name: 'Ketsuryūgan', rarity: 'R', val: 82 }, { name: 'Eternal MS', rarity: 'E', val: 95 }, { name: 'Jōgan', rarity: 'E', val: 92 }, { name: 'Rinnegan', rarity: 'L', val: 100, tag: 'hax' }, { name: 'Tenseigan', rarity: 'L', val: 98 }, { name: 'Senrigan', rarity: 'L', val: 100, tag: 'hax future_sight' }, { name: 'Rinne Sharingan', rarity: 'M', val: 105 }] },
    { id: 'jutsu_nin', name: 'Ninjutsu', desc: 'Elemental and clone arts', options: ninjutsuOptions },
    { id: 'jutsu_tai', name: 'Taijutsu', desc: 'Martial arts and body techniques', options: taijutsuOptions },
    { id: 'jutsu_gen', name: 'Genjutsu', desc: 'Illusionary arts', options: genjutsuOptions },
    { id: 'jutsu_kg', name: 'Kekkei Genkai', desc: 'Bloodline traits', options: kekkeiGenkaiOptions },
    { id: 'jutsu_kt', name: 'Kekkei Tōta', desc: 'Advanced bloodline traits', options: kekkeiTotaOptions },
    { id: 'jutsu_sen', name: 'Senjutsu', desc: 'Nature energy and sage mode', options: senjutsuOptions },
    { id: 'haki_obs', name: 'Observation Haki', desc: 'Sensing and predicting', options: [ {name: 'None', rarity: 'C', val: 0}, {name: 'Basic', rarity: 'C', val: 40}, {name: 'Proficient', rarity: 'U', val: 60}, {name: 'Mastered', rarity: 'R', val: 80}, {name: 'Future Sight', rarity: 'E', val: 95}, {name: 'Killer of Obs.', rarity: 'L', val: 100} ] },
    { id: 'haki_arm', name: 'Armament Haki', desc: 'Spiritual armor', options: [ {name: 'None', rarity: 'C', val: 0}, {name: 'Basic', rarity: 'C', val: 40}, {name: 'Hardening', rarity: 'U', val: 60}, {name: 'Emission (Ryou)', rarity: 'R', val: 80}, {name: 'Internal Destruction', rarity: 'E', val: 95}, {name: 'Supreme Mastery', rarity: 'L', val: 100} ] },
    { id: 'haki_conq', name: "Conqueror's Haki", desc: 'Willpower and intimidation', options: [ {name: 'None', rarity: 'C', val: 0}, {name: 'Latent / Unawakened', rarity: 'U', val: 50}, {name: 'Basic Intimidation', rarity: 'R', val: 70}, {name: 'Advanced Infusion (ACoC)', rarity: 'E', val: 95}, {name: 'Supreme King (Shanks level)', rarity: 'L', val: 100} ] },
    { id: 'weapon', name: 'Weapon', desc: 'Primary armament', options: [{ name: 'Bare Fists', rarity: 'C', val: 0 }, { name: 'Kunai/Shuriken', rarity: 'C', val: 30 }, { name: 'Standard Sword', rarity: 'U', val: 60 }, { name: 'Clima-Tact', rarity: 'U', val: 65 }, { name: 'Kuro Kabuto (Usopp)', rarity: 'R', val: 80, tag: 'sniper' }, { name: 'War Bow of Ruin (Kidōmaru)', rarity: 'R', val: 82, tag: 'sniper' }, { name: 'Shusui', rarity: 'R', val: 80 }, { name: 'Kubikiribōchō', rarity: 'R', val: 75 }, { name: 'Kusanagi', rarity: 'R', val: 82 }, { name: "Senriku (Van Augur's Rifle)", rarity: 'E', val: 92, tag: 'sniper' }, { name: "Yasopp's Flintlock Rifle", rarity: 'E', val: 94, tag: 'sniper' }, { name: 'Enma', rarity: 'E', val: 92 }, { name: 'Samehada', rarity: 'E', val: 90 }, { name: 'Gunbai', rarity: 'E', val: 88 }, { name: 'Supreme Grade (Yoru)', rarity: 'L', val: 100 }, { name: 'Murakumogiri (Whitebeard)', rarity: 'L', val: 100 }, { name: 'Truth-Seeking Orbs', rarity: 'L', val: 100, tag: 'hax' }, { name: 'Scythe (Hidan)', rarity: 'R', val: 75 }, { name: 'Nuibari', rarity: 'R', val: 75 }, { name: 'Shibuki', rarity: 'R', val: 75 }, { name: 'Hiramekarei', rarity: 'R', val: 80 }, { name: 'Kiba (Swords)', rarity: 'R', val: 80 }, { name: 'Bashōsen', rarity: 'E', val: 90 }, { name: 'Totsuka Blade', rarity: 'L', val: 100, tag: 'hax' }, { name: 'Yata Mirror', rarity: 'L', val: 100, tag: 'hax' }] },
    { id: 'style', name: 'Fighting Style', desc: 'Combat discipline', options: [{ name: 'Brawler', rarity: 'C', val: 50 }, { name: 'Ninja Academy', rarity: 'C', val: 50 }, { name: 'Swordsmanship', rarity: 'U', val: 75 }, { name: 'Taijutsu Specialist', rarity: 'U', val: 75 }, { name: 'Sniper', rarity: 'R', val: 85, tag: 'sniper' }, { name: 'Fishman Karate', rarity: 'R', val: 85 }, { name: 'Assassin', rarity: 'R', val: 80 }, { name: 'Gentle Fist', rarity: 'R', val: 82 }, { name: 'Rokushiki', rarity: 'E', val: 90 }, { name: 'Haki Master', rarity: 'E', val: 94 }, { name: 'Eight Gates (Opened)', rarity: 'L', val: 100 }, { name: 'Black Leg Style', rarity: 'R', val: 85 }, { name: 'Santoryu (Three Sword Style)', rarity: 'E', val: 92 }, { name: 'Kitsunebi-ryu (Foxfire)', rarity: 'R', val: 80 }, { name: 'Strong Fist', rarity: 'U', val: 75 }, { name: 'Drunken Fist', rarity: 'R', val: 82 }, { name: 'Frog Kata', rarity: 'E', val: 90 }] },
    { id: 'summon', name: 'Summoning', desc: 'Animal contract or ally', options: [{ name: 'None', rarity: 'C', val: 0 }, { name: 'Dogs', rarity: 'U', val: 60 }, { name: 'Hawks', rarity: 'U', val: 65 }, { name: 'Toads', rarity: 'R', val: 80 }, { name: 'Snakes', rarity: 'R', val: 80 }, { name: 'Slugs', rarity: 'R', val: 75 }, { name: 'Baku', rarity: 'E', val: 88 }, { name: 'Monkey Enma', rarity: 'E', val: 85 }, { name: 'Gedo Statue', rarity: 'L', val: 100 }, { name: 'Sea Kings', rarity: 'L', val: 100 }, { name: 'Crows', rarity: 'U', val: 65 }, { name: 'Spiders', rarity: 'U', val: 60 }, { name: 'Salamander (Ibuse)', rarity: 'R', val: 80 }, { name: 'Kamatari (Weasel)', rarity: 'U', val: 65 }] },
    { id: 'potential', name: 'Potential', desc: 'Latent talent and growth rate', options: [{ name: 'Stagnant', rarity: 'C', val: 0.8 }, { name: 'Average', rarity: 'C', val: 1.0 }, { name: 'Gifted', rarity: 'U', val: 1.1 }, { name: 'Prodigy', rarity: 'R', val: 1.25 }, { name: 'Generational Talent', rarity: 'E', val: 1.5 }, { name: 'Limitless', rarity: 'L', val: 2.0 }] }
];
