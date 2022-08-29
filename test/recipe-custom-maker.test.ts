import { CustomMakerFunction, RecipeCustomMaker, RecipeField, RecipeModel, RecipeValidation } from '../lib/decors';
import { MakeConfig, MakingError, MakingTypeCheckError } from '../lib/define';
import { IMakeOptions, MakeContext, MakeRepository } from '../lib/make';

@RecipeCustomMaker((ctx, cf, opts) => {
    const res = new CustomMakerInClass()
    res.data = ctx.make(cf)
    return res
})
@RecipeModel()
class CustomMakerInClass {
    @RecipeField({ skipTypeCheck: true })
    data: any
}

@RecipeModel()
class CustomMakerInFunction {
    @RecipeField({ skipTypeCheck: true })
    data: any
    
    @CustomMakerFunction()
    static make(ctx: MakeContext, cf: MakeConfig, opts: IMakeOptions) {
        const res = new CustomMakerInFunction()
        res.data = ctx.make(cf)
        return res
    }
}

describe("# Recipe Custom Maker", () => {
    let make = new MakeRepository();

    beforeAll(() => {
        RecipeModel.addToMakeRepo(make, CustomMakerInClass)
        RecipeModel.addToMakeRepo(make, CustomMakerInFunction)
    })

    test('custom maker in class should work with valid config', () => {
        const res = new CustomMakerInClass()
        res.data = {data: '100'}
        expect(make.newContext().make({$$type: 'CustomMakerInClass', data: '100'})).toEqual(res)
    })

    test('custom maker in class should work fail with invalid type', () => {
        expect(() => make.newContext().make({$$type: 'CustomMakerInFunction', data: '100'}, {
            preferredType: CustomMakerInClass
        })).toThrow(MakingTypeCheckError)
    })

    test('custom maker in class should work ok with invalid type but skipTypeCheck', () => {
        const res = new CustomMakerInFunction()
        res.data = {data: '100'}
        expect(make.newContext().make({$$type: 'CustomMakerInFunction', data: '100'}, {
            preferredType: CustomMakerInClass,
            skipTypeCheck: true
         })).toEqual(res)
    })

    test('custom maker in function should work fail with invalid config', () => {
        const res = new CustomMakerInFunction()
        res.data = {data: '100'}
        expect(make.newContext().make({$$type: 'CustomMakerInFunction', data: '100'})).toEqual(res)
    })

    test('custom maker in function should work fail with invalid type', () => {
        expect(() => make.newContext().make({$$type: 'CustomMakerInClass', data: '100'}, {
            preferredType: CustomMakerInFunction
        })).toThrow(MakingTypeCheckError)
    })

    test('custom maker in function should work ok with invalid type but skipTypeCheck', () => {
        const res = new CustomMakerInClass()
        res.data = {data: '100'}
        expect(make.newContext().make({$$type: 'CustomMakerInFunction', data: '100'}, {
            preferredType: CustomMakerInFunction,
            skipTypeCheck: true
         })).toEqual(res)
    })
});