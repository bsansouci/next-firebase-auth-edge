"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokensFromObject = exports.getTokens = exports.getRequestCookiesTokens = exports.validateOptions = void 0;
const cookies_1 = require("../auth/cookies");
const auth_1 = require("../auth");
const get_1 = require("../auth/cookies/get");
function validateOptions(options) {
    if (!options.cookieSignatureKeys.length) {
        throw new Error("You should provide at least one cookie signature encryption key");
    }
}
exports.validateOptions = validateOptions;
async function getRequestCookiesTokens(cookies, options) {
    const signedCookie = cookies.get(options.cookieName);
    const signatureCookie = cookies.get((0, cookies_1.getSignatureCookieName)(options.cookieName));
    if (!signedCookie || !signatureCookie) {
        return null;
    }
    const cookie = await (0, get_1.get)(options.cookieSignatureKeys)({
        signedCookie,
        signatureCookie,
    });
    if (!(cookie === null || cookie === void 0 ? void 0 : cookie.value)) {
        return null;
    }
    return JSON.parse(cookie.value);
}
exports.getRequestCookiesTokens = getRequestCookiesTokens;
async function getTokens(cookies, options) {
    validateOptions(options);
    const { verifyAndRefreshExpiredIdToken } = (0, auth_1.getFirebaseAuth)(options.serviceAccount, options.apiKey);
    const tokens = await getRequestCookiesTokens(cookies, options);
    if (!tokens) {
        return null;
    }
    return verifyAndRefreshExpiredIdToken(tokens.idToken, tokens.refreshToken);
}
exports.getTokens = getTokens;
async function getCookiesTokens(cookies, options) {
    const signedCookie = cookies[options.cookieName];
    const signatureCookie = cookies[(0, cookies_1.getSignatureCookieName)(options.cookieName)];
    if (!signedCookie || !signatureCookie) {
        return null;
    }
    const cookie = await (0, get_1.get)(options.cookieSignatureKeys)({
        signedCookie: {
            name: options.cookieName,
            value: signedCookie,
        },
        signatureCookie: {
            name: (0, cookies_1.getSignatureCookieName)(options.cookieName),
            value: signatureCookie,
        },
    });
    if (!(cookie === null || cookie === void 0 ? void 0 : cookie.value)) {
        return null;
    }
    return JSON.parse(cookie.value);
}
async function getTokensFromObject(cookies, options) {
    const { verifyAndRefreshExpiredIdToken } = (0, auth_1.getFirebaseAuth)(options.serviceAccount, options.apiKey);
    const tokens = await getCookiesTokens(cookies, options);
    if (!tokens) {
        return null;
    }
    return verifyAndRefreshExpiredIdToken(tokens.idToken, tokens.refreshToken);
}
exports.getTokensFromObject = getTokensFromObject;
//# sourceMappingURL=tokens.js.map