import { RecipeField, RecipeModel, RecipeValidation } from '../lib/decors';
import { InvalidMakeConfigError, MakingError, MakingTypeCheckError } from '../lib/define';
import { MakeRepository } from '../lib/make';


describe("# Resolve config", () => {
    let make = new MakeRepository();

    beforeAll(() => {
    })

    test('simple config should be unchanged after resolving', () => {
        const config = {
            'data': 100,
            'data2': 'abc'
        }
        expect(make.newContext().resolveConfig(config)).toEqual(config)
    })

    test('array config should be unchanged after resolving', () => {
        const config = {
            'data': 100,
            'data2': 'abc',
            'arr': [1, 'abc', null, undefined]
        }
        expect(make.newContext().resolveConfig(config)).toEqual(config)
    })

    test('object config should be unchanged after resolving', () => {
        const config = {
            'data': 100,
            'data2': 'abc',
            'object': {
                'x': 1,
                'y': null,
                'z': undefined
            }
        }
        expect(make.newContext().resolveConfig(config)).toEqual(config)
    })

    test('simple config with template should be resolved', () => {
        make.addTemplate('A', { $$type: 'SimpleClass', data: 100 })
        expect(make.newContext().resolveConfig({ $$template: 'A' })).toEqual({ $$type: 'SimpleClass', data: 100 })
    })

    test('arr config with template should be resolved', () => {
        make.addTemplate('A', { $$type: 'SimpleClass', data: 100 })
        expect(make.newContext().resolveConfig({
            'arr': [{ $$template: 'A' }, null, undefined, 100, 'x']
        })).toEqual({
            'arr': [{ $$type: 'SimpleClass', data: 100 }, null, undefined, 100, 'x']
        })
    })

    test('object config with template should be resolved', () => {
        make.addTemplate('A', { $$type: 'SimpleClass', data: 100 })
        expect(make.newContext().resolveConfig({
            'obj': {
                'a': { $$template: 'A' },
                'b': null,
                'c': undefined,
                'd': 100,
                'e': 'x'
            }
        })).toEqual({
            'obj': {
                'a': { $$type: 'SimpleClass', data: 100 },
                'b': null,
                'c': undefined,
                'd': 100,
                'e': 'x'
            }
        })
    })

    test('complex config with template should be resolved', () => {
        make.addTemplate('A', { $$type: 'SimpleClass', data: 100 })
        expect(make.newContext().resolveConfig({
            '$$template': 'A',
            'arr': [100, {
                'a': { $$template: 'A' },
                'b': null,
                'c': undefined,
                'd': 100,
                'e': [{ $$template: 'A' }, null, undefined, 100, 'x']
            }]
        })).toEqual({
            $$type: 'SimpleClass',
            data: 100,
            'arr': [100, {
                'a': { $$type: 'SimpleClass', data: 100 },
                'b': null,
                'c': undefined,
                'd': 100,
                'e': [{ $$type: 'SimpleClass', data: 100 }, null, undefined, 100, 'x']
            }]
        })
    })

    test('config with multi-level template should be resolved', () => {
        make.addTemplate('A', { $$template: 'B', dataA: 'a' })
        make.addTemplate('B', { $$template: 'C', dataB: 100 })
        make.addTemplate('C', { $$template: 'D' })
        make.addTemplate('D', { $$type: 'SimpleClass', data: 100 })
        expect(make.newContext().resolveConfig({ $$template: 'A' })).toEqual({ $$type: 'SimpleClass', dataA: 'a', dataB: 100, data: 100 })
    })

    test('arr config with template should be resolved', () => {
        make.addTemplate('A', { $$template: 'B', dataA: 'a' })
        make.addTemplate('B', { $$template: 'C', dataB: 100 })
        make.addTemplate('C', { $$template: 'D' })
        make.addTemplate('D', { $$type: 'SimpleClass', data: 100 })

        expect(make.newContext().resolveConfig({
            'arr': [{ $$template: 'A' }, null, undefined, 100, 'x']
        })).toEqual({
            'arr': [{ $$type: 'SimpleClass', dataA: 'a', dataB: 100, data: 100 }, null, undefined, 100, 'x']
        })
    })

    test('object config with template should be resolved', () => {
        make.addTemplate('A', { $$template: 'B', dataA: 'a' })
        make.addTemplate('B', { $$template: 'C', dataB: 100 })
        make.addTemplate('C', { $$template: 'D' })
        make.addTemplate('D', { $$type: 'SimpleClass', data: 100 })

        expect(make.newContext().resolveConfig({
            'obj': {
                'a': { $$template: 'A' },
                'b': null,
                'c': undefined,
                'd': 100,
                'e': 'x'
            }
        })).toEqual({
            'obj': {
                'a': { $$type: 'SimpleClass', dataA: 'a', dataB: 100, data: 100 },
                'b': null,
                'c': undefined,
                'd': 100,
                'e': 'x'
            }
        })
    })

    test('complex config with multi-level template should be resolved', () => {
        make.addTemplate('A', { $$template: 'B', dataA: 'a' })
        make.addTemplate('B', { $$template: 'C', dataB: 100 })
        make.addTemplate('C', { $$template: 'D' })
        make.addTemplate('D', { $$type: 'SimpleClass', data: 100 })

        expect(make.newContext().resolveConfig({
            '$$template': 'A',
            'arr': [100, {
                'a': { $$template: 'A' },
                'b': null,
                'c': undefined,
                'd': 100,
                'e': [{ $$template: 'A' }, null, undefined, 100, 'x']
            }]
        })).toEqual({
            $$type: 'SimpleClass',
            dataA: 'a',
            dataB: 100,
            data: 100,
            'arr': [100, {
                'a': { $$type: 'SimpleClass', dataA: 'a', dataB: 100, data: 100 },
                'b': null,
                'c': undefined,
                'd': 100,
                'e': [{ $$type: 'SimpleClass', dataA: 'a', dataB: 100, data: 100 }, null, undefined, 100, 'x']
            }]
        })
    })
});