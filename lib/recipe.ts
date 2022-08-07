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
    fieldName: string
    required?: boolean
    configName?: string
    make?: Maker
    type?: () => ClassType
    validation?: FieldRecipeValidation
}

export class Recipe<T = any> {
    factory: () => T
    fields: FieldRecipeDesc[] = []
    options: IRecipeOptions = {}
    validation?: (target: T) => boolean

    recipe(): Maker {
        return this.make.bind(this)
    }

    getRecipe(make: Make, f: FieldRecipeDesc) {
        if (f.make) return f.make
        if (f.type && make.getMaker(f.type().name)) return make.getMaker(f.type().name)
        return make.make.bind(make)
    }

    make(config: MakeConfig, ctx: IMakeContext): T {
        if (!this.factory) throw new MakingError(ctx, `Recipe: no factory`)
        const target = this.factory()

        for (const f of this.fields) {
            const cfName = f.configName ?? f.fieldName
            const recipe = this.getRecipe(ctx.make, f)
            const value = recipe(config[cfName], ctx.make.fieldContext(cfName, {
                
            }))
            if (value === undefined && !f.required) throw new MakingError(ctx, `Recipe: ${f.fieldName} cannot be empty`)
            if (f.validation && !f.validation(f, value)) throw new MakingError(ctx, `Recipe: Validation failed for ${f.fieldName}`)
            target[f.fieldName] = value
        }

        if (this.validation && !this.validation(target)) throw new MakingError(ctx, `Recipe: Validation failed for the target object`)

        return target
    }
}