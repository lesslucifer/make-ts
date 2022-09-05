import _ = require("lodash");

export class MakeUtils {
    static toBoolean(value: any): boolean {
        if (value === null) {
            return false;
        }

        if (_.isBoolean(value)) {
            return value;
        }

        if (_.isNumber(value) && !isNaN(value)) {
            return value !== 0;
        }

        if (_.isString(value)) {
            const s = (value as string).trim().toLowerCase();
            return !(s == '' || s == 'false' || s == 'no' || s == '0');
        }

        return undefined;
    }

    static isTypeMatched(type: any, value: any) {
        if (type === String) {
            return _.isString(value)
        }

        if (type === Number) {
            return  _.isNumber(value) && !isNaN(Number(value))
        }

        if (type === Boolean) {
            return this.toBoolean(value) !== undefined
        }

        if (type === Array) {
            return _.isArray(value)
        }

        if (type === Object) {
            return _.isObject(value)
        }

        if (type instanceof Function) {
            return value instanceof type
        }

        return false
    }

    static primitiveParse(value: any, type: any) {
        if (type === Boolean) {
            return this.toBoolean(value);
        }

        if (type === Number) {
            if (value === true) return 1
            if (value === false) return 0
            const val = Number(value)
            if (!isNaN(value)) return val
        }

        if (type === String) {
            if (_.isString(value) || _.isNumber(value) || _.isBoolean(value) || _.isNull(value)) return _.toString(value)
        }
        
        return value;
    }

    static select(...values: any[]) {
        return values.find(v => v !== undefined)
    }
}