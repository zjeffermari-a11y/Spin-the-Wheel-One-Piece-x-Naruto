// This is a retrieval index, not a second set of game stats.  A generation only
// receives the entries for its rolled build, keeping the prompt useful without
// flooding the model with unrelated lore.
const LORE = {
    race: {
        Human: 'A baseline human body whose true ceiling comes from the selected training, chakra, Haki, weapon, and inherited trait rather than racial physiology.',
        'Fish-Man': 'Naturally powerful and adapted to water; Fish-Man Karate can manipulate water already present, but a Devil Fruit user still cannot swim.',
        Mink: 'Animal-humanoid physiology with Electro. Sulong is a moon-dependent peak state, not a permanent default.',
        Skypiean: 'Sky-islander physiology; their wings are cultural/biological markers and do not automatically grant flight.',
        Dwarf: 'Small Tontatta-like frame with startling strength and speed; use size for infiltration and leverage, not giant-scale reach.',
        Buccaneer: 'A rare, unusually durable bloodline associated with inherited stories of Nika; do not invent a separate superpower without another selected source.',
        Oni: 'A horned, exceptionally tough humanoid lineage. The horns and raw durability are physical traits, not elemental magic.',
        Lunarian: 'Black wings, flame generation, and a flame-on durability / flame-off speed tradeoff. Keep that tradeoff visible in combat logic.',
        'Ancient Giant': 'Enormous body, reach, and durability at the expense of a large target profile and usually less agility in confined spaces.',
        Cyborg: 'Mechanical augmentations can conceal weapons, reinforce the frame, or run on energy; they need a stated power source and can be damaged or disrupted.',
        Tontatta: 'Tiny, fast, deceptively strong fairies. Their scale makes stealth easy but reduces reach and area coverage.'
    },
    origin: {
        'East Blue': 'A comparatively quiet sea whose underdog ambition and pirate folklore make it a grounded origin.',
        'Grand Line': 'A volatile sea ruled by shifting weather, powerful crews, and survival through navigation and alliances.',
        Wano: 'A closed samurai nation defined by sword schools, seastone craft, and fierce clan loyalty.',
        Konoha: 'The Hidden Leaf emphasizes team tactics, inherited techniques, and the Will of Fire.',
        Suna: 'The Hidden Sand rewards desert survival, puppet warfare, wind techniques, and political grit.',
        Kumo: 'The Hidden Cloud is associated with militarized shinobi, lightning release, and jinchuriki history.',
        'Fish-Man Island': 'An undersea kingdom marked by racism, royal politics, and Fish-Man/Joy Boy history.',
        Skypiea: 'A sky island shaped by cloud seas, dials, and a culture where mantra resembles Observation Haki.',
        Elbaf: 'A warrior giant nation where honor, myth, and battlefield legacy carry enormous weight.',
        'Laugh Tale': 'The final island tied to the Void Century, Joy Boy, and a world-changing inherited truth.',
        'Mary Geoise': 'The World Noble capital: immaculate privilege, political cruelty, and proximity to the World Government’s deepest secrets.',
        Iwa: 'The Hidden Stone values endurance, earth-based warfare, and hard-nosed military strategy.',
        Kiri: 'The Hidden Mist has a legacy of brutal shinobi education, swordsmen, and water techniques.',
        Otogakure: 'The Hidden Sound is an experimental rogue village shaped by Orochimaru’s forbidden research.',
        Amegakure: 'A rain-soaked war zone defined by proxy conflict, surveillance, and Pain’s legacy.',
        Dressrosa: 'A kingdom of smiles concealing manipulation, gladiatorial violence, and the scars of a puppet regime.',
        Alabasta: 'A desert kingdom whose civil-war trauma foregrounds loyalty, drought, and royal duty.',
        'Water 7': 'A shipwright city where sea trains, engineering, and maritime craft can inform a fighter’s methods.'
    },
    faction: {
        Pirate: 'Freedom-first seafarer; reputation, crew bonds, and a bounty are natural story pressure.',
        Marine: 'World Government military with a justice doctrine that can be sincere, compromised, or ruthless.',
        Shinobi: 'Mission-trained operative who uses concealment, information, and teamwork as readily as direct force.',
        Samurai: 'Wano warrior bound to blade discipline, personal honor, and the defense of homeland.',
        'Rogue Ninja': 'A shinobi outside village protection, pursued by hunters and free to define a personal code.',
        'Revolutionary Army': 'Anti-World-Government movement organized around liberation, cells, and protecting the oppressed.',
        Anbu: 'Masked black-ops shinobi specializing in secrecy, assassination, and deniable missions.',
        CP9: 'World Government assassins whose public face hides covert operations and Rokushiki training.',
        CP0: 'The Government’s elite masked intelligence force, operating above CP9 and close to the Celestial Dragons.',
        Akatsuki: 'A rogue network whose members pursue peace, power, or personal ideology through tailed-beast conflict.',
        Kara: 'A clandestine organization built around Otsutsuki vessels, Karma, and scientific shinobi technology.',
        'Knight of God': 'Holy Land enforcers whose authority, cruelty, and aristocratic mandate should shape their reputation.',
        Tenryuubito: 'A World Noble with inherited impunity; portray the social power and moral tension, not automatic combat mastery.',
        Gorosei: 'The ruling elders’ political reach and secrecy; avoid assigning unselected individual forms or powers.',
        'Ōtsutsuki Clan': 'Extraterrestrial chakra harvesters who view worlds as resources; use their hierarchy and alien detachment.',
        'Seven Warlords': 'Government-sanctioned pirates whose independence is constrained by an unstable political bargain.',
        'Yonko Crew': 'A major pirate empire where territory, commanders, and a captain’s flag carry strategic weight.',
        'Bounty Hunter': 'A pragmatic tracker who reads bounties, terrain, and targets rather than relying on institutional support.'
    },
    trait: {
        'D. Clan Will': 'An inherited initial associated with defiance, freedom, and opposition to the world order—not a guaranteed physical buff.',
        'Voice of All Things': 'The capacity to perceive voices/intent from beings or objects beyond normal hearing; it is perception, not literal command.',
        Jinchūriki: 'A human host sharing a tailed beast’s chakra. Cooperation, seals, emotional control, and the selected beast determine access.',
        'Germa 66 Enhancements': 'Engineered exoskeleton, altered durability, accelerated recovery, and genetically tuned physical ability; it is not invulnerability.',
        'Hashirama Cells': 'Exceptional vitality and regenerative potential that can support Wood Release compatibility, but uncontrolled grafting risks instability.',
        'Claw Marks': 'Code’s spatial markers enable instant travel through marked surfaces; placement, access, and the marks themselves are tactical constraints.',
        'Karma Seal': 'An Otsutsuki data-backup mark that grants compression, absorption, and a dangerous vessel overwrite/possession risk.',
        'Shinju Biology': 'Divine-tree humanoid biology: immense chakra, regeneration, and a drive that should be tied to an individual target or purpose.',
        'Shinjutsu: Reflection': 'Daemon-style reflection returns attacks or hostile intent when its contact condition is met. It is reactive, conditional, and not a free offensive beam.',
        'Shinjutsu: Omnipotence': 'A reality-altering shinjutsu that rewrites perception and memories on a colossal scale; treat it as rare, socially disruptive, and not a casual combat button.',
        'Uzumaki Lineage': 'Large chakra reserves, life force, sealing affinity, and resilience; it does not grant every Uzumaki technique by itself.',
        'Senju Lineage': 'Potent vitality and broad chakra aptitude associated with the Senju; Wood Release still requires its own source.'
    },
    jinchuriki_beast: {
        'Shukaku (1-Tail)': 'A sand tanuki whose chakra supports wind, magnet-release sealing, and vast sand defense; its temperament can resist the host.',
        'Matatabi (2-Tails)': 'A two-tailed cat whose blue fire and agile chakra cloak favor speed and burning pressure.',
        'Isobu (3-Tails)': 'An armored turtle whose water affinity, coral, and shell-like defense reward positional play.',
        'Son Gokū (4-Tails)': 'A volcanic ape with immense physical force and Lava Release; its temper and pride should matter.',
        'Kokuō (5-Tails)': 'A horse-dolphin whose Boil Release uses steam pressure for explosive acceleration and horn charges.',
        'Saiken (6-Tails)': 'A slug whose corrosive vapor, fluid body, and acid techniques excel at zone control.',
        'Chōmei (7-Tails)': 'A beetle-dragonfly with flight, scale powder, and nimble aerial movement.',
        'Gyūki (8-Tails)': 'An octopus-ox with tentacles, ink, chakra cannons, and a balanced, cooperative temperament.',
        'Kurama (9-Tails)': 'An immense fox with overwhelming chakra, sensory acuity, chakra cloaks, and Tailed Beast Bomb potential.'
    },
    df: {
        'Gomu Gomu (Base)': 'Rubber physiology disperses blunt force and enables elastic reach, recoil, and compression. It remains vulnerable to cuts, heat, and the normal Devil Fruit sea/seastone weakness.',
        'Bara Bara': 'The body separates into controlled pieces and is immune to cutting attacks, but blunt force, restraint, and body-part control remain meaningful threats.',
        'Sube Sube': 'A frictionless, smooth body makes many grabs and glancing blows slide off; it is evasion, not blanket immunity.',
        'Bomu Bomu': 'The user can detonate their own body parts without self-harm, turning breaths, hair, or strikes into explosions.',
        'Doru Doru': 'Creates and controls candle wax for armor, weapons, restraints, and structures. Heat can soften or melt ordinary wax constructs.',
        'Hana Hana': 'Sprouts body parts on surfaces in range for grapples, eyes, and multi-limb attacks; pain or damage transfers to the user.',
        'Doku Doku': 'Produces lethal venom in liquid, gas, and construct forms. It dominates space but is dangerous to allies and can be countered by antidotes or protection.',
        'Nikyu Nikyu': 'Paw pads repel matter, pain, air, and attacks at high speed; contact and precise timing are central to the technique.',
        'Mochi Mochi': 'Special Paramecia creates and becomes mochi for shaping, restraint, and evasive body morphing; Future Sight, if selected, is what makes the mimicry predictive.',
        'Ito Ito': 'Produces razor-sharp strings for puppetry, traps, mobility, and constructs. Strings need anchors, tension, or line of sight to become decisive.',
        'Jiki Jiki': 'Magnetism assigns polarity to metal for disarming, railgun-like attacks, and scrap constructs; it needs metallic material to exploit.',
        'Ope Ope': 'Creates a ROOM in which the user can spatially operate on targets and objects: swap, cut without conventional injury, extract, or reposition. Range, stamina, and stronger Haki resistance keep it from being automatic victory.',
        'Zushi Zushi': 'Manipulates gravity to pin, redirect, levitate, or call down massive debris. It is indiscriminate at scale and demands battlefield awareness.',
        'Gura Gura': 'Generates quake vibrations through strikes, air, or sea, causing shockwaves and catastrophic terrain damage. Collateral danger is part of its identity.',
        'Hobi Hobi': 'Touch turns a target into a toy and erases public memory of them. Its permanent-youth body is not a reason to erase the touch condition.',
        'Moku Moku': 'Smoke Logia creates an intangible smoke body and can bind or obscure. Haki, seastone, and airflow counterplay still apply.',
        'Suna Suna': 'Sand Logia enables sandstorms, erosion, and dehydration by touch. Water and Haki can make the body tangible.',
        'Numa Numa': 'Swamp Logia creates a bottomless bog body that can engulf and store objects; it is strongest when it can set traps or control footing.',
        'Yuki Yuki': 'Snow Logia creates snow, blizzards, concealment, and cold zones. It is not automatically equivalent to Aokiji’s ice fruit.',
        'Mera Mera': 'Fire Logia grants flame generation, propulsion, and an intangible elemental body against non-Haki attacks.',
        'Hie Hie': 'Ice Logia flash-freezes terrain, water, and targets into vast constructs. Heat, Haki, and fighting without nearby water remain relevant.',
        'Goro Goro': 'Lightning Logia provides lightning offense, electrical sensing, extreme movement, and conduction through metal; rubber has a special natural resistance.',
        'Pika Pika': 'Light Logia fires lasers and moves along reflected/light paths at tremendous speed, but aimed attacks and combat decisions are not automatically lightspeed.',
        'Yami Yami': 'Darkness absorbs matter and can nullify a Devil Fruit on direct contact, while pulling targets in. Unlike normal Logia intangibility, it amplifies received pain.',
        'Magu Magu': 'Magma Logia produces extraordinarily destructive molten rock with overwhelming heat and area denial; it is hazardous to the battlefield and allies.',
        'Ushi Ushi: Bison': 'Bison Zoan grants a horned beast and hybrid form focused on charge power, traction, and physical resilience.',
        'Inu Inu: Wolf': 'Wolf Zoan grants scent tracking, predatory reflexes, claws, and a fast hybrid form.',
        'Neko Neko: Leopard': 'Leopard Zoan adds explosive pounces, claws, senses, and a compact assassination-oriented hybrid form.',
        'Ushi Ushi: Giraffe': 'Giraffe Zoan turns height, neck reach, kicks, and unusual body geometry into an unpredictable close-range style.',
        'Ryu Ryu: Pteranodon': 'Ancient Pteranodon Zoan provides armored aerial speed, a diving beak, wing slashes, and a tough hybrid form.',
        'Ryu Ryu: Brachiosaurus': 'Ancient Brachiosaurus Zoan supplies colossal mass, neck reach, and exceptional toughness; it excels at siege-scale force.',
        'Zou Zou: Mammoth': 'Ancient Mammoth Zoan provides massive charge force, tusks, trunk control, and cold-weather presence.',
        'Ryu Ryu: Spinosaurus': 'Ancient Spinosaurus Zoan supports powerful jaws, sail-backed durability, and amphibious predation.',
        'Tori Tori: Phoenix': 'Mythical Phoenix Zoan grants blue healing flames, flight, and regeneration. Healing consumes stamina and does not make allies immortal.',
        'Inu Inu: Okuchi no Makami': 'Mythical guardian-wolf Zoan grants frost breath, ice constructs, and a resilient hybrid guardian form.',
        'Hito Hito: Daibutsu': 'Mythical Daibutsu Zoan becomes a giant golden Buddha form that emits colossal palm shockwaves.',
        'Uo Uo: Seiryu': 'Mythical Azure Dragon Zoan grants an enormous dragon or hybrid form, flame clouds, elemental breath, and aerial mobility.',
        'Hito Hito: Nika': 'Mythical Nika Zoan has a rubber body and an awakened, liberating fighting style that bends the environment with cartoon-like freedom; it is imagination-driven, exhausting, and still has Devil Fruit limits.',
        'Ryu Ryu: Nidhogg': 'The build’s Mythical Nidhogg dragon form centers on colossal draconic scale and lightning. Keep its declared dragon/lightning identity consistent rather than adding unrelated powers.',
        'Ryu Ryu: Kirin': 'The build’s Mythical Kirin form combines a dragon-kirin body with sleep and manifested-dream motifs; make the sleep setup and dream consequence explicit.',
        'Inu Inu: Cerberus': 'The build’s Mythical Cerberus form uses three heads for overlapping bites, senses, and coordinated attack angles.',
        'Aro Aro': 'Arrow Paramecia creates and directs arrow-like bindings/projectiles for flight paths, restraints, and redirection. Their trajectories are a tactical language, not generic telekinesis.',
        'Iba Iba': 'Thorn Paramecia creates thorny bindings whose harm interacts with emotional attachment. The emotional condition must be stated when it matters.'
    },
    dojutsu: {
        Byakugan: 'Near-360-degree vision with a small blind spot, telescopic sight, chakra-network vision, and tenketsu targeting.',
        'Sharingan (1 Tomoe)': 'The first stage enhances perception and begins reading motion; it does not provide a complete Mangekyō toolkit.',
        'Sharingan (2 Tomoe)': 'Improves movement reading, genjutsu aptitude, and copying potential while retaining normal visual strain.',
        'Sharingan (3 Tomoe)': 'A mature Sharingan reads combat rhythm and can copy many visible techniques, but cannot copy bloodline traits or unlearnable physiology.',
        'Mangekyō Sharingan': 'A rare evolved eye that grants a user-specific ocular technique and Susanoo potential, with blindness/strain unless another source resolves it. Do not name a canon user’s technique unless their vessel supplies it.',
        Ketsuryūgan: 'A crimson eye that excels at genjutsu and can manipulate iron-rich liquids/blood under its own conditions.',
        'Eternal MS': 'An implanted Eternal Mangekyō removes the usual blindness progression and preserves Mangekyō power; the ocular technique remains individual.',
        Jōgan: 'Boruto’s rare eye perceives chakra pathways, dimensional disturbances, and anomalous energy. Its full limits are deliberately unclear—do not present it as omnipotence.',
        Rinnegan: 'Grants access to the Six Paths techniques, chakra absorption, summons, and outer-path potential. Individual space-time techniques require a specific stated source.',
        Tenseigan: 'An evolved Ōtsutsuki/Hyūga eye associated with chakra mode, attraction/repulsion effects, and truth-seeking orbs in its highest form.',
        Senrigan: 'Eida’s clairvoyant eye can observe present events and events from before her birth. It is surveillance, not a universal combat prediction power.',
        'Rinne Sharingan': 'A forehead eye linked to dimension travel and Infinite Tsukuyomi. Its world-scale effects need preparation and are not a casual one-hit technique.'
    },
    jutsu_nin: {
        'Clone Jutsu': 'Creates non-solid visual duplicates for deception; distinguish it from Shadow Clone Jutsu.',
        'Transformation Jutsu': 'Changes appearance for infiltration or feints; physical limits do not disappear.',
        'Body Replacement': 'A timed evasive substitution that trades the user for a nearby object or prepared decoy.',
        'Fireball Jutsu': 'A forward cone or sphere of Fire Release that pressures space and can be enlarged by chakra.',
        'Water Dragon Jutsu': 'Shapes nearby water into a pursuing dragon; its scale benefits from an existing water source.',
        'Mud Wall': 'Raises an Earth Release barrier for cover, line breaking, and terrain control rather than absolute defense.',
        'Shadow Clone Jutsu': 'Creates solid chakra clones that share information when dispersed, dividing the user’s chakra among them.',
        Chidori: 'A lightning thrust requiring high-speed precision; it pierces with a narrow line and normally pairs well with visual prediction.',
        Rasengan: 'A close-range rotating chakra sphere that grinds and blasts without requiring elemental nature transformation.',
        'Purple Electricity': 'A flexible lightning technique for bolts, body reinforcement, or ranged discharge; its range should be described, not assumed limitless.',
        'Wind Style: Rasenshuriken': 'A wind chakra shuriken that detonates into microscopic cutting force; it is devastating but expensive and dangerous at close range.',
        Hiraishin: 'Flying Thunder God teleports instantly to placed formulae/marks. It needs a mark, a kunai, or a prepared anchor—never call it unconditioned teleportation.',
        'Edo Tensei': 'Reanimates the dead through a living sacrifice and DNA, producing powerful immortal-like puppets under a control/sealing framework.',
        'Reaper Death Seal': 'A forbidden seal that summons the Shinigami to bind or take souls at the cost of the caster’s life.',
        'Tengai Shinsei': 'A catastrophic meteor-drop technique associated with Rinnegan-scale power; terrain, allies, and preparation are central consequences.',
        "Indra's Arrow": 'A final lightning-arrow discharge fueled by massive chakra and usually a Susanoo-scale platform; it is a commitment finisher.',
        'Six Paths: Ultra-Big Ball Rasenshuriken': 'A Six Paths-enhanced gigantic Rasenshuriken combining vast chakra, wind cutting force, and battlefield-ending scale.'
    },
    jutsu_tai: {
        'Leaf Whirlwind': 'A fast low-to-high sweeping kick that breaks stance and opens a follow-up.',
        'Lion Combo': 'A rising-launcher and aerial strike chain built around timing and repeated impact.',
        'Primary Lotus': 'A high-speed aerial bind and slam after opening the First Gate; the user shares the fall risk.',
        'Hidden Lotus': 'A more punishing gated aerial combo that trades the body’s safety for explosive force.',
        'Cherry Blossom Impact': 'Chakra-enhanced precision strength that releases stored force on contact and can shatter terrain.',
        'Heavenly Foot of Pain': 'A chakra-loaded axe kick that creates a localized crater/shockwave on impact.',
        'Eight Trigrams 64 Palms': 'Gentle Fist barrage targeting chakra points to disrupt an opponent’s chakra circulation, requiring close-range Byakugan-grade precision.',
        'Eight Trigrams 128 Palms': 'An extended, faster chakra-point assault; it is still a close-range sequence rather than an area spell.',
        'Morning Peacock': 'Gate-powered punches create frictional fire and a barrage of air-pressure strikes.',
        'Daytime Tiger': 'A compressed air-pressure beast formed by a punch, powerful without relying on chakra nature transformation.',
        'Evening Elephant': 'A sequence of immense air cannons whose stacked pressure overwhelms defense but tears at the user’s body.',
        'Night Guy': 'The Eighth Gate’s near-suicidal red-vapor kick that warps air through raw speed and force; retain its fatal recoil unless a selected power plausibly offsets it.'
    },
    jutsu_gen: {
        'Demonic Illusion: Hell Viewing': 'A basic visual genjutsu that weaponizes a target’s fear with an illusion.',
        'Temple of Nirvana': 'A wide-area genjutsu that induces sleep through falling feathers; alert targets can resist or dispel it.',
        'Bringer-of-Darkness': 'Creates sensory darkness that removes visual confidence, enabling ambush and control.',
        Ephemera: 'A high-level Sharingan-linked genjutsu delivered through eye contact or even a brief sensory opening; setup matters.',
        Tsukuyomi: 'Itachi’s ocular torture genjutsu distorts subjective time within an instant. Only assign its exact form when the source supports it.',
        Kotoamatsukami: 'Shisui’s subtle mind-control genjutsu changes intent without the target noticing. It has extreme cooldown/eye-source constraints.',
        Izanagi: 'Temporarily turns personal injury or death into illusion while making a chosen outcome real, at the cost of the eye’s light.',
        Izanami: 'Traps a target in a repeating sensory loop until they accept reality, also costing the user an eye.',
        'Infinite Tsukuyomi': 'A moon-reflected, world-scale genjutsu requiring colossal setup and a Rinne Sharingan; never reduce it to a casual gaze attack.'
    },
    jutsu_kg: {
        'Ice Release': 'Combines wind and water into ice mirrors, projectiles, and terrain; heat and heavy force can contest constructs.',
        'Boil Release': 'Uses heated steam/acidic vapor for pressure, melting, or corrosive zones depending on the user’s variant.',
        'Lava Release': 'Creates molten material or caustic quicklime depending on the user; state the chosen expression consistently.',
        'Scorch Release': 'Produces superheated chakra spheres that desiccate targets by stripping moisture.',
        'Magnet Release': 'Manipulates magnetic force or magnetized particles, often using sand, gold dust, or tagged metal as a medium.',
        'Explosion Release': 'Imbues matter with delayed or contact detonation; it rewards traps and precision timing.',
        'Storm Release': 'Combines water and lightning into controllable laser-like beams with sustained tracking pressure.',
        'Dead Bone Pulse (Shikotsumyaku)': 'Manipulates one’s skeleton into blades, armor, and projectiles with rapid bone regeneration.',
        'Wood Release': 'Combines water and earth into living wood for forests, binding, constructs, and chakra-suppressing growth at high mastery.',
        'Rinne-Sharingan': 'A god-tier ocular bloodline with dimension and Infinite Tsukuyomi associations; do not duplicate every Rinnegan ability automatically.'
    },
    jutsu_kt: {
        'Particle Style: Dismantling Jutsu': 'A three-nature cube/cone that molecularly disassembles what it encloses. It needs targeting, chakra, and time to form.'
    },
    jutsu_sen: {
        'Curse Mark (Level 1)': 'Draws on senjutsu-like cursed chakra for a visible stat boost while risking loss of control.',
        'Curse Mark (Level 2)': 'A transformed curse-mark state with greater force, altered body features, and greater corruption risk.',
        'Imperfect Toad Sage Mode': 'Partial natural-energy enhancement with imperfect features and a limited balance window.',
        'Toad Sage Mode': 'Balances nature energy for enhanced senses, strength, durability, and Frog Kata; still needs preparation or stored natural energy.',
        'Snake Sage Mode': 'Snake-style natural-energy transformation with sensory reach, body alteration, and a demanding compatibility threshold.',
        'Slug Sage Mode': 'A healing and resilience-focused sage expression; avoid inventing a canon combat kit beyond the selected powers.',
        'Wood Sage Mode': 'Hashirama-like natural-energy enhancement that magnifies Wood Release, sensing, healing, and physical power.',
        'Six Paths Sage Mode': 'Six Paths chakra state with flight, sensory reach, immense enhancement, and truth-seeking compatibility; it is a top-tier state, not every shinjutsu.'
    },
    haki_obs: {
        Basic: 'Senses nearby presence, emotion, and hostile intent in a limited way.',
        Proficient: 'Reads intent and movement more reliably, supporting evasive timing and awareness.',
        Mastered: 'Tracks distant presences and combat rhythm with high precision.',
        'Future Sight': 'Briefly sees likely immediate futures through focused calm. It can be disrupted by surprise, emotional instability, or faster changing conditions.',
        'Killer of Obs.': 'Shanks-style Observation Haki suppression that interferes with an opponent’s Future Sight; it is not blanket mind control or omniscience.'
    },
    haki_arm: {
        Basic: 'Coats attacks or defense with invisible Haki to strike Logia bodies and resist impact.',
        Hardening: 'Visible dense armor that strengthens weapons and body parts but consumes focus and stamina.',
        'Emission (Ryou)': 'Projects Armament beyond the body to strike without direct contact or push force through a target.',
        'Internal Destruction': 'Advanced emission that sends Haki inside a target to damage from within; strong will/armor can still resist.',
        'Supreme Mastery': 'Exceptional Armament control across offense, defense, weapons, and emission—not automatic immunity to all abilities.'
    },
    haki_conq: {
        'Latent / Unawakened': 'The potential of a kingly will exists but has not become a reliable technique.',
        'Basic Intimidation': 'Overwhelms weak-willed foes and asserts presence; capable opponents remain conscious.',
        'Advanced Infusion (ACoC)': 'Coats attacks with Conqueror’s Haki for immense no-touch clashes and striking power.',
        'Supreme King (Shanks level)': 'An elite Conqueror’s presence that can project at great range and pressure powerful foes, while still requiring intent and control.'
    },
    weapon: {
        'Bare Fists': 'Unarmed combat relies on the selected fighting style, body, chakra, and Haki; describe contact range and physical risk rather than inventing a hidden weapon.',
        'Kunai/Shuriken': 'Compact thrown tools for marking, feints, traps, and close-range openings—not legendary blades.',
        'Standard Sword': 'A versatile blade whose effectiveness depends on the selected sword style and Haki/chakra reinforcement.',
        'Clima-Tact': 'Nami’s weather staff uses bubbles, heat, and climate manipulation to build weather attacks; it rewards setup.',
        'Kuro Kabuto (Usopp)': 'A massive slingshot designed for Pop Greens and long-range trick ammunition.',
        'War Bow of Ruin (Kidōmaru)': 'Kidōmaru’s huge bow uses spider-web arrows and distance to create high-penetration ambush shots.',
        Shusui: 'A famous black blade with exceptional weight and durability; it favors disciplined sword control.',
        Kubikiribōchō: 'The Executioner’s Blade regenerates by absorbing iron from blood, turning attrition into weapon maintenance.',
        Kusanagi: 'Orochimaru’s extending sword can lengthen unexpectedly and pairs naturally with serpentine attack angles.',
        "Senriku (Van Augur's Rifle)": 'Van Augur’s long rifle is a precision firearm; it becomes extraordinary only when paired with marksmanship, Haki, or teleport positioning.',
        "Yasopp's Flintlock Rifle": 'A veteran sniper’s rifle suited to controlled Haki-coated shots and extreme-range pressure.',
        Enma: 'A grade blade that forcibly draws out its wielder’s Haki; powerful output comes with a control and exhaustion test.',
        Samehada: 'A living shark-skin sword that devours chakra and can reject a wielder; it is a partner with its own appetite.',
        Gunbai: 'A war fan used to redirect attacks, deliver gusts, and support Uchiha-style deflection rather than a generic magic shield.',
        'Supreme Grade (Yoru)': 'A supreme black blade associated with overwhelming reach, durability, and swordsmanship; it needs a swordsman to realize its ceiling.',
        'Murakumogiri (Whitebeard)': 'Whitebeard’s bisento provides massive polearm leverage and quake-delivery reach.',
        'Truth-Seeking Orbs': 'Malleable black spheres that become weapons/shields and disintegrate ordinary ninjutsu on contact. Six Paths/senjutsu interactions and control limits matter.',
        'Scythe (Hidan)': 'A triple-bladed ritual scythe used to draw blood for Jashin’s curse; the blood-and-ritual condition is mandatory.',
        Nuibari: 'A sewing-needle sword with wire that pierces and stitches enemies together or to terrain.',
        Shibuki: 'An explosive-tag sword that turns each slash into a delayed detonation chain.',
        Hiramekarei: 'A chakra-storing dual-handled blade that reshapes into heavy weapons according to the wielder’s chakra.',
        'Kiba (Swords)': 'Twin lightning blades that conduct and amplify lightning release through close-range cuts.',
        Bashōsen: 'The Sage’s treasured fan releases different elemental attacks at enormous chakra cost.',
        'Totsuka Blade': 'A spiritual gourd blade that seals whatever it pierces into a genjutsu-filled sake jar; it requires an actual hit.',
        'Yata Mirror': 'A spiritual shield that adapts its chakra nature to oppose attacks; frame it as exceptional defense, not an excuse to ignore all pressure.',
        'Ragnir (Loki)': 'The build’s legendary Loki weapon should reinforce the selected giant/dragon/lightning identity without inventing unrelated canon mechanics.',
        'Cerberus Saber (Shamrock)': 'The build’s saber contains a Cerberus motif/form, creating multiple biting or bladed angles around a sword strike.',
        'Thorned Hilt Sword (Sommers)': 'A sword with a thorned hilt that naturally pairs with the selected emotional-thorn motif and close-range coercion.',
        'Hassaikai (Kaido)': 'Kaido’s enormous spiked kanabo rewards direct impact, advanced Haki coating, and thunderous club techniques.',
        "Sasuke's Sword": 'A chokutō suited to lightning-chakra channeling, fast draw cuts, and tactical sword-and-ninjutsu combinations.'
    },
    style: {
        Brawler: 'Unarmed pressure, clinch work, and body conditioning; make the chosen powers serve close range.',
        'Ninja Academy': 'Foundational stealth, substitutions, tool work, and team tactics rather than an elite specialization.',
        Swordsmanship: 'Footwork, timing, edge alignment, and decisive cuts; make the selected weapon relevant.',
        'Taijutsu Specialist': 'Body-first combat centered on timing, conditioning, and a chosen striking sequence.',
        Sniper: 'Range estimation, concealment, ammunition economy, and one-shot setup; do not turn it into casual brawling.',
        'Fishman Karate': 'Uses water in the environment or an opponent’s body to transmit shock through fluid; strongest near water.',
        Assassin: 'Information advantage, timing, poison/traps, and escape routes; a clean kill matters more than spectacle.',
        'Gentle Fist': 'Byakugan-assisted chakra-point strikes that disable circulation from inside; it needs precision and close range.',
        Rokushiki: 'The Six Powers: Soru, Geppo, Tekkai, Shigan, Rankyaku, and Kami-e. Blend named forms deliberately rather than treating it as vague super speed.',
        'Haki Master': 'Uses all selected Haki disciplines tactically, choosing perception, defense, internal damage, or kingly pressure by situation.',
        'Eight Gates (Opened)': 'Body-limit release with extreme short-term force and escalating physical cost. State which gate/level is used if recoil matters.',
        'Black Leg Style': 'A leg-only martial art emphasizing flaming kicks, aerial movement, and protecting the hands for cooking.',
        'Santoryu (Three Sword Style)': 'A three-blade system including a sword held in the mouth; attacks use unusual angles and simultaneous cuts.',
        'Kitsunebi-ryu (Foxfire)': 'Swordsmanship that cuts or manipulates flames, allowing a blade path to answer fire techniques.',
        'Strong Fist': 'A direct, bone-and-muscle damaging striking school focused on ordinary physical impact.',
        'Drunken Fist': 'Unpredictable loose movement that disrupts reads, but control and sobriety remain practical limits.',
        'Frog Kata': 'Toad Sage close combat that uses invisible natural-energy reach around the body for delayed or near-miss impacts.'
    },
    summon: {
        Dogs: 'Tracking and coordinated pack pressure; individual size and training should be proportional.',
        Hawks: 'Aerial scouting, message delivery, and diving interference rather than an automatic combat win.',
        Toads: 'A contract with varied toad allies; sage wisdom, oil, song genjutsu, or size depend on the specific summoned toad.',
        Snakes: 'Constricting, venomous, burrowing, or scouting allies that naturally pair with stealth and ambush.',
        Slugs: 'Healing, communication through division, and acid defense; their support value matters as much as offense.',
        Baku: 'A vacuum beast whose inhale pulls in terrain and attacks; give it a direction and avoid friendly-fire blind spots.',
        'Monkey King Enma': 'Mythic crossover evolution of Monkey Enma. Base form is an intelligent ally or adamantine extending staff. Sun Wukong-inspired Ruyi Jingu Bang and inheritance powers exist only when explicitly unlocked by RESOLVED BUILD RULES; never infer immortality or extra powers from the name.',
        'Monkey Enma': 'The Monkey King can transform into an adamantine staff and fight as an intelligent partner.',
        'Gedo Statue': 'A colossal, dangerous husk tied to the Rinnegan and tailed-beast chakra. Summoning it has immense cost and consequence.',
        'Sea Kings': 'Colossal sea creatures that dominate ocean battles but are impractical far from a navigable body of water.',
        Crows: 'Scouting, misdirection, and ominous dispersal tactics; use flock positioning rather than raw force.',
        Spiders: 'Web traps, sensing strands, and terrain control that become stronger with prepared anchors.',
        'Salamander (Ibuse)': 'Hanzo’s giant salamander releases potent poison mist; ventilation and ally safety are meaningful constraints.',
        'Kamatari (Weasel)': 'A wind-scythe weasel whose fan-driven gusts carve wide lanes through obstacles.'
    }
};

export function getLoreCapsule(category, name) {
    return LORE[category]?.[name] || null;
}

export const CROSSVERSE_LORE_RULES = `
CANON & CROSSVERSE RULES:
- Treat the selected canon capsules as ground truth. Do not grant an unselected technique merely because a vessel, clan, eye, or rarity is famous for it.
- Preserve conditions and costs: Devil Fruit users are weakened by seawater/seastone; Logia intangibility is bypassed by Haki; Haki is willpower, chakra is life/spiritual energy, and neither automatically substitutes for the other.
- A hax ability is conditional leverage, not an "I win" button. State its trigger, target, or counterplay when it is central to a move.
- Reconcile contradictions through tactics. For example, sea weakness, an exhausted Sage Mode, or a weapon that drains its owner should create tension instead of being ignored.
- Keep canon separate from crossover invention. New move names and the character's history can be original; their mechanics must be traceable to selected traits.
`.trim();

export function getCanonicalLoreBrief(build) {
    const entries = Object.entries(build || {})
        .filter(([, item]) => item?.name && item.name !== 'None')
        .map(([category, item]) => {
            const note = LORE[category]?.[item.name];
            return note ? `- ${category}: ${item.name} — ${note}` : null;
        })
        .filter(Boolean);

    return entries.length
        ? `SELECTED CANON CAPSULES:\n${entries.join('\n')}`
        : 'SELECTED CANON CAPSULES: No special ability capsule was selected.';
}
