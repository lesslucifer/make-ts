import _ = require("lodash");

export interface IMakeErrorContext {
    Path?: string[]
}

export type ClassType<T = any> = { new(...args: any[]): T; }

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
        super(`Making error at path: [${_.take(ctx.Path, 100).join('.')}]; Error: ${reason}`)
    }
}

export class InvalidMakeConfigError extends MakingError {
}

export class MakingTypeCheckError extends MakingError {
    constructor(ctx: IMakeErrorContext, expected: string, value: string) {
        super(ctx, `Making type check error; Expected [${expected}]; Found [${value}]`)
    }
}

export class RecipeDefinitionError extends Error {
    constructor(reason?: string) {
        super(`MakingDefinitionError: ${reason}`)
    }
}