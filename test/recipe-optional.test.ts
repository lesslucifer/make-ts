import { RecipeField, RecipeModel, RecipeValidation } from '../lib/decors';
import { MakingError, MakingTypeCheckError } from '../lib/define';
import { MakeRepository } from '../lib/make';

@RecipeModel()
class DataClass {
    constructor(data?: any) {
        this.data = data
    }

    @RecipeField({ skipTypeCheck: true })
    data: any
}

@RecipeModel()
class DataClass2 {
    constructor(data?: any) {
        this.data = data
    }

    @RecipeField({ skipTypeCheck: true })
    data: any
}

@RecipeModel()
class TestClass {
    @RecipeField()
    defaultField: DataClass

    @RecipeField({ optional: true })
    optionalField?: DataClass

    @RecipeField({ skipTypeCheck: true })
    noTypeCheckField?: DataClass
}

describe("# Recipe with optional", () => {
    let make = new MakeRepository();

    beforeAll(() => {
        RecipeModel.addToMakeRepo(make, DataClass)
        RecipeModel.addToMakeRepo(make, DataClass2)
        RecipeModel.addToMakeRepo(make, TestClass)
    })

    test('make with full config should be ok', () => {
        const res = new TestClass()
        res.defaultField = new DataClass(10)
        res.optionalField = new DataClass(20)
        res.noTypeCheckField = new DataClass(30)
        expect(make.newContext().make({
            $$type: 'TestClass',
            defaultField: { data: 10 },
            optionalField: { data: 20 },
            noTypeCheckField: { data: 30 }
        })).toEqual(res)
    })

    test('make with no optional field should be ok', () => {
        const res = new TestClass()
        res.defaultField = new DataClass(10)
        res.noTypeCheckField = new DataClass(30)
        expect(make.newContext().make({
            $$type: 'TestClass',
            defaultField: { data: 10 },
            noTypeCheckField: { data: 30 }
        })).toEqual(res)
    })

    test('make with no skipTypeCheck field should be ok', () => {
        const res = new TestClass()
        res.defaultField = new DataClass(10)
        res.optionalField = new DataClass(20)
        expect(make.newContext().make({
            $$type: 'TestClass',
            defaultField: { data: 10 },
            optionalField: { data: 20 },
        })).toEqual(res)
    })

    test('make with invalid class optional field should fail', () => {
        expect(() => make.newContext().make({
            $$type: 'TestClass',
            defaultField: { data: 10 },
            optionalField: { $$type: 'DataClass2' },
            noTypeCheckField: { data: 30 }
        })).toThrow(MakingTypeCheckError)
    })

    test('make with invalid class for normal field should fail', () => {
        expect(() => make.newContext().make({
            $$type: 'TestClass',
            defaultField: { $$type: 'DataClass2' },
            optionalField: { data: 20 },
            noTypeCheckField: { data: 30 }
        })).toThrow(MakingTypeCheckError)
    })

    test('make with invalid class skipTypeCheck field should be ok', () => {
        const res = new TestClass()
        res.defaultField = new DataClass(10)
        res.optionalField = new DataClass(20)
        res.noTypeCheckField = new DataClass2(30)
        expect(make.newContext().make({
            $$type: 'TestClass',
            defaultField: { data: 10 },
            optionalField: { data: 20 },
            noTypeCheckField: { $$type: 'DataClass2', data: 30 }
        })).toEqual(res)
    })
});