// Canonical Kekkei Genkai (bloodline limits) and Kekkei Tōta (advanced bloodline) abilities
export const kekkeiGenkaiData = [
    // C - Common (lesser/partial bloodlines)
    { name: 'None', rarity: 'C', val: 0 },
    { name: 'Shikotsumyaku (Bone Manipulation - Weak)', rarity: 'C', val: 20, tag: 'bone' },
    { name: 'Crystal Release (Partial)', rarity: 'C', val: 25, tag: 'crystal' },
    { name: 'Swift Release (Minor)', rarity: 'C', val: 28, tag: 'speed' },
    { name: 'Steel Release (Basic)', rarity: 'C', val: 30, tag: 'metal' },
    { name: 'Dark Release (Weak)', rarity: 'C', val: 32, tag: 'absorb' },
    { name: 'Magnet Release (Minor)', rarity: 'C', val: 35, tag: 'magnet' },
    { name: 'Smoke Release', rarity: 'C', val: 18, tag: 'smoke' },
    { name: 'Mud Release', rarity: 'C', val: 22, tag: 'mud' },
    // U - Uncommon
    { name: 'Ice Release', rarity: 'U', val: 58, tag: 'ice' },
    { name: 'Scorch Release', rarity: 'U', val: 55, tag: 'fire' },
    { name: 'Storm Release', rarity: 'U', val: 60, tag: 'lightning' },
    { name: 'Magnet Release', rarity: 'U', val: 62, tag: 'magnet' },
    { name: 'Explosion Release', rarity: 'U', val: 65, tag: 'explosion' },
    { name: 'Crystal Release', rarity: 'U', val: 56, tag: 'crystal' },
    { name: 'Dark Release', rarity: 'U', val: 58, tag: 'absorb' },
    { name: 'Swift Release', rarity: 'U', val: 52, tag: 'speed' },
    { name: 'Steel Release', rarity: 'U', val: 50, tag: 'metal' },
    // R - Rare
    { name: 'Lava Release', rarity: 'R', val: 78, tag: 'lava' },
    { name: 'Boil Release', rarity: 'R', val: 76, tag: 'acid' },
    { name: 'Shikotsumyaku (Dead Bone Pulse)', rarity: 'R', val: 80, tag: 'bone' },
    { name: 'Ketsuryūgan (Blood Dragon Eye)', rarity: 'R', val: 82, tag: 'blood' },
    { name: 'Typhoon Release', rarity: 'R', val: 75, tag: 'wind' },
    { name: 'Blaze Release', rarity: 'R', val: 82, tag: 'fire' },
    { name: 'Ink Release (Sai)', rarity: 'R', val: 74, tag: 'art' },
    { name: 'Storm Release: Laser Circus', rarity: 'R', val: 80, tag: 'lightning' },
    { name: 'Explosion Release: C4 Garuda', rarity: 'R', val: 85, tag: 'explosion' },
    // E - Epic
    { name: 'Wood Release', rarity: 'E', val: 92, tag: 'wood' },
    { name: 'Lava Release: Rasenshuriken', rarity: 'E', val: 90, tag: 'lava' },
    { name: 'Boil Release: Unrivalled Strength', rarity: 'E', val: 88, tag: 'acid' },
    { name: 'Magnet Release: Rasengan', rarity: 'E', val: 90, tag: 'magnet' },
    { name: 'Ice Release: Ice Mirror Dome', rarity: 'E', val: 88, tag: 'ice' },
    { name: 'Blaze Release: Kagutsuchi', rarity: 'E', val: 92, tag: 'fire' },
    { name: 'Scorch Release: Extremely Steaming Murder', rarity: 'E', val: 90, tag: 'fire' },
    { name: 'Wood Release: Wood Dragon', rarity: 'E', val: 94, tag: 'wood' },
    { name: 'Storm Release: Light Fang', rarity: 'E', val: 93, tag: 'lightning' },
    // L - Legend
    { name: 'Wood Release: Sage Art Wood Golem', rarity: 'L', val: 100, tag: 'wood' },
    { name: 'Wood Release: Deep Forest Emergence', rarity: 'L', val: 98, tag: 'wood' },
    { name: 'Blaze Release: Yasaka Magatama', rarity: 'L', val: 100, tag: 'fire hax' },
    { name: 'Wood Release: True Several Thousand Hands', rarity: 'L', val: 100, tag: 'wood hax' },
    { name: 'Ice Release: Twin Dragon Blizzard', rarity: 'L', val: 96, tag: 'ice' },
    // M - Mythic
    { name: 'Wood Release: God Nativity World', rarity: 'M', val: 105, tag: 'hax' },
    { name: 'All Nature Transformations (Ōtsutsuki)', rarity: 'M', val: 105, tag: 'hax' },
    { name: 'Ash Killing Bones', rarity: 'M', val: 105, tag: 'hax' },
];

export const kekkeiTotaData = [
    // C - Common
    { name: 'None', rarity: 'C', val: 0 },
    { name: 'Dust Release (Weak)', rarity: 'C', val: 30, tag: 'dust' },
    // U - Uncommon
    { name: 'Dust Release (Basic)', rarity: 'U', val: 55, tag: 'dust' },
    { name: 'Dust Release: Detachment of Primitive World (Small)', rarity: 'U', val: 60, tag: 'dust' },
    // R - Rare
    { name: 'Dust Release: Detachment of Primitive World', rarity: 'R', val: 80, tag: 'dust' },
    { name: 'Dust Release: Atomic Dismantling', rarity: 'R', val: 82, tag: 'dust hax' },
    // E - Epic
    { name: 'Dust Release: Detachment of Primitive World (Expanded)', rarity: 'E', val: 92, tag: 'dust hax' },
    { name: 'Particle Style: Atomic Dismantling Jutsu', rarity: 'E', val: 95, tag: 'dust hax' },
    // L - Legend
    { name: 'Dust Release: Full-Scale Annihilation', rarity: 'L', val: 100, tag: 'dust hax' },
    { name: 'Particle Style: Nuclear Fission', rarity: 'L', val: 100, tag: 'dust hax' },
    // M - Mythic
    { name: 'Yin-Yang Release (Ōtsutsuki)', rarity: 'M', val: 105, tag: 'hax' },
];
