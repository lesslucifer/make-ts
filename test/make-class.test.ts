import { MakeConfig, MakingTypeCheckError } from '../lib/define';
import { IMakeOptions, MakeContext, MakeRepository } from '../lib/make';

class A {
    data: any

    static make(ctx: MakeContext, config: MakeConfig, opts: IMakeOptions) {
        const a = new A()
        a.data = ctx.make(config?.['data'], {fieldName: 'data'})
        return a
    }
}

class AA extends A {
    static make(ctx: MakeContext, config: MakeConfig, opts: IMakeOptions) {
        const a = new AA()
        a.data = ctx.make(config?.['data'], {fieldName: 'data'})
        return a
    }
}

class C {
    data: any

    static make(ctx: MakeContext, config: MakeConfig, opts: IMakeOptions) {
        const c = new C()
        c.data = ctx.make(config?.['data'], {
            fieldName: 'data',
            preferredType: Number
        })
        return c
    }
}

class B {
    a: A

    static make(ctx: MakeContext, config: MakeConfig, opts: IMakeOptions) {
        const b = new B()
        b.a = ctx.make(config?.['a'], {
            fieldName: 'a',
            preferredType: A
        })
        return b
    }
}

describe("# Make class", () => {
    let make = new MakeRepository();

    beforeAll(() => {
        make.addMaker(A.name, A.make.bind(A))
        make.addMaker(AA.name, AA.make.bind(A))
        make.addMaker(B.name, B.make.bind(A))
        make.addMaker(C.name, C.make.bind(A))
    })

    test('make simple class should be ok with valid config', () => {
        const res = new A()
        res.data = 100
        expect(make.newContext().make({$$type: 'A', data: 100})).toEqual(res)
    })

    test('make simple class should fail with invalid config', () => {
        expect(() => make.newContext().make({$$type: 'C', data: 'abc'})).toThrow(MakingTypeCheckError)
    })

    test('make nested class should be ok with valid config', () => {
        const res = new B()
        res.a = new A()
        res.a.data = 100
        expect(make.newContext().make({$$type: 'B', a: {
            data: 100
        }})).toEqual(res)
    })

    test('make nested class with children class should be ok with valid config', () => {
        const res = new B()
        res.a = new AA()
        res.a.data = 100
        expect(make.newContext().make({$$type: 'B', a: {
            $$type: 'AA',
            data: 100
        }})).toEqual(res)
    })

    test('make nested class class should fail ok invalid class', () => {
        expect(() => make.newContext().make({$$type: 'B', a: {
            $$type: 'C',
            data: 100
        }})).toThrow(MakingTypeCheckError)
    })

    test('make multiple-level nested class with children class should be ok with valid config', () => {
        const res = new A()
        res.data = new B()
        res.data.a = new AA()
        res.data.a.data = new B()
        res.data.a.data.a = new A()
        res.data.a.data.a.data = new C()
        res.data.a.data.a.data.data = 100
        expect(make.newContext().make({data: {$$type: 'B', a: {
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

    test('make multiple-level nested class with children class should fail with invalid config in deep level', () => {
        const res = new A()
        res.data = new B()
        res.data.a = new AA()
        res.data.a.data = new B()
        res.data.a.data.a = new A()
        res.data.a.data.a.data = new C()
        res.data.a.data.a.data.data = 100
        expect(() => make.newContext().make({data: {$$type: 'B', a: {
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
});