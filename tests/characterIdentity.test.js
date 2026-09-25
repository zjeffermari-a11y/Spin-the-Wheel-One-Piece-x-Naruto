import test from 'node:test';
import assert from 'node:assert/strict';
import { opData } from '../src/data/opData.js';
import { narutoData } from '../src/data/narutoData.js';
import { resolveCharacterIdentity } from '../src/utils/characterIdentity.js';
import { OllamaService } from '../src/utils/OllamaService.js';

test('every selectable character has explicit identity, including legacy name-only builds', () => {
    for (const vessel of [...opData, ...narutoData]) {
        assert.ok(['M', 'F'].includes(vessel.gender), vessel.name);
        const identity = resolveCharacterIdentity({ vessel });
        assert.equal(identity.pronouns, vessel.gender === 'M' ? 'he/him/his/himself' : 'she/her/hers/herself');
        assert.deepEqual(resolveCharacterIdentity({ vessel: { name: vessel.name } }), identity);
    }
});

test('unknown and absent vessels do not default to male', () => {
    for (const vessel of [undefined, { name: 'None' }, { name: 'Custom vessel' }]) {
        assert.deepEqual(resolveCharacterIdentity({ vessel }), { gender: 'unspecified', pronouns: null });
    }
});

test('bio and standalone synergy prompts enforce vessel identity throughout the output', async () => {
    for (const [name, expected] of [['Jiraiya', 'he/him/his/himself'], ['Nami', 'she/her/hers/herself'], ['Haku', 'he/him/his/himself']]) {
        const service = new OllamaService();
        const calls = [];
        service.generateContent = async (prompt, system) => {
            calls.push({ prompt, system });
            return {};
        };
        const build = { vessel: { name }, iq: { name: name === 'Nami' ? 'Jiraiya' : 'Nami' } };
        await service.generateBio(build);
        await service.generateSynergies(build);
        assert.equal(calls.length, 2);
        for (const { prompt, system } of calls) {
            assert.ok(system.includes(expected));
            assert.match(system, /every signature ability, and every synergy/);
            assert.match(system, /Do not use they\/them\/their/);
            assert.doesNotMatch(prompt, /Backstory \(they\/them\)|How their abilities merge/);
        }
        assert.ok(calls[0].prompt.includes(`Backstory (${expected})`));
    }
});
