import { MakingTypeCheckError } from '../lib/define';
import { MakeRepository } from '../lib/make';

describe("# Make optional", () => {
    let make = new MakeRepository();

    beforeAll(() => {
        make.addMaker('SampleClass', (repo, config) => ({
            'class': 'SampleClass',
            'optionalField': repo.make(config?.['optionalField'], {
                fieldName: 'optionalField',
                optional: true
            }),
            'requiredField': repo.make(config?.['requiredField'], {
                fieldName: 'requiredField'
            })
        }))
    })

    test('non-optional should throw error with empty config', async () => {
        expect(() => make.newContext().make(undefined)).toThrow(MakingTypeCheckError)
        expect(() => make.newContext().make(null)).toThrow(MakingTypeCheckError)
    })

    test('optional should work with empty config', async () => {
        expect(make.newContext().make(undefined, { optional: true })).toEqual(undefined)
        expect(make.newContext().make(null, { optional: true })).toEqual(null)
    })

    test('optional in nested-field should work', async () => {
        expect(make.newContext().make({$$type: 'SampleClass', optionalField: null, requiredField: '' })).toEqual({ class: 'SampleClass', optionalField: null, requiredField: '' })
        expect(make.newContext().make({$$type: 'SampleClass', optionalField: undefined, requiredField: 0 })).toEqual({ class: 'SampleClass', optionalField: undefined, requiredField: 0 })
    })

    test('optional in nested-required-field should throw error', async () => {
        expect(() => make.newContext().make({$$type: 'SampleClass', requiredField: null })).toThrow(MakingTypeCheckError)
        expect(() => make.newContext().make({$$type: 'SampleClass', requiredField: undefined })).toThrow(MakingTypeCheckError)
        expect(make.newContext().make({$$type: 'SampleClass', requiredField: 'A' })).toEqual({ class: 'SampleClass', requiredField: 'A' })
    })
});