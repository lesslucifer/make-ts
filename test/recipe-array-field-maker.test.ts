import {  RecipeField, RecipeModel } from '../lib/decors';
import { InvalidMakeConfigError, MakingTypeCheckError } from '../lib/define';
import { MakeRepository } from '../lib/make';

@RecipeModel()
class SimpleArrayField {
    @RecipeField({type: () => Number})
    arr: number[]

    constructor(arr?: number[]) { this.arr = arr }
}

@RecipeModel()
class UncheckedArrayField {
    @RecipeField({ skipTypeCheck: true })
    arr: any[]

    constructor(arr?: any[]) { this.arr = arr }
}

@RecipeModel()
class A {
    @RecipeField({ skipTypeCheck: true })
    data: any

    constructor(data?: any) { this.data = data }
}

@RecipeModel()
class AA extends A {
}

@RecipeModel()
class C {
    @RecipeField()
    data: number

    constructor(data?: any) { this.data = data }
}

@RecipeModel()
class CheckedArrayField {
    @RecipeField({ type: () => A })
    arr: A[]

    constructor(arr?: any[]) { this.arr = arr }
}

@RecipeModel()
class CheckedArrayFieldSkipTypeCheck {
    @RecipeField({ type: () => A, skipTypeCheck: true })
    arr: A[]

    constructor(arr?: any[]) { this.arr = arr }
}

describe("# Recipe Custom Maker", () => {
    let make = new MakeRepository();

    beforeAll(() => {
        RecipeModel.addToMakeRepo(make, SimpleArrayField)
        RecipeModel.addToMakeRepo(make, UncheckedArrayField)
        RecipeModel.addToMakeRepo(make, A)
        RecipeModel.addToMakeRepo(make, AA)
        RecipeModel.addToMakeRepo(make, C)
        RecipeModel.addToMakeRepo(make, CheckedArrayField)
        RecipeModel.addToMakeRepo(make, CheckedArrayFieldSkipTypeCheck)
    })

    test('simple array field should work with valid config', () => {
        expect(make.newContext().make({$$type: 'SimpleArrayField', arr: [1, 2, 3]})).toEqual(new SimpleArrayField([1, 2,3]))
    })

    test('simple array field should fail with non-array field', () => {
        expect(() => make.newContext().make({$$type: 'SimpleArrayField', arr: {}})).toThrow(InvalidMakeConfigError)
    })

    test('simple array field should work with convert type', () => {
        expect(make.newContext().make({$$type: 'SimpleArrayField', arr: [1, '2', 3]})).toEqual(new SimpleArrayField([1, 2, 3]))
    })

    test('unchecked array field should work any type', () => {
        expect(make.newContext().make({$$type: 'UncheckedArrayField', arr: [1, '2', 3, true, null]})).toEqual(new UncheckedArrayField([1, '2', 3, true, null]))
    })

    test('checked array field should work with valid config', () => {
        expect(make.newContext().make({$$type: 'CheckedArrayField', arr: [{data: 10}, {data: 20}, {data: 100}]})).toEqual(
            new CheckedArrayField([new A(10), new A(20), new A(100)]))
    })

    test('checked array field should work with inheritance', () => {
        expect(make.newContext().make({$$type: 'CheckedArrayField', arr: [{$$type: 'AA', data: 10}, {$$type: 'AA', data: 20}, {data: 100}]})).toEqual(
            new CheckedArrayField([new AA(10), new AA(20), new A(100)]))
    })

    test('checked array field should fail with invalid element type', () => {
        expect(() => make.newContext().make({$$type: 'CheckedArrayField', arr: [{$$type: 'C', data: 10}, {$$type: 'AA', data: 20}, {data: 100}]})).toThrow(MakingTypeCheckError)
    })

    test('checked array field should work with invalid element type but disable type check', () => {
        expect(make.newContext().make({$$type: 'CheckedArrayFieldSkipTypeCheck', arr: [{$$type: 'C', data: 10}, {$$type: 'AA', data: 20}, {data: 100}]})).toEqual(
            new CheckedArrayFieldSkipTypeCheck([new C(10), new AA(20), new A(100)]))
    })
});