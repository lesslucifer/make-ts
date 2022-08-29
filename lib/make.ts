import _ = require('lodash')
import { ClassType, IMakeErrorContext, InvalidMakeConfigError, JSONObject, MakeConfig, MakingTypeCheckError } from './define';
import { MakeUtils } from './utils';

export interface IMakeOptions {
    fieldName?: string
    preferredType?: ClassType
    skipTypeCheck?: boolean
}

export interface Maker<T = any> {
    (ctx: MakeContext, config: MakeConfig, opts: IMakeOptions): T
}

export class MakeContext implements IMakeErrorContext {
    private path: string[] = []
    private error: Error

    constructor(private repo: MakeRepository) {
    }

    get Repository() { return this.repo }
    get Path() { return this.path }
    get Error() { return this.error }

    make(config: MakeConfig, opts?: IMakeOptions) {
        if (opts?.fieldName) {
            this.path.push(opts.fieldName)
        }
        try {
            const result = this.makeObject(config, opts)   
            if (opts?.skipTypeCheck !== true && opts?.preferredType !== undefined && !this.repo.typeMatcher(opts.preferredType, result)) {
                throw new MakingTypeCheckError(this, opts?.preferredType, result)
            }
    
            return result
        }
        finally {
            if (opts?.fieldName) {
                this.path.pop()
            }
        }
    }

    private makeObject(config: MakeConfig, opts?: IMakeOptions) {
        if (_.isObject(config) && _.isString(config['$$type'])) {
            const maker = this.repo.getMaker(config['$$type'])
            if (!maker) throw new InvalidMakeConfigError(this, `Cannot get recipe for $$type = ${_.get(config, '$$type')}`)
            return maker(this, _.omit(config as JSONObject, '$$type'), opts)
        }
        
        if (opts?.preferredType && this.repo.hasMaker(opts.preferredType.name)) {
            const maker = this.repo.getMaker(opts.preferredType.name)
            return maker(this, config, opts)
        }

        return MakeUtils.primitiveParse(config, opts?.preferredType)

        // throw new InvalidMakeConfigError(ctx, `Cannot get recipe for preferred type = ${ctx.preferredType.name} or the config type mismatch; found ${typeof config}`)
    }

    parseConfig(config: MakeConfig) {
        return config
    }
}

export class MakeRepository {
    private makers = new Map<string, Maker> ()
    public typeMatcher: (t: any, v: any) => boolean = MakeUtils.isTypeMatched.bind(MakeUtils)

    add(type: string, maker: Maker) {
        this.makers.set(type, maker)
    }

    hasMaker(type: string) {
        return this.makers.has(type)
    }

    getMaker(type: string) {
        return this.makers.get(type)
    }

    newContext() { return new MakeContext(this) }
}

export const MakeGlobal = new MakeRepository()
export default MakeGlobal