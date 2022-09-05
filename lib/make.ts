import _ = require('lodash')
import { ClassType, IMakeErrorContext, InvalidMakeConfigError, JSONObject, MakeConfig, MakingTypeCheckError } from './define';
import { MakeUtils } from './utils';

export interface IMakeOptions {
    fieldName?: string
    preferredType?: ClassType
    skipTypeCheck?: boolean
    optional?: boolean
    defaultValue?: any
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
            const result = MakeUtils.select(this.makeObject(config, opts), opts?.defaultValue)
            if (opts?.skipTypeCheck !== true) {
                if (opts?.optional !== true && _.isNil(result)) {
                    throw new MakingTypeCheckError(this, 'not null or undefined', result)
                }
                else if (opts?.preferredType !== undefined && !this.repo.typeMatcher(opts.preferredType, result)) {
                    throw new MakingTypeCheckError(this, opts?.preferredType?.name, typeof result)
                }
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
        if (config === undefined) return undefined
        
        if (_.isString(config) && config.startsWith('$#') && this.repo.hasRef(config.substring('$#'.length))) {
            return this.repo.getRef(config.substring('$#'.length))
        }

        if (_.isObject(config) && !_.isEmpty(config['$$template'])) {
            const templates: string[] = _.isArray(config['$$template']) ? config['$$template'] : [config['$$template']]
            const notFoundTemplateIdx = templates.findIndex(t => !this.repo.hasTemplate(t))
            if (notFoundTemplateIdx >= 0) throw new InvalidMakeConfigError(this, `Invalid $$template config. Cannot find template ${templates[notFoundTemplateIdx]}`)
            if (templates.length > 0) {
                config = _.merge({}, ...templates.map(t => this.repo.getTemplate(t)), config)
            }
        }

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
    private templates = new Map<string, MakeConfig>()
    private refs = new Map<string, any>()

    public typeMatcher: (t: any, v: any) => boolean = MakeUtils.isTypeMatched.bind(MakeUtils)

    addMaker(type: string, maker: Maker) {
        this.makers.set(type, maker)
    }

    hasMaker(type: string) {
        return this.makers.has(type)
    }

    getMaker(type: string) {
        return this.makers.get(type)
    }

    addTemplate(name: string, template: MakeConfig) {
        return this.templates.set(name, template)
    }

    hasTemplate(type: string) {
        return this.templates.has(type)
    }

    getTemplate(type: string) {
        return this.templates.get(type)
    }

    addRef(name: string, ref: any) {
        return this.refs.set(name, ref)
    }

    hasRef(name: string) {
        return this.refs.has(name)
    }

    getRef(name: string) {
        return this.refs.get(name)
    }

    newContext() { return new MakeContext(this) }
}

export const MakeGlobal = new MakeRepository()
export default MakeGlobal