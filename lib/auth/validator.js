"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isURL = exports.isNonNullObject = exports.isArray = exports.isObject = void 0;
function isObject(value) {
    return typeof value === "object" && !isArray(value);
}
exports.isObject = isObject;
function isArray(value) {
    return Array.isArray(value);
}
exports.isArray = isArray;
function isNonNullObject(value) {
    return isObject(value) && value !== null;
}
exports.isNonNullObject = isNonNullObject;
function isURL(urlStr) {
    if (typeof urlStr !== "string") {
        return false;
    }
    const re = /[^a-z0-9:/?#[\]@!$&'()*+,;=.\-_~%]/i;
    if (re.test(urlStr)) {
        return false;
    }
    try {
        const uri = new URL(urlStr);
        const scheme = uri.protocol;
        const hostname = uri.hostname;
        const pathname = uri.pathname;
        if (scheme !== "http:" && scheme !== "https:") {
            return false;
        }
        if (!hostname ||
            !/^[a-zA-Z0-9]+[\w-]*([.]?[a-zA-Z0-9]+[\w-]*)*$/.test(hostname)) {
            return false;
        }
        const pathnameRe = /^(\/[\w\-.~!$'()*+,;=:@%]+)*\/?$/;
        if (pathname && pathname !== "/" && !pathnameRe.test(pathname)) {
            return false;
        }
    }
    catch (e) {
        return false;
    }
    return true;
}
exports.isURL = isURL;
//# sourceMappingURL=validator.js.map