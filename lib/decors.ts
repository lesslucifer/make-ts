import _ = require("lodash");
import "reflect-metadata";

import { ClassType, RecipeDefinitionError } from "./define";
import { Maker, MakeRepository } from "./make";
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
        
        const recipes: Map<ClassType, IRecipeDesc> = Reflect.getMetadata('recipes', RecipeModel) || new Map();
        const dupRecipe = recipes.get(target)
        if (dupRecipe) throw new RecipeDefinitionError(`Cannot set recipe for target ${target.name}; Duplicated`)
        recipes.set(target, { target, recipe });
        Reflect.defineMetadata('recipes', recipes, RecipeModel);
    }
}

export const modifyRecipeMetadata = (target: ClassType, f: (r: Recipe) => any) => {
    const recipes: Map<ClassType, IRecipeDesc> = Reflect.getMetadata('recipes', RecipeModel) || new Map();
    const r = recipes.get(target)
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

export const RecipeCustomMaker = (maker: Maker) => {
    return ModifyRecipe(r => r.customMaker = maker)
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

export const CustomMakerFunction = () => (target: ClassType, key: string, desc: PropertyDescriptor) => {
    if (!_.isFunction(desc.value)) throw new RecipeDefinitionError(`Cannot set custom make function for class ${target.name}; Field ${key} is not a function`)
    Reflect.defineMetadata('recipe:custom_maker', desc.value, target)
}

RecipeModel.get = (type: ClassType) => {
    const recipes: Map<ClassType, IRecipeDesc> = Reflect.getMetadata('recipes', RecipeModel)
    const r = recipes?.get(type)
    if (r) {
        r.recipe.fields = Reflect.getMetadata('recipe:fields', r.target.prototype) || []
        const customMakerFunc = Reflect.getMetadata('recipe:custom_maker', r.target)
        if (customMakerFunc) r.recipe.customMaker = customMakerFunc
        return r.recipe
    }
}

RecipeModel.addToMakeRepo = (repo: MakeRepository, type: ClassType) => {
    const recipe = RecipeModel.get(type)
    if (!recipe) throw new RecipeDefinitionError(`Cannot add recipe of type ${type.name} to make repository; Not found`)
    repo.add(type.name, recipe.recipe())
}