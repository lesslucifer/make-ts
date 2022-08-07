import 'mocha';
import { MakingTypeCheckError } from '../lib/define';
import { Make } from '../lib/make';

describe("# Make string", () => {
    let make = new Make();

    beforeAll(() => {
        make.add('CheckedPrimitiveString', (config, ctx) => ({
            data: ctx.make.make(config?.['data'], ctx.make.fieldContext('data', {
                preferredType: String,
                typeCheck: true
            }))
        }))
        make.add('UncheckedPrimitiveString', (config, ctx) => ({
            data: ctx.make.make(config?.['data'], ctx.make.fieldContext('data', {
                preferredType: String
            }))
        }))
    })

    test('primitive string preferred type with check should be ok with number config', async () => {
        expect(make.make({ $$type: 'CheckedPrimitiveString', data: 100})).toEqual({data: '100'})
        expect(make.make({ $$type: 'CheckedPrimitiveString', data: 100.0})).toEqual({data: '100'})
        expect(make.make({ $$type: 'CheckedPrimitiveString', data: 1e2})).toEqual({data: '100'})
        expect(make.make({ $$type: 'CheckedPrimitiveString', data: <any> new Number(100)})).toEqual({data: '100'})
        expect(make.make({ $$type: 'CheckedPrimitiveString', data: <any> new Number(100.0)})).toEqual({data: '100'})
        expect(make.make({ $$type: 'CheckedPrimitiveString', data: <any> new Number(1e2)})).toEqual({data: '100'})
    })

    test('primitive string preferred type with check should be ok with boolean config', async () => {
        expect(make.make({ $$type: 'CheckedPrimitiveString', data: true})).toEqual({data: 'true'})
        expect(make.make({ $$type: 'CheckedPrimitiveString', data: false})).toEqual({data: 'false'})
    })

    test('primitive string preferred type with check should be ok with non-validated config', async () => {
        expect(make.make({ $$type: 'CheckedPrimitiveString', data: null})).toEqual({data: ''})
        expect(make.make({ $$type: 'CheckedPrimitiveString', data: NaN})).toEqual({data: 'NaN'})
    })

    test('primitive string preferred type with check should be ok with string config', async () => {
        expect(make.make({ $$type: 'CheckedPrimitiveString', data: 'abc'})).toEqual({data: 'abc'})
        expect(make.make({ $$type: 'CheckedPrimitiveString', data: ''})).toEqual({data: ''})
        expect(make.make({ $$type: 'CheckedPrimitiveString', data: <any> new String('abc')})).toEqual({data: 'abc'})
    })

    test('primitive string preferred type with check should fail with invalid config', async () => {
        expect(() => make.make({ $$type: 'CheckedPrimitiveString', data: <any> undefined})).toThrow(MakingTypeCheckError)
        expect(() => make.make({ $$type: 'CheckedPrimitiveString', data: []})).toThrow(MakingTypeCheckError)
        expect(() => make.make({ $$type: 'CheckedPrimitiveString', data: {}})).toThrow(MakingTypeCheckError)
        expect(() => make.make({ $$type: 'CheckedPrimitiveString', data: <any> new Error()})).toThrow(MakingTypeCheckError)
    })

    test('primitive string preferred type without check should be ok with invalid config', async () => {
        expect(make.make({ $$type: 'UncheckedPrimitiveString', data: <any> undefined})).toEqual({data: undefined})
        expect(make.make({ $$type: 'UncheckedPrimitiveString', data: []})).toEqual({data: []})
        expect(make.make({ $$type: 'UncheckedPrimitiveString', data: ['a', 'b']})).toEqual({data: ['a', 'b']})
        expect(make.make({ $$type: 'UncheckedPrimitiveString', data: {}})).toEqual({data: {}})
        expect(make.make({ $$type: 'UncheckedPrimitiveString', data: <any> new Error()})).toEqual({data: new Error()})
    })
});