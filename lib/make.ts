import _ = require('lodash')
import { ClassType, IMakeErrorContext, InvalidMakeConfigError, JSONObject, MakeConfig, MakingTypeCheckError } from './define';
import { MakeUtils } from './utils';

export interface IMakeContext extends IMakeErrorContext {
    make?: Make
    path?: string[]
    preferredType?: ClassType
    typeCheck?: boolean
}

export interface Maker<T = any> {
    (config: MakeConfig, ctx: IMakeContext): T
}

export class Make {
    private makers = new Map<string, Maker> ()
    public typeMatcher: (t: any, v: any) => boolean = MakeUtils.isTypeMatched.bind(MakeUtils)

    add(type: string, maker: Maker) {
        this.makers.set(type, maker)
    }

    make(config: MakeConfig, context?: IMakeContext) {
        const ctx = context ?? {}
        ctx.make = ctx.make ?? this
        ctx.path = ctx.path ?? []

        const result = this.makeWithContext(config, ctx)

        if (ctx.typeCheck === true && ctx.preferredType !== undefined && !this.typeMatcher(ctx.preferredType, result)) {
            throw new MakingTypeCheckError(ctx, context.preferredType, result)
        }

        return result
    }

    fieldMake(config: MakeConfig, fieldName: string, ctx?: Partial<IMakeContext>) {
        return this.make(config?.[fieldName], this.fieldContext(fieldName, ctx))
    }

    fieldContext(fieldName: string, ctx?: Partial<IMakeContext>): IMakeContext {
        return {
            make: this,
            path: [...(ctx?.path ?? []), fieldName],
            ...(ctx ?? {})
        }
    }

    private makeWithContext(config: MakeConfig, ctx: IMakeContext) {
        if (_.isObject(config) && _.isString(config['$$type'])) {
            const maker = this.makers.get(config['$$type'])
            if (!maker) throw new InvalidMakeConfigError(ctx, `Cannot get recipe for $$type = ${_.get(config, '$$type')}`)
            return maker(_.omit(config as JSONObject, '$$type'), ctx)
        }
        
        if (ctx.preferredType && this.makers.has(ctx.preferredType.name)) {
            const maker = this.makers.get(ctx.preferredType.name)
            return maker(config, ctx)
        }

        return MakeUtils.primitiveParse(config, ctx.preferredType)

        // throw new InvalidMakeConfigError(ctx, `Cannot get recipe for preferred type = ${ctx.preferredType.name} or the config type mismatch; found ${typeof config}`)
    }

    parseConfig(config: MakeConfig) {
        return config
    }
}

export const MakeGlobal = new Make()
export default MakeGlobal