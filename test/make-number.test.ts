import 'mocha';
import { MakingTypeCheckError } from '../lib/define';
import { Make } from '../lib/make';

describe("# Make number", () => {
    let make = new Make();

    beforeAll(() => {
        make.add('CheckedPrimitiveNumber', (config, ctx) => ({
            data: ctx.make.make(config?.['data'], ctx.make.fieldContext('data', {
                preferredType: Number,
                typeCheck: true
            }))
        }))
        make.add('UncheckedPrimitiveNumber', (config, ctx) => ({
            data: ctx.make.make(config?.['data'], ctx.make.fieldContext('data', {
                preferredType: Number
            }))
        }))
    })

    test('primitive number preferred type with check should be ok with number config', async () => {
        expect(make.make({ $$type: 'CheckedPrimitiveNumber', data: 100})).toEqual({data: 100})
        expect(make.make({ $$type: 'CheckedPrimitiveNumber', data: 100.0})).toEqual({data: 100.0})
        expect(make.make({ $$type: 'CheckedPrimitiveNumber', data: 1e2})).toEqual({data: 100.0})
        expect(make.make({ $$type: 'CheckedPrimitiveNumber', data: null})).toEqual({data: 0})
    })

    test('primitive number preferred type with check should be ok with boolean-able config', async () => {
        expect(make.make({ $$type: 'CheckedPrimitiveNumber', data: false})).toEqual({data: 0})
        expect(make.make({ $$type: 'CheckedPrimitiveNumber', data: true})).toEqual({data: 1})
    })

    test('primitive number preferred type with check should be ok with numeric string config', async () => {
        expect(make.make({ $$type: 'CheckedPrimitiveNumber', data: '100'})).toEqual({data: 100})
        expect(make.make({ $$type: 'CheckedPrimitiveNumber', data: '100.0'})).toEqual({data: 100.0})
        expect(make.make({ $$type: 'CheckedPrimitiveNumber', data: '1e2'})).toEqual({data: 100.0})
        expect(make.make({ $$type: 'CheckedPrimitiveNumber', data: '-1e2'})).toEqual({data: -100.0})
        expect(make.make({ $$type: 'CheckedPrimitiveNumber', data: '+1e2'})).toEqual({data: 100.0})
        expect(make.make({ $$type: 'CheckedPrimitiveNumber', data: ''})).toEqual({data: 0})
    })

    test('primitive number preferred type with check should fail with invalid config', async () => {
        expect(() => make.make({ $$type: 'CheckedPrimitiveNumber', data: NaN})).toThrow(MakingTypeCheckError)
        expect(() => make.make({ $$type: 'CheckedPrimitiveNumber', data: 'abc'})).toThrow(MakingTypeCheckError)
        expect(() => make.make({ $$type: 'CheckedPrimitiveNumber', data: '123abc'})).toThrow(MakingTypeCheckError)
        expect(() => make.make({ $$type: 'CheckedPrimitiveNumber', data: 'abc123'})).toThrow(MakingTypeCheckError)
    })

    test('primitive number preferred type without check should be ok with invalid config', async () => {
        expect(make.make({ $$type: 'UncheckedPrimitiveNumber', data: NaN})).toEqual({data: NaN})
        expect(make.make({ $$type: 'UncheckedPrimitiveNumber', data: 'abc'})).toEqual({data: "abc"})
        expect(make.make({ $$type: 'UncheckedPrimitiveNumber', data: '123abc'})).toEqual({data: '123abc'})
        expect(make.make({ $$type: 'UncheckedPrimitiveNumber', data: 'abc123'})).toEqual({data: 'abc123'})
    })
});