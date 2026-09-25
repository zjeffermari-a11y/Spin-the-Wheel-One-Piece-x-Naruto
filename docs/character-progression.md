# Character progression rolls

New builds roll Weapon Mastery, Ability Mastery, Chakra Control, Stamina,
Summon Bond, Awakening State and Ambition after the summon category.
Summon Bond is skipped without a summon. Awakening is skipped without an
explicitly supported source. No Mentor, Weakness or social challenge wheels
are included.

## Awakening eligibility

The first applicable source is selected deterministically:

1. Monkey King Enma: original Sun Wukong-inspired crossover inheritance.
2. Nika, Ito Ito or Mochi Mochi: specifically defined fruit awakenings.

When both are selected, Enma receives the awakening; the fruit retains its
base abilities. Unsupported sources retain their base abilities rather than
receiving an invented evolution. Extend the awakening definitions in
`src/utils/buildMechanics.js` to support additional sources.

Enma always supplies an intelligent ally OR an extending adamantine staff,
alongside the separately rolled weapon. Master Weapon Mastery adds Staff
Cage. Stirring adds brief Ruyi Resonance; Partial adds deliberate Ruyi Jingu
Bang control; Awakened adds cloud riding, hair-clone decoys and animal
disguises; Fully Integrated combines those unlocked techniques. The mantle
does not copy unrelated abilities or grant immortality. Low mastery or bond
limits execution and sharing rather than removing unlocked powers.

## Shared rules

`resolveBuildMechanics` supplies deterministic additional abilities to the
character card, Markdown export and AI prompts. `calculateBuildStats` supplies
the same statistics to the app and lore service. AI-generated signature moves
and custom synergies interpret these rules; they do not unlock additional
powers or change calculated stats. Model prose is not a deterministic combat
simulation and still depends on instruction following.

Mastery, control and bond apply small adjustments around a neutral value of
60. Stamina adjusts sustained overall effectiveness instead of damage
resistance. Awakening adds stage-based hax; progression scores themselves do
not count as hax. Ambition has no numerical bonus. Existing rarity selection
behavior is unchanged.

Saved builds retain their existing data and displayed scores. Missing new
rolls add no progression bonuses or penalties. Legacy `Monkey Enma` remains
the original base summon; `Enma` in the weapon slot remains the sword.

## Validation

Run `npm test`, `npm run build` and `npm run lint`. Tests cover eligibility,
all Enma stages, legacy saves, double counting, stat semantics, prompt input
and server-rendered character cards. The lore API is mocked in tests.
