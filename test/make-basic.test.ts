import 'mocha';
import { InvalidMakeConfigError } from '../lib/define';
import { Make } from '../lib/make';

describe("# Make basic", () => {
    let make = new Make();

    beforeAll(() => {
        make.add('A', (config, ctx) => ({
            'class': 'A',
            data: config
        }))
        make.add('B', (config, ctx) => ({
            'class': 'B',
            'field': ctx.make.make(config?.['field'], {
                make: ctx.make,
                path: [...ctx.path, 'field'],
            })
        }))
    })

    test('create single object should be ok', async () => {
        expect(make.make({ $$type: 'A', data: 'hello' })).toEqual({
            'class': 'A',
            data: { data: 'hello' }
        })
    })

    test('create nested object should be ok', async () => {
        expect(make.make({
            $$type: 'B', field: {
                $$type: 'B',
                field: {
                    $$type: 'A',
                    value: 100
                }
            }
        })).toEqual({
            'class': 'B',
            field: {
                'class': 'B',
                field: {
                    'class': 'A',
                    data: { value: 100 }
                }
            }
        })
    })

    test('not found maker should throw error', async () => {
        expect(() => make.make({ $$type: 'C' })).toThrow(InvalidMakeConfigError)
    })

    test('not found maker in nested should throw error', async () => {
        expect(() => make.make({
            $$type: 'B', field: {
                $$type: 'B',
                field: {
                    $$type: 'C'
                }
            }
        })).toThrow(InvalidMakeConfigError)
    })

    test('using primtestive type should be ok', async () => {
        expect(make.make({ $$type: 'A', value: 100, svalue: 'hello', bValue: false, nValue: null })).toEqual({
            'class': 'A',
            data: { value: 100, svalue: 'hello', bValue: false, nValue: null }
        })
    })

    test('using array type should be ok', async () => {
        expect(make.make({ $$type: 'A', array: ['A', 10, false, null] })).toEqual({
            'class': 'A',
            data: { array: ['A', 10, false, null] }
        })
    })

    test('using nested primtestive type should be ok', async () => {
        expect(make.make({ $$type: 'B', field: 100 })).toEqual({
            'class': 'B',
            field: 100
        })
        expect(make.make({ $$type: 'B', field: 'ABC' })).toEqual({
            'class': 'B',
            field: 'ABC'
        })
        expect(make.make({ $$type: 'B', field: false })).toEqual({
            'class': 'B',
            field: false
        })
        expect(make.make({ $$type: 'B', field: null })).toEqual({
            'class': 'B',
            field: null
        })
    })

    test('using nested array type should be ok', async () => {
        expect(make.make({ $$type: 'B', field: [100, 'A', false, null] })).toEqual({
            'class': 'B',
            field: [100, 'A', false, null]
        })
    })
});