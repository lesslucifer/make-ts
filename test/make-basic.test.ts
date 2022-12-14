import { InvalidMakeConfigError } from '../lib/define';
import { MakeRepository } from '../lib/make';

describe("# Make basic", () => {
    let make = new MakeRepository();

    beforeAll(() => {
        make.addMaker('A', (repo, config, ctx) => ({
            'class': 'A',
            data: config
        }))
        make.addMaker('B', (repo, config, ctx) => ({
            'class': 'B',
            'field': repo.make(config?.['field'], {
                fieldName: 'field',
                optional: true
            })
        }))
    })

    test('create single object should be ok', async () => {
        expect(make.newContext().make({ $$type: 'A', data: 'hello' })).toEqual({
            'class': 'A',
            data: { data: 'hello' }
        })
    })

    test('create nested object should be ok', async () => {
        expect(make.newContext().make({
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
        expect(() => make.newContext().make({ $$type: 'C' })).toThrow(InvalidMakeConfigError)
    })

    test('not found maker in nested should throw error', async () => {
        expect(() => make.newContext().make({
            $$type: 'B', field: {
                $$type: 'B',
                field: {
                    $$type: 'C'
                }
            }
        })).toThrow(InvalidMakeConfigError)
    })

    test('using primtestive type should be ok', async () => {
        expect(make.newContext().make({ $$type: 'A', value: 100, svalue: 'hello', bValue: false, nValue: null })).toEqual({
            'class': 'A',
            data: { value: 100, svalue: 'hello', bValue: false, nValue: null }
        })
    })

    test('using array type should be ok', async () => {
        expect(make.newContext().make({ $$type: 'A', array: ['A', 10, false, null] })).toEqual({
            'class': 'A',
            data: { array: ['A', 10, false, null] }
        })
    })

    test('using nested primtestive type should be ok', async () => {
        expect(make.newContext().make({ $$type: 'B', field: 100 })).toEqual({
            'class': 'B',
            field: 100
        })
        expect(make.newContext().make({ $$type: 'B', field: 'ABC' })).toEqual({
            'class': 'B',
            field: 'ABC'
        })
        expect(make.newContext().make({ $$type: 'B', field: false })).toEqual({
            'class': 'B',
            field: false
        })
        expect(make.newContext().make({ $$type: 'B', field: null }, )).toEqual({
            'class': 'B',
            field: null
        })
    })

    test('using nested array type should be ok', async () => {
        expect(make.newContext().make({ $$type: 'B', field: [100, 'A', false, null] })).toEqual({
            'class': 'B',
            field: [100, 'A', false, null]
        })
    })
});