import { RecipeField, RecipeModel, RecipeValidation } from '../lib/decors';
import { InvalidMakeConfigError, MakingError, MakingTypeCheckError } from '../lib/define';
import { MakeRepository } from '../lib/make';

@RecipeModel()
class SimpleClass {
    @RecipeField({ skipTypeCheck: true })
    data: any

    constructor(data: any) { this.data = data }
}

describe("# Make with template", () => {
    let make = new MakeRepository();

    beforeAll(() => {
        RecipeModel.addToMakeRepo(make, SimpleClass)
        make.addRef('a', 100)
        make.addRef('b', 'xyz')
        make.addRef('c', {hello: 100})
        make.addRef('obj', new SimpleClass(100))
    })

    test('make object with direct ref should be ok', () => {
        expect(make.newContext().make('$#obj')).toEqual(new SimpleClass(100))
    })

    test('make object with field ref should be ok', () => {
        expect(make.newContext().make({$$type: 'SimpleClass', data: '$#a'})).toEqual(new SimpleClass(100))
        expect(make.newContext().make({$$type: 'SimpleClass',data: '$#b'})).toEqual(new SimpleClass('xyz'))
        expect(make.newContext().make({$$type: 'SimpleClass',data: '$#c'})).toEqual(new SimpleClass({hello: 100}))
        expect(make.newContext().make({$$type: 'SimpleClass',data: '$#obj'})).toEqual(new SimpleClass(new SimpleClass(100)))
    })

    test('make object with ref should be ok with correct type', () => {
        expect(make.newContext().make('$#a', { preferredType: Number })).toEqual(100)
        expect(make.newContext().make('$#b', { preferredType: String })).toEqual('xyz')
        expect(make.newContext().make('$#c', { preferredType: Object })).toEqual({hello: 100})
        expect(make.newContext().make('$#obj', { preferredType: SimpleClass })).toEqual(new SimpleClass(100))
    })

    test('make object with ref should fail with invalid type', () => {
        expect(() => make.newContext().make('$#a', { preferredType: String })).toThrow(MakingTypeCheckError)
        expect(() => make.newContext().make('$#b', { preferredType: Number })).toThrow(MakingTypeCheckError)
        expect(() => make.newContext().make('$#c', { preferredType: Number })).toThrow(MakingTypeCheckError)
        expect(() => make.newContext().make('$#obj', { preferredType: String })).toThrow(MakingTypeCheckError)
    })

    test('make object with ref should be ok with incorrect type but skipTypeCheck', () => {
        expect(make.newContext().make('$#a', { preferredType: String, skipTypeCheck: true })).toEqual(100)
        expect(make.newContext().make('$#b', { preferredType: Number, skipTypeCheck: true })).toEqual('xyz')
        expect(make.newContext().make('$#c', { preferredType: Number, skipTypeCheck: true })).toEqual({hello: 100})
        expect(make.newContext().make('$#obj', { preferredType: String, skipTypeCheck: true })).toEqual(new SimpleClass(100))
    })
});