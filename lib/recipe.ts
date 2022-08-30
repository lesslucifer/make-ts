import _ = require("lodash")
import { ClassType, MakeConfig, MakingError } from "./define"
import { IMakeOptions, MakeContext, Maker } from "./make"

export interface FieldRecipeValidation {
    (field: FieldRecipeDesc, value: any): boolean
}

export interface IRecipeOptions {
    
}

export interface FieldRecipeDesc {
    fieldName: string,
    type: () => ClassType
    skipTypeCheck?: boolean
    configName?: string
    make?: Maker
    validation?: FieldRecipeValidation
}

export class Recipe<T = any> {
    target: ClassType<T>
    name: string
    factory: () => T
    fields: FieldRecipeDesc[] = []
    options: IRecipeOptions = {}
    customMaker?: Maker<T>
    validation?: (target: T) => boolean

    recipe(): Maker<T> {
        if (this.customMaker) return this.customMaker.bind(this.target)
        return this.make.bind(this)
    }

    private getRecipe(f: FieldRecipeDesc): Maker<any> {
        if (f.make) return f.make
        return (ctx, cf, opts) => ctx.make(cf, opts)
    }

    make(ctx: MakeContext, config: MakeConfig, opts?: IMakeOptions): T {
        if (!this.factory) throw new MakingError(ctx, `Recipe: no factory`)
        const target = this.factory()

        for (const f of this.fields) {
            const cfName = f.configName ?? f.fieldName
            const recipe = this.getRecipe(f)

            if (_.get(config, cfName) !== undefined) {
                const value = recipe(ctx, config?.[cfName], {
                    fieldName: cfName,
                    preferredType: f.type(),
                    skipTypeCheck : f.skipTypeCheck === true || !!f.validation
                })
                if (value !== undefined) {
                    target[f.fieldName] = value
                }
            }

            if (f.validation && !f.validation(f, target[f.fieldName])) throw new MakingError(ctx, `Recipe: Validation failed for ${f.fieldName}`)
        }

        if (this.validation && !this.validation(target)) throw new MakingError(ctx, `Recipe: Validation failed for the target object`)

        return target
    }
}