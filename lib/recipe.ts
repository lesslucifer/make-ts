import _ = require("lodash")
import { createTextChangeRange } from "typescript"
import { ClassType, MakeConfig, MakingError } from "./define"
import { IMakeContext, Make, Maker } from "./make"

export interface FieldRecipeValidation {
    (field: FieldRecipeDesc, value: any): boolean
}

export interface IRecipeOptions {
    
}

export interface FieldRecipeDesc {
    fieldName: string,
    type: () => ClassType
    typeCheck?: boolean
    configName?: string
    make?: Maker
    validation?: FieldRecipeValidation
}

export class Recipe<T = any> {
    name: string
    factory: () => T
    fields: FieldRecipeDesc[] = []
    options: IRecipeOptions = {}
    validation?: (target: T) => boolean

    recipe(): Maker {
        return this.make.bind(this)
    }

    getRecipe(make: Make, f: FieldRecipeDesc) {
        if (f.make) return f.make
        return make.make.bind(make)
    }

    make(config: MakeConfig, ctx: IMakeContext): T {
        if (!this.factory) throw new MakingError(ctx, `Recipe: no factory`)
        const target = this.factory()

        for (const f of this.fields) {
            const cfName = f.configName ?? f.fieldName
            const recipe = this.getRecipe(ctx.make, f)
            const fContext = ctx.make.fieldContext(cfName, {
                preferredType: f.type(),
                typeCheck: f.typeCheck
            })

            if (_.get(config, cfName) !== undefined) {
                const value = recipe(config?.[cfName], fContext)
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