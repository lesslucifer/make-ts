import "reflect-metadata";

import { ClassType, RecipeDefinitionError } from "./define";
import { FieldRecipeDesc, IRecipeOptions, Recipe } from "./recipe";

export interface IRecipeDesc {
    target: Function,
    recipe: Recipe
}

export function RecipeModel(factory?: () => any, name?: string) {
    return (target: ClassType) => {
        const recipe = new Recipe()
        recipe.name = name ?? target.name
        recipe.factory = factory ?? (() => new target())
        
        const recipes: IRecipeDesc[] = Reflect.getMetadata('recipes', RecipeModel) || [];
        const dupRecipe = recipes.find(r => r.target === target)
        if (dupRecipe) throw new RecipeDefinitionError(`Cannot set recipe for target ${target.name}; Duplicated`)
        recipes.push({target, recipe});
        Reflect.defineMetadata('recipes', recipes, RecipeModel);
    }
}

export const modifyRecipeMetadata = (target: ClassType, f: (r: Recipe) => any) => {
    const recipes: any[] = Reflect.getMetadata('recipes', RecipeModel) || [];
    const r = recipes.find(r => r.target === target)
    if (!r) throw new RecipeDefinitionError(`Cannot update recipe options for target ${target.name}; Not found`)
    return f(r.recipe)
}

export const ModifyRecipe = (f: (r: Recipe) => void) => {
    return (target: ClassType) => {
        modifyRecipeMetadata(target, f)
    }
}

export const RecipeOptions = (opts: IRecipeOptions) => {
    return ModifyRecipe(r => r.options = opts)
}

export const RecipeValidation = (validation: (target: any) => boolean) => {
    return ModifyRecipe(r => r.validation = validation)
}

export const RecipeField = (desc?: Partial<FieldRecipeDesc>) => {
    return (target: any, key: string) => {
        const recipeFields: FieldRecipeDesc[] = Reflect.getMetadata('recipe:fields', target) || [];
        const dupField = recipeFields.find(f => f.fieldName === key)
        if (dupField) throw new RecipeDefinitionError(`Cannot add field ${key} for recipe ${target.name}; Duplicated`)
        const designType = Reflect.getMetadata('design:type', target, key)
        recipeFields.push({
            type: () => designType,
            ...(desc ?? {}),
            fieldName: key
        })
        Reflect.defineMetadata('recipe:fields', recipeFields, target);
    }
}

export const modifyRecipeFieldMetadata = (target: any, key: string, f: (field: FieldRecipeDesc) => any) => {
    const recipeFields: FieldRecipeDesc[] = Reflect.getMetadata('recipe:fields', target) || [];
    const field = recipeFields.find(f => f.fieldName === key)
    if (!field) throw new RecipeDefinitionError(`Cannot update field ${key} for recipe ${target.name}; Not found`)
    return f(field)
}

export const ModifyRecipeField = (f: (field: FieldRecipeDesc) => any) => {
    return (target: any, key: string) => {
        modifyRecipeFieldMetadata(target, key, f)
    }
}

RecipeModel.get = () => {
    const recipes = Reflect.getMetadata('recipes', RecipeModel) as IRecipeDesc[]
    return recipes.map(r => {
        const recipe = r.recipe
        recipe.fields = Reflect.getMetadata('recipe:fields', r.target.prototype) || []
        return recipe
    })
}