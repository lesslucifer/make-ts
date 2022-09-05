import { InvalidMakeConfigError, MakingTypeCheckError } from '../lib/define';
import { MakeRepository } from '../lib/make';

describe("# Make defaultValue", () => {
    let make = new MakeRepository();

    beforeAll(() => {
        make.addMaker('SimpleClass', (repo, config, ctx) => ({
            'class': 'SimpleClass',
            'field': repo.make(config?.['field'], {
                fieldName: 'field',
                defaultValue: 100
            }),
        }))

        make.addMaker('CheckedClass', (repo, config, ctx) => ({
            'class': 'CheckedClass',
            'field': repo.make(config?.['field'], {
                fieldName: 'field',
                defaultValue: null
            }),
        }))

        make.addMaker('OptionalClass', (repo, config, ctx) => ({
            'class': 'OptionalClass',
            'field': repo.make(config?.['field'], {
                fieldName: 'field',
                defaultValue: null,
                optional: true
            }),
        }))
    })

    test('defaultValue should work with undefined config', async () => {
        expect(make.newContext().make(undefined, { defaultValue: 100 })).toEqual(100)
    })

    test('defaultValue should not work with null config', async () => {
        expect(make.newContext().make(null, { defaultValue: 100, optional: true })).toEqual(null)
    })

    test('defaultValue should work with nested-field', async () => {
        expect(make.newContext().make({$$type: 'SimpleClass' })).toEqual({ class: 'SimpleClass', field: 100 })
        expect(make.newContext().make({$$type: 'SimpleClass' })).toEqual({ class: 'SimpleClass', field: 100 })
    })

    test('defaultValue in nested-field should follow type-check', async () => {
        expect(() => make.newContext().make({$$type: 'CheckedClass' })).toThrow(MakingTypeCheckError)
        expect(() => make.newContext().make({$$type: 'CheckedClass' })).toThrow(MakingTypeCheckError)
        expect(make.newContext().make({$$type: 'OptionalClass' })).toEqual({ class: 'OptionalClass', field: null })
    })
});