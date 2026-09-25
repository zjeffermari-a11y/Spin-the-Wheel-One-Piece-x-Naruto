import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CATEGORIES } from '../src/data/categories.js';
import { PROGRESSION_CATEGORIES } from '../src/data/progression.js';
import { awakeningTarget, progressionOptions, resolveBuildMechanics, progressionBonuses } from '../src/utils/buildMechanics.js';
import { calculateBuildStats } from '../src/utils/buildStats.js';
import { calculateSynergies } from '../src/utils/gameLogic.js';
import { OllamaService } from '../src/utils/OllamaService.js';
import CharacterCard from '../src/components/CharacterCard.jsx';

const roll = (name, val = 60) => ({ name, val, rarity: 'R' });
const enma = { summon: roll('Monkey King Enma', 100), weapon: roll('Bare Fists', 0) };
const awakening = stage => ({ name: 'Awakening', target: 'summon', stage, val: stage * 25 });
const category = id => PROGRESSION_CATEGORIES.find(c => c.id === id);

test('seven unique categories follow summon and precede potential', () => {
    assert.equal(PROGRESSION_CATEGORIES.length, 7);
    assert.equal(new Set(CATEGORIES.map(c => c.id)).size, CATEGORIES.length);
    for (const c of PROGRESSION_CATEGORIES) {
        assert.ok(CATEGORIES.indexOf(c) > CATEGORIES.findIndex(c => c.id === 'summon'));
        assert.ok(c.options.length);
    }
    assert.equal(CATEGORIES.find(c => c.id === 'summon').options.find(o => o.name === 'Monkey King Enma').rarity, 'M');
});

test('bond and awakening skip when ineligible without mutating options', () => {
    assert.deepEqual(progressionOptions(category('summon_bond'), {}), []);
    assert.deepEqual(progressionOptions(category('summon_bond'), { summon: roll('None') }), []);
    assert.equal(progressionOptions(category('summon_bond'), enma).length, 6);
    assert.deepEqual(progressionOptions(category('awakening'), {}), []);
    assert.deepEqual(progressionOptions(category('awakening'), { df: roll('Unknown Fruit') }), []);
    const options = progressionOptions(category('awakening'), enma);
    assert.equal(options.length, 5);
    assert.equal(options[3].target, 'summon');
    assert.match(options[3].name, /Monkey King Inheritance/);
    assert.equal(category('awakening').options[3].target, undefined);
});

test('every Enma awakening stage has a distinct bounded unlock', () => {
    const expected = ['Adamantine Partner', 'Ruyi Resonance', 'Ruyi Jingu Bang', 'Monkey King Mantle', 'Great Sage Inheritance'];
    for (let stage = 0; stage <= 4; stage++) {
        const result = resolveBuildMechanics({ ...enma, awakening: awakening(stage) });
        assert.equal(result.abilities.at(-1).name, expected[stage]);
        assert.equal(result.abilities.length, stage + 1);
    }
});

test('weapon mastery unlocks staff cage without inventing awakening', () => {
    const result = resolveBuildMechanics({ ...enma, weapon_mastery: roll('Master'), ability_mastery: roll('Transcendent', 100) });
    assert.deepEqual(result.abilities.map(a => a.name), ['Adamantine Partner', 'Staff Cage']);
});

test('poor mastery and bond do not erase awakening access', () => {
    const result = resolveBuildMechanics({ ...enma, awakening: awakening(3), weapon_mastery: roll('Novice', 20), summon_bond: roll('Reluctant', 20) });
    assert.ok(result.abilities.some(a => a.name === 'Monkey King Mantle'));
    assert.ok(!result.abilities.some(a => a.name === 'Staff Cage'));
});

test('legacy Monkey Enma remains a base summon; Enma sword grants no summon', () => {
    assert.equal(resolveBuildMechanics({ summon: roll('Monkey Enma'), awakening: awakening(4) }).abilities.length, 1);
    assert.equal(resolveBuildMechanics({ weapon: roll('Enma'), awakening: awakening(4) }).abilities.length, 0);
    assert.deepEqual(Object.values(progressionBonuses({ summon: roll('Monkey Enma') })), Array(9).fill(0));
});

test('awakening applies to a single eligible source with explicit mechanics', () => {
    for (const name of ['Hito Hito: Nika', 'Ito Ito', 'Mochi Mochi']) {
        const build = { df: roll(name) };
        assert.equal(awakeningTarget(build).id, 'df');
        const options = progressionOptions(category('awakening'), build);
        assert.equal(resolveBuildMechanics({ ...build, awakening: options[0] }).abilities.length, 0);
        assert.equal(resolveBuildMechanics({ ...build, awakening: options[2] }).abilities.length, 1);
    }
    const build = { ...enma, df: roll('Hito Hito: Nika'), awakening: awakening(4) };
    assert.equal(awakeningTarget(build).id, 'summon');
    assert.ok(!resolveBuildMechanics(build).abilities.some(a => /Fruit/.test(a.name)));
    assert.equal(resolveBuildMechanics({ ...enma, awakening: { ...awakening(4), target: 'df' } }).stage, 0);
});

test('weapon mastery counts Enma and another weapon only once', () => {
    const build = { ...enma, weapon_mastery: roll('Unrivaled', 95) };
    assert.equal(progressionBonuses(build).abl, progressionBonuses({ ...build, weapon: roll('Yoru') }).abl);
    assert.equal(progressionBonuses({ weapon: roll('Bare Fists'), weapon_mastery: roll('Unrivaled', 95) }).abl, 0);
});

test('ambition has no numeric bonus and mastery does not manufacture hax', () => {
    assert.deepEqual(calculateBuildStats({}), calculateBuildStats({ ambition: roll('Surpass the Gods', 100) }));
    const result = calculateBuildStats({ ability_mastery: roll('Transcendent', 100), weapon_mastery: roll('Weapon Sovereign', 100), chakra_control: roll('Perfect', 100), stamina: roll('Mythic Endurance', 100) });
    assert.equal(result.stats.hax, 0);
    assert.ok(Object.values(result.stats).every(v => Number.isFinite(v) && v >= 0 && v <= 100));
});

test('Enma synergy requires both mastery and bond', () => {
    const build = { ...enma, weapon_mastery: roll('Master'), summon_bond: roll('Trusted') };
    assert.ok(calculateSynergies(build).list.some(s => s.name === 'One Staff, Two Minds'));
    assert.ok(!calculateSynergies({ ...build, summon_bond: roll('Reluctant', 20) }).list.some(s => s.name === 'One Staff, Two Minds'));
});

test('bio and synergy generation receive the same resolved unlock rules', async () => {
    const service = new OllamaService();
    const calls = [];
    service.generateContent = async (prompt, system) => {
        calls.push({ prompt, system });
        return { epithet: 'Branches Across a Copper Dawn', signature_abilities: [] };
    };
    const build = { ...enma, awakening: awakening(3), ambition: roll('Protect My Homeland') };
    await service.generateBio(build, { str: 12, spd: 13, dur: 14, iq: 15, haki: 16, pwr: 17, hax: 18 });
    await service.generateSynergies(build);
    for (const { prompt } of calls) {
        assert.match(prompt, /RESOLVED BUILD RULES/);
        assert.match(prompt, /Monkey King Mantle/);
        assert.match(prompt, /Protect My Homeland/);
        assert.doesNotMatch(prompt, /Great Sage Inheritance:/);
    }
    assert.match(calls[0].prompt, /APEX: HAX \(18\), PWR \(17\), HAKI \(16\)/);
});

test('character card renders mastery and resolved unlocks, including legacy builds', () => {
    const html = renderToStaticMarkup(React.createElement(CharacterCard, { build: { ...enma, weapon_mastery: roll('Master'), awakening: awakening(3) }, stats: {}, lore: {}, synergies: [] }));
    assert.match(html, /WEAPON MASTERY/);
    assert.match(html, /Monkey King Mantle/);
    assert.match(html, /Unlocked Abilities/);
    assert.doesNotThrow(() => renderToStaticMarkup(React.createElement(CharacterCard, { build: {}, stats: {}, lore: {}, synergies: [] })));
});
