import "reflect-metadata";

import { RecipeDefinitionError } from "./define";
import { FieldRecipeDesc, IRecipeOptions, Recipe } from "./recipe";

export function RecipeModel(name?: string, factory?: () => any) {
    return (target: Function) => {
        const recipe = new Recipe()
        recipe.factory = factory ?? (() => target())
        
        const recipes: any[] = Reflect.getMetadata('recipes', RecipeModel) || [];
        const dupRecipe = recipes.find(r => r.target === target)
        if (dupRecipe) throw new RecipeDefinitionError(`Cannot set recipe for target ${target.name}; Duplicated`)
        recipes.push({target: target, name: name ?? target.name, recipe});
        Reflect.defineMetadata('recipes', recipes, RecipeModel);
    }
}

RecipeModel.get = () => Reflect.getMetadata('recipes', RecipeModel) as Recipe[]

export const modifyRecipeMetadata = (target: Function, f: (r: Recipe) => any) => {
    const recipes: any[] = Reflect.getMetadata('recipes', RecipeModel) || [];
    const r = recipes.find(r => r.target === target)
    if (!r) throw new RecipeDefinitionError(`Cannot update recipe options for target ${target.name}; Not found`)
    return f(r)
}

export const ModifyRecipe = (f: (r: Recipe) => void) => {
    return (target: Function) => {
        modifyRecipeMetadata(target, f)
    }
}

export const RecipeOptions = (opts: IRecipeOptions) => {
    return ModifyRecipe(r => r.options = opts)
}

export const RecipeValidation = (validation: (target: any) => boolean) => {
    return ModifyRecipe(r => r.validation = validation)
}

export const RecipeField = (desc: Partial<FieldRecipeDesc>) => {
    return (target: any, key: string) => {
        modifyRecipeMetadata(target, r => {
            const dupField = r.fields.find(f => f.fieldName === key)
            if (dupField) throw new RecipeDefinitionError(`Cannot add field ${key} for recipe ${target.name}; Duplicated`)
            r.fields.push({
                ...desc,
                fieldName: key
            })
        })
    }
}

export const modifyRecipeFieldMetadata = (target: Function, key: string, f: (field: FieldRecipeDesc) => any) => {
    return modifyRecipeMetadata(target, r => {
        const field = r.fields.find(f => f.fieldName === key)
        if (!field) throw new RecipeDefinitionError(`Cannot update field ${key} for recipe ${target.name}; Not found`)
       return  f(field)
    })
}

export const ModifyRecipeField = (f: (field: FieldRecipeDesc) => any) => {
    return (target: Function, key: string) => {
        modifyRecipeFieldMetadata(target, key, f)
    }
}