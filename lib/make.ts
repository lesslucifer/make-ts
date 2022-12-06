import _ = require('lodash')
import { ClassType, IMakeErrorContext, InvalidMakeConfigError, JSONObject, JSONValue, MakeConfig, MakingTypeCheckError } from './define';
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
            if (opts?.skipTypeCheck === true) return result
            if (opts?.optional === true && _.isNil(result)) return result
            if (_.isNil(result)) throw new MakingTypeCheckError(this, 'not null or undefined', result)
            
            if (opts?.preferredType !== undefined && !this.repo.typeMatcher(opts.preferredType, result)) {
                throw new MakingTypeCheckError(this, opts?.preferredType?.name, typeof result)
            }
    
            return result
        }
        finally {
            if (opts?.fieldName) {
                this.path.pop()
            }
        }
    }

    resolveConfig(config: MakeConfig) {
        if (_.isArray(config)) {
            return config.map(e => this.resolveConfig(e))
        }

        if (_.isObject(config)) {
            if (!_.isEmpty(config['$$template'])) return this.resolveConfig(this.parseTemplate(config))
            return _.mapValues(config, (v: any) => this.resolveConfig(v))
        }
        
        if (_.isString(config) && config.startsWith('$#') && this.repo.hasRef(config.substring('$#'.length))) {
            return this.repo.getRef(config.substring('$#'.length))
        }

        return config
    }

    private parseTemplate(config: MakeConfig) {
        if (_.isObject(config) && !_.isEmpty(config['$$template'])) {
            const templates: IMakeTemplateConfig[] = _.isArray(config['$$template']) ? config['$$template'].map(t => this.parseTemplateConfig(t)) : [this.parseTemplateConfig(config['$$template'])]
            const notFoundTemplateIdx = templates.findIndex(t => !this.repo.hasTemplate(t.name))
            if (notFoundTemplateIdx >= 0) throw new InvalidMakeConfigError(this, `Invalid $$template config. Cannot find template ${templates[notFoundTemplateIdx].name}`)
            if (templates.length > 0) {
                // console.log(templates)
                // console.log(templates.map(t => this.makeTemplate(t.placeholders, this.repo.getTemplate(t.name))))
                return _.assign({}, ...templates.map(t => this.parseTemplate(this.makeTemplate(t.placeholders, this.repo.getTemplate(t.name)))), _.omit(config, '$$template'))
                // console.log(config)
            }
        }

        return config
    }

    private makeObject(config: MakeConfig, opts?: IMakeOptions) {
        if (config === undefined) return undefined

        config = this.parseTemplate(config)
        
        if (_.isString(config) && config.startsWith('$#') && this.repo.hasRef(config.substring('$#'.length))) {
            return this.repo.getRef(config.substring('$#'.length))
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

    // private makeTemplate(placeholders: _.Dictionary<any>, data: any) {
    //     const res = this.makeTemplate2(placeholders, data)
    //     console.log(`Make template: `, data, '=>', res)
    //     return res
    // }

    private makeTemplate(placeholders: _.Dictionary<any>, data: any) {
        if (_.isString(data) && data.startsWith('$$')) return _.get(placeholders, data.substring(2))
        if (_.isArray(data)) return data.map(e => this.makeTemplate(placeholders, e))
        if (_.isPlainObject(data)) {
            if (data['$$placeholder'] !== undefined) {
                return _.get(placeholders, data['$$placeholder']) ?? data['$$default']
            }
            return _.mapValues(data, v => this.makeTemplate(placeholders, v))
        }
        return data
    }

    private parseTemplateConfig(t: any): IMakeTemplateConfig {
        if (_.isPlainObject(t)) {
            const name = t.name
            const placeholders = t.placeholders ?? {}
            if (!_.isString(name)) throw new InvalidMakeConfigError(this, `Template config object must have name`)
            if (!_.isObjectLike(placeholders)) throw new InvalidMakeConfigError(this, `Template config placeholders must be an object-like`)
            return {
                name, placeholders
            }
        }
        return { name: t, placeholders: {} }
    }

    parseConfig(config: MakeConfig) {
        return config
    }
}

export interface IMakeTemplateConfig {
    name: string;
    placeholders: _.Dictionary<JSONValue>
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