import _ = require("lodash");

export interface IMakeErrorContext {
    path?: string[]
}

export type ClassType = { new(...args: any[]): any; }

export type JSONObject = {
    [x: string]: JSONValue
}

export type JSONValue =
    | string
    | number
    | boolean
    | JSONObject
    | Array<JSONValue>
    | null;

export type MakeConfig = JSONValue

export class MakingError extends Error {
    constructor(ctx: IMakeErrorContext, reason?: string) {
        super(`Making error at path ${_.take(ctx.path, 100).join('.')}; Error: ${reason}`)
    }
}

export class InvalidMakeConfigError extends MakingError {
}

export class MakingTypeCheckError extends MakingError {
    constructor(ctx: IMakeErrorContext, expected: ClassType, value: any) {
        super(ctx, `Making type check error; Expected ${expected}; Found ${typeof value}`)
    }
}

export class RecipeDefinitionError extends Error {
    constructor(reason?: string) {
        super(`MakingDefinitionError: ${reason}`)
    }
}