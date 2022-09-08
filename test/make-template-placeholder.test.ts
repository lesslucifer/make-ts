import { RecipeField, RecipeModel, RecipeValidation } from '../lib/decors';
import { InvalidMakeConfigError, MakingError, MakingTypeCheckError } from '../lib/define';
import { MakeRepository } from '../lib/make';

@RecipeModel()
class SimpleClass {
    @RecipeField({ skipTypeCheck: true })
    data: number

    constructor(data: any) { this.data = data }
}

@RecipeModel()
class SimpleClass2 {
    @RecipeField({ skipTypeCheck: false })
    data: number

    constructor(data: any) { this.data = data }
}

describe("# Make with template + placeholder", () => {
    let make = new MakeRepository();

    beforeAll(() => {
        RecipeModel.addToMakeRepo(make, SimpleClass)
        RecipeModel.addToMakeRepo(make, SimpleClass2)
    })

    test('make object with simple placeholder should be ok', () => {
        make.addTemplate('A', { $$type: 'SimpleClass', data: '$$data' })
        expect(make.newContext().make({ $$template: [{ name: 'A', placeholders: { data: 100 } }] })).toEqual(new SimpleClass(100))
    })

    test('make object with no placeholder should be ok', () => {
        make.addTemplate('A', { $$type: 'SimpleClass', data: '$$data' })
        expect(make.newContext().make({ $$template: [{ name: 'A' }] })).toEqual(new SimpleClass(undefined))
    })

    test('make object with no placeholder should fail with type check', () => {
        make.addTemplate('A', { $$type: 'SimpleClass2', data: '$$data' })
        expect(() => make.newContext().make({ $$template: [{ name: 'A' }] })).toThrow(MakingTypeCheckError)
        expect(() => make.newContext().make({ $$template: 'A' })).toThrow(MakingTypeCheckError)
    })

    test('make object with object placeholder should be ok', () => {
        make.addTemplate('A', { $$type: 'SimpleClass', data: { $$placeholder: 'data' } })
        expect(make.newContext().make({ $$template: [{ name: 'A', placeholders: { data: 100 } }] })).toEqual(new SimpleClass(100))
    })

    test('make object with object placeholder and no data should be ok', () => {
        make.addTemplate('A', { $$type: 'SimpleClass', data: { $$placeholder: 'data' } })
        expect(make.newContext().make({ $$template: [{ name: 'A' }] })).toEqual(new SimpleClass(undefined))
    })

    test('make object with object placeholder and no data should fail with type check', () => {
        make.addTemplate('A', { $$type: 'SimpleClass2', data: { $$placeholder: 'data' } })
        expect(() => make.newContext().make({ $$template: [{ name: 'A' }] })).toThrow(MakingTypeCheckError)
        expect(() => make.newContext().make({ $$template: 'A' })).toThrow(MakingTypeCheckError)
    })

    test('make object with object placeholder and default value should be ok', () => {
        make.addTemplate('A', { $$type: 'SimpleClass', data: { $$placeholder: 'data', $$default: 1000 } })
        expect(make.newContext().make({ $$template: [{ name: 'A', placeholders: { data: 100 } }] })).toEqual(new SimpleClass(100))
    })

    test('make object with object placeholder and no data should use default value', () => {
        make.addTemplate('A', { $$type: 'SimpleClass', data: { $$placeholder: 'data', $$default: 1000 } })
        expect(make.newContext().make({ $$template: [{ name: 'A' }] })).toEqual(new SimpleClass(1000))
    })

    test('make object with object placeholder and no data should not fail with type check', () => {
        make.addTemplate('A', { $$type: 'SimpleClass2', data: { $$placeholder: 'data', $$default: 1000 } })
        expect(make.newContext().make({ $$template: [{ name: 'A' }] })).toEqual(new SimpleClass(1000))
        expect(make.newContext().make({ $$template: 'A' })).toEqual(new SimpleClass(1000))
    })
});