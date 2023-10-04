"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepExtend = exports.deepCopy = exports.addReadonlyGetter = exports.formatString = void 0;
function formatString(str, params) {
    let formatted = str;
    Object.keys(params || {}).forEach((key) => {
        formatted = formatted.replace(new RegExp("{" + key + "}", "g"), params[key]);
    });
    return formatted;
}
exports.formatString = formatString;
function addReadonlyGetter(obj, prop, value) {
    Object.defineProperty(obj, prop, {
        value,
        writable: false,
        enumerable: true,
    });
}
exports.addReadonlyGetter = addReadonlyGetter;
function deepCopy(value) {
    return deepExtend(undefined, value);
}
exports.deepCopy = deepCopy;
function deepExtend(target, source) {
    if (!(source instanceof Object)) {
        return source;
    }
    switch (source.constructor) {
        case Date: {
            const dateValue = source;
            return new Date(dateValue.getTime());
        }
        case Object:
            if (target === undefined) {
                target = {};
            }
            break;
        case Array:
            target = [];
            break;
        default:
            return source;
    }
    for (const prop in source) {
        if (!Object.prototype.hasOwnProperty.call(source, prop)) {
            continue;
        }
        target[prop] = deepExtend(target[prop], source[prop]);
    }
    return target;
}
exports.deepExtend = deepExtend;
//# sourceMappingURL=utils.js.map