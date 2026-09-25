import { opData } from '../data/opData.js';
import { narutoData } from '../data/narutoData.js';

const characters = new Map([...opData, ...narutoData].map(character => [character.name, character]));

export function resolveCharacterIdentity(build) {
    const vessel = build.vessel;
    const gender = vessel && vessel.name !== 'None'
        ? vessel.gender ?? characters.get(vessel.name)?.gender
        : undefined;
    if (gender === 'M') return { gender: 'male', pronouns: 'he/him/his/himself' };
    if (gender === 'F') return { gender: 'female', pronouns: 'she/her/hers/herself' };
    return { gender: 'unspecified', pronouns: null };
}

export function characterIdentityDirective(build) {
    const { gender, pronouns } = resolveCharacterIdentity(build);
    return `CHARACTER REFERENCE RULE (applies to biography, every signature ability, and every synergy):
${pronouns
        ? `The protagonist uses the selected physical vessel's gender: ${gender}. Use ${pronouns} consistently, with singular verb agreement, or the generated character's name.`
        : "The protagonist's gender is unspecified. Use the generated character's name or 'the fighter'; do not guess a gender."}
Do not use they/them/their/theirs/themself/themselves or contractions of they for the protagonist. For groups, name the group explicitly (for example, 'the snakes').
Battle IQ benchmarks, techniques, summons, race, faction, and borrowed powers do not change the protagonist's gender. Never infer gender from appearance or the generated name. Named supporting characters retain their own identity.`;
}
