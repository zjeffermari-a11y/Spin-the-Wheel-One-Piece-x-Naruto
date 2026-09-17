const fs = require('fs');
let code = fs.readFileSync('src/data/categories.js', 'utf8');

const target = `export const CATEGORIES = [`;
const replacement = `export const devilFruitDB = [
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

export const CATEGORIES = [`;

code = code.replace(target, replacement);
fs.writeFileSync('src/data/categories.js', code);
