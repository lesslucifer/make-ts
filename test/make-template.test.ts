import { RecipeField, RecipeModel, RecipeValidation } from '../lib/decors';
import { InvalidMakeConfigError, MakingError, MakingTypeCheckError } from '../lib/define';
import { MakeRepository } from '../lib/make';

@RecipeModel()
class SimpleClass {
    @RecipeField({ skipTypeCheck: true })
    data: any

    constructor(data: any) { this.data = data }
}

@RecipeModel()
class SimpleClass2 {
    @RecipeField({ skipTypeCheck: true })
    data: any

    constructor(data: any) { this.data = data }
}

describe("# Make with template", () => {
    let make = new MakeRepository();

    beforeAll(() => {
        RecipeModel.addToMakeRepo(make, SimpleClass)
        RecipeModel.addToMakeRepo(make, SimpleClass2)
    })

    test('make object with empty template should be ok', () => {
        make.addTemplate('A', {$$type: 'SimpleClass', data: 100})
        expect(make.newContext().make({$$template: [], $$type: 'SimpleClass', data: 100})).toEqual(new SimpleClass(100))
    })

    test('make object with simple template should be ok', () => {
        make.addTemplate('A', {$$type: 'SimpleClass', data: 100})
        expect(make.newContext().make({$$template: 'A'})).toEqual(new SimpleClass(100))
    })

    test('make object with simple template and config should be ok', () => {
        make.addTemplate('A', {$$type: 'SimpleClass', data: 100})
        expect(make.newContext().make({$$template: 'A', data: 300})).toEqual(new SimpleClass(300))
    })

    test('make object with template and type override should be ok', () => {
        make.addTemplate('A', {$$type: 'SimpleClass', data: 100})
        expect(make.newContext().make({$$template: 'A', $$type: 'SimpleClass2'})).toEqual(new SimpleClass2(100))
    })

    test('make object with multiple templates should be ok', () => {
        make.addTemplate('A', {$$type: 'SimpleClass', data: 100})
        make.addTemplate('B', {$$type: 'SimpleClass2', data: 400})
        expect(make.newContext().make({$$template: ['A', 'B']})).toEqual(new SimpleClass2(400))
    })

    test('make object with invalid templates should fail', () => {
        make.addTemplate('A', {$$type: 'SimpleClass', data: 100})
        expect(() => make.newContext().make({$$template: ['A', 'X']})).toThrow(InvalidMakeConfigError)
        expect(() => make.newContext().make({$$template: ['A', {}]})).toThrow(InvalidMakeConfigError)
        expect(() => make.newContext().make({$$template: ['A', 0]})).toThrow(InvalidMakeConfigError)
        expect(() => make.newContext().make({$$template: ['A', null]})).toThrow(InvalidMakeConfigError)
        expect(() => make.newContext().make({$$template: ['A', 'BB']})).toThrow(InvalidMakeConfigError)
        expect(() => make.newContext().make({$$template: [undefined]})).toThrow(InvalidMakeConfigError)
    })

    test('make object with multiple templates should fail for invalid type', () => {
        make.addTemplate('A', {$$type: 'SimpleClass', data: 100})
        expect(() => make.newContext().make({$$template: 'A'}, { preferredType: SimpleClass2 })).toThrow(MakingTypeCheckError)
    })

    test('make object with multiple templates should work with invalid type and skipTypeCheck', () => {
        make.addTemplate('A', {$$type: 'SimpleClass', data: 100})
        expect(make.newContext().make({$$template: 'A'}, { preferredType: SimpleClass2, skipTypeCheck: true })).toEqual(new SimpleClass(100))
    })
});