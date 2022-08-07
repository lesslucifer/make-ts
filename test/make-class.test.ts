import { MakeConfig, MakingTypeCheckError } from '../lib/define';
import { IMakeContext, Make } from '../lib/make';

class A {
    data: any

    static make(config: MakeConfig, ctx: IMakeContext) {
        const a = new A()
        a.data = ctx.make.fieldMake(config, 'data')
        return a
    }
}

class AA extends A {
    static make(config: MakeConfig, ctx: IMakeContext) {
        const a = new AA()
        a.data = ctx.make.fieldMake(config, 'data')
        return a
    }
}

class C {
    data: any

    static make(config: MakeConfig, ctx: IMakeContext) {
        const c = new C()
        c.data = ctx.make.fieldMake(config, 'data', {
            preferredType: Number,
            typeCheck: true
        })
        return c
    }
}

class B {
    a: A

    static make(config: MakeConfig, ctx: IMakeContext) {
        const b = new B()
        b.a = ctx.make.fieldMake(config, 'a', {
            preferredType: A,
            typeCheck: true
        })
        return b
    }
}

describe("# Make class", () => {
    let make = new Make();

    beforeAll(() => {
        make.add(A.name, A.make.bind(A))
        make.add(AA.name, AA.make.bind(A))
        make.add(B.name, B.make.bind(A))
        make.add(C.name, C.make.bind(A))
    })

    test('make simple class should be ok with valid config', () => {
        const res = new A()
        res.data = 100
        expect(make.make({$$type: 'A', data: 100})).toEqual(res)
    })

    test('make simple class should fail with invalid config', () => {
        expect(() => make.make({$$type: 'C', data: 'abc'})).toThrow(MakingTypeCheckError)
    })

    test('make nested class should be ok with valid config', () => {
        const res = new B()
        res.a = new A()
        res.a.data = 100
        expect(make.make({$$type: 'B', a: {
            data: 100
        }})).toEqual(res)
    })

    test('make nested class with children class should be ok with valid config', () => {
        const res = new B()
        res.a = new AA()
        res.a.data = 100
        expect(make.make({$$type: 'B', a: {
            $$type: 'AA',
            data: 100
        }})).toEqual(res)
    })

    test('make nested class class should fail ok invalid class', () => {
        expect(() => make.make({$$type: 'B', a: {
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

    test('make multiple-level nested class with children class should fail with invalid config in deep level', () => {
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
});