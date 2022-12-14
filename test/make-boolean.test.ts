import { MakingTypeCheckError } from '../lib/define';
import { MakeRepository } from '../lib/make';

describe("# Make boolean", () => {
    let make = new MakeRepository();

    beforeAll(() => {
        make.addMaker('CheckedPrimitiveBoolean', (ctx, config) => ({
            data: ctx.make(config?.['data'], {
                fieldName: 'data',
                preferredType: Boolean
            })
        }))
        make.addMaker('UncheckedPrimitiveBoolean', (ctx, config) => ({
            data: ctx.make(config?.['data'], {
                fieldName: 'data',
                preferredType: Boolean,
                skipTypeCheck: true
            })
        }))
    })

    test('primitive boolean preferred type with check should be ok with boolean config', async () => {
        expect(make.newContext().make({ $$type: 'CheckedPrimitiveBoolean', data: true})).toEqual({data: true})
        expect(make.newContext().make({ $$type: 'CheckedPrimitiveBoolean', data: false})).toEqual({data: false})
    })

    test('primitive boolean preferred type with check should be ok with number config', async () => {
        expect(make.newContext().make({ $$type: 'CheckedPrimitiveBoolean', data: 1})).toEqual({data: true})
        expect(make.newContext().make({ $$type: 'CheckedPrimitiveBoolean', data: 0})).toEqual({data: false})
        expect(make.newContext().make({ $$type: 'CheckedPrimitiveBoolean', data: 1000})).toEqual({data: true})
    })

    test('primitive boolean preferred type with check should be ok with null config', async () => {
        expect(make.newContext().make({ $$type: 'CheckedPrimitiveBoolean', data: null})).toEqual({data: false})
    })

    test('primitive boolean preferred type with check should be ok with string config', async () => {
        expect(make.newContext().make({ $$type: 'CheckedPrimitiveBoolean', data: 'false'})).toEqual({data: false})
        expect(make.newContext().make({ $$type: 'CheckedPrimitiveBoolean', data: 'true'})).toEqual({data: true})
        expect(make.newContext().make({ $$type: 'CheckedPrimitiveBoolean', data: 'no'})).toEqual({data: false})
        expect(make.newContext().make({ $$type: 'CheckedPrimitiveBoolean', data: 'yes'})).toEqual({data: true})
        expect(make.newContext().make({ $$type: 'CheckedPrimitiveBoolean', data: '0'})).toEqual({data: false})
        expect(make.newContext().make({ $$type: 'CheckedPrimitiveBoolean', data: '1'})).toEqual({data: true})
        expect(make.newContext().make({ $$type: 'CheckedPrimitiveBoolean', data: '100'})).toEqual({data: true})
        expect(make.newContext().make({ $$type: 'CheckedPrimitiveBoolean', data: ''})).toEqual({data: false})
        expect(make.newContext().make({ $$type: 'CheckedPrimitiveBoolean', data: 'abc'})).toEqual({data: true})
    })

    test('primitive boolean preferred type with check should fail with invalid config', async () => {
        expect(() => make.newContext().make({ $$type: 'CheckedPrimitiveBoolean', data: NaN})).toThrow(MakingTypeCheckError)
        expect(() => make.newContext().make({ $$type: 'CheckedPrimitiveBoolean', data: <any> undefined})).toThrow(MakingTypeCheckError)
        expect(() => make.newContext().make({ $$type: 'CheckedPrimitiveBoolean', data: <any> new Error()})).toThrow(MakingTypeCheckError)
        expect(() => make.newContext().make({ $$type: 'CheckedPrimitiveBoolean', data: ['abc']})).toThrow(MakingTypeCheckError)
        expect(() => make.newContext().make({ $$type: 'CheckedPrimitiveBoolean', data: {'abc': 1}})).toThrow(MakingTypeCheckError)
    })

    test('primitive boolean preferred type without check should be ok with invalid config', async () => {
        expect(make.newContext().make({ $$type: 'UncheckedPrimitiveBoolean', data: NaN})).toEqual({data: undefined})
        expect(make.newContext().make({ $$type: 'UncheckedPrimitiveBoolean', data:  <any> undefined})).toEqual({data: undefined})
        expect(make.newContext().make({ $$type: 'UncheckedPrimitiveBoolean', data:  <any> new Error()})).toEqual({data: undefined})
        expect(make.newContext().make({ $$type: 'UncheckedPrimitiveBoolean', data: ['abc']})).toEqual({data: undefined})
        expect(make.newContext().make({ $$type: 'UncheckedPrimitiveBoolean', data: {'abc': 1}})).toEqual({data: undefined})
    })
});