import { RecipeField, RecipeModel, RecipeValidation } from '../lib/decors';
import { MakingError, MakingTypeCheckError } from '../lib/define';
import { MakeRepository } from '../lib/make';

@RecipeModel()
class A {
    @RecipeField({ skipTypeCheck: true })
    data: any
}

@RecipeModel()
class AA extends A {
}

@RecipeModel()
class C {
    @RecipeField()
    data: number
}

@RecipeModel()
class B {
    @RecipeField()
    a: A
}

@RecipeModel(() => {const v = new FactoryClass(); v.a = new A(); v.a.data = 1000; return v})
class FactoryClass {
    @RecipeField()
    a: A
}

@RecipeModel()
class ValidatedFieldClass {
    @RecipeField({ validation: (f, v) => v.data > 100 })
    a: A
}

@RecipeValidation(v => v.a != null)
@RecipeModel()
class ValidatedClass {
    @RecipeField({ skipTypeCheck: true })
    a: A
}

describe("# Recipe", () => {
    let make = new MakeRepository();

    beforeAll(() => {
        RecipeModel.get().forEach(r => {
            make.add(r.name, r.recipe())
        })
    })

    test('make simple recipe class should be ok with valid config', () => {
        const res = new A()
        res.data = '100'
        expect(make.make({$$type: 'A', data: '100'})).toEqual(res)
    })

    test('make simple recipe class should fail with invalid config', () => {
        expect(() => make.make({$$type: 'C', data: 'abc'})).toThrow(MakingTypeCheckError)
    })

    test('make nested recipe class should be ok with valid config', () => {
        const res = new B()
        res.a = new A()
        res.a.data = 100
        expect(make.make({$$type: 'B', a: {
            data: 100
        }})).toEqual(res)
    })

    test('make nested recipe class with children class should be ok with valid config', () => {
        const res = new B()
        res.a = new AA()
        res.a.data = 100
        expect(make.make({$$type: 'B', a: {
            $$type: 'AA',
            data: 100
        }})).toEqual(res)
    })

    test('make nested recipe class class should fail ok invalid class', () => {
        expect(() => make.make({$$type: 'B', a: {
            $$type: 'C',
            data: 100
        }})).toThrow(MakingTypeCheckError)
    })

    test('make multiple-level nested recipe class with children class should be ok with valid config', () => {
        const res = new A()
        res.data = new B()
        res.data.a = new AA()
        res.data.a.data = new B()
        res.data.a.data.a = new A()
        res.data.a.data.a.data = new C()
        res.data.a.data.a.data.data = 100
        expect(make.make({data: {$$type: 'B', a: {
            $$type: 'AA',
            data: {
                $$type: 'B',
                a: {data: {
                    $$type: 'C',
                    data: 100
                }}
            }
        }}}, { preferredType: A })).toEqual(res)
    })

    test('make multiple-level nested recipe class with children class should fail with invalid config in deep level', () => {
        const res = new A()
        res.data = new B()
        res.data.a = new AA()
        res.data.a.data = new B()
        res.data.a.data.a = new A()
        res.data.a.data.a.data = new C()
        res.data.a.data.a.data.data = 100
        expect(() => make.make({data: {$$type: 'B', a: {
            $$type: 'AA',
            data: {
                $$type: 'B',
                a: {data: {
                    $$type: 'C',
                    data: 'abc'
                }}
            }
        }}}, { preferredType: A })).toThrow(MakingTypeCheckError)
    })

    test('factory class should work well', () => {
        const res = new FactoryClass()
        res.a = new A()
        res.a.data = 1000
        expect(make.make({$$type: 'FactoryClass'})).toEqual(res)
    })

    test('field validation should be ok with valid config', () => {
        const res = new ValidatedFieldClass()
        res.a = new A()
        res.a.data = 1000
        expect(make.make({$$type: 'ValidatedClass', a: { data: 1000 }})).toEqual(res)
    })

    test('field validation should fail with invalid config', () => {
        expect(() => make.make({$$type: 'ValidatedFieldClass', a: { data: 10 }})).toThrow(MakingError)
    })

    test('class validation should be ok with valid config', () => {
        const res = new ValidatedClass()
        res.a = new A()
        expect(make.make({$$type: 'ValidatedClass', a: {}})).toEqual(res)
    })

    test('field validation should fail with invalid config', () => {
        expect(() => make.make({$$type: 'ValidatedClass'})).toThrow(MakingError)
    })
});