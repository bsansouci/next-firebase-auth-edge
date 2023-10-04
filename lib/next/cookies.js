"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeAuthCookies = exports.setAuthCookies = exports.refreshAuthCookies = exports.appendAuthCookies = exports.appendAuthCookiesApi = void 0;
const auth_1 = require("../auth");
const sign_1 = require("../auth/cookies/sign");
const cookie_1 = require("cookie");
const server_1 = require("next/server");
const cookies_1 = require("../auth/cookies");
async function appendAuthCookiesApi(response, tokens, options) {
    const value = JSON.stringify(tokens);
    const { signatureCookie, signedCookie } = await (0, sign_1.sign)(options.cookieSignatureKeys)({
        name: options.cookieName,
        value,
    });
    response.setHeader("Set-Cookie", [
        (0, cookie_1.serialize)(signatureCookie.name, signatureCookie.value, options.cookieSerializeOptions),
        (0, cookie_1.serialize)(signedCookie.name, signedCookie.value, options.cookieSerializeOptions),
    ]);
}
exports.appendAuthCookiesApi = appendAuthCookiesApi;
async function appendAuthCookies(response, tokens, options) {
    const value = JSON.stringify(tokens);
    const { signatureCookie, signedCookie } = await (0, sign_1.sign)(options.cookieSignatureKeys)({
        name: options.cookieName,
        value,
    });
    response.headers.append("Set-Cookie", (0, cookie_1.serialize)(signatureCookie.name, signatureCookie.value, options.cookieSerializeOptions));
    response.headers.append("Set-Cookie", (0, cookie_1.serialize)(signedCookie.name, signedCookie.value, options.cookieSerializeOptions));
    return response;
}
exports.appendAuthCookies = appendAuthCookies;
async function refreshAuthCookies(idToken, response, options) {
    const { getCustomIdAndRefreshTokens } = (0, auth_1.getFirebaseAuth)(options.serviceAccount, options.apiKey);
    const idAndRefreshTokens = await getCustomIdAndRefreshTokens(idToken, options.apiKey);
    await appendAuthCookiesApi(response, idAndRefreshTokens, options);
    return idAndRefreshTokens;
}
exports.refreshAuthCookies = refreshAuthCookies;
async function setAuthCookies(headers, options) {
    var _a, _b;
    const { getCustomIdAndRefreshTokens } = (0, auth_1.getFirebaseAuth)(options.serviceAccount, options.apiKey);
    const token = (_b = (_a = headers.get("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1]) !== null && _b !== void 0 ? _b : "";
    const idAndRefreshTokens = await getCustomIdAndRefreshTokens(token, options.apiKey);
    const response = new server_1.NextResponse(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
    });
    return appendAuthCookies(response, idAndRefreshTokens, options);
}
exports.setAuthCookies = setAuthCookies;
function removeAuthCookies(headers, options) {
    const response = new server_1.NextResponse(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
    });
    const _a = options.cookieSerializeOptions, { maxAge, expires } = _a, cookieOptions = __rest(_a, ["maxAge", "expires"]);
    response.headers.append("Set-Cookie", (0, cookie_1.serialize)(options.cookieName, "", Object.assign(Object.assign({}, cookieOptions), { expires: new Date(0) })));
    response.headers.append("Set-Cookie", (0, cookie_1.serialize)((0, cookies_1.getSignatureCookieName)(options.cookieName), "", Object.assign(Object.assign({}, cookieOptions), { expires: new Date(0) })));
    return response;
}
exports.removeAuthCookies = removeAuthCookies;
//# sourceMappingURL=cookies.js.map