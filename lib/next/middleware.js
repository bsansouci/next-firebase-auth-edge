"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = exports.refreshAuthCookies = exports.createAuthMiddlewareResponse = void 0;
const server_1 = require("next/server");
const cookies_1 = require("./cookies");
const tokens_1 = require("./tokens");
const auth_1 = require("../auth");
async function createAuthMiddlewareResponse(request, options) {
    if (request.nextUrl.pathname === options.loginPath) {
        return (0, cookies_1.setAuthCookies)(request.headers, {
            cookieName: options.cookieName,
            cookieSerializeOptions: options.cookieSerializeOptions,
            cookieSignatureKeys: options.cookieSignatureKeys,
            serviceAccount: options.serviceAccount,
            apiKey: options.apiKey,
        });
    }
    if (request.nextUrl.pathname === options.logoutPath) {
        return (0, cookies_1.removeAuthCookies)(request.headers, {
            cookieName: options.cookieName,
            cookieSerializeOptions: options.cookieSerializeOptions,
        });
    }
    return server_1.NextResponse.next();
}
exports.createAuthMiddlewareResponse = createAuthMiddlewareResponse;
async function refreshAuthCookies(idToken, response, options) {
    const { getCustomIdAndRefreshTokens } = (0, auth_1.getFirebaseAuth)(options.serviceAccount, options.apiKey);
    const idAndRefreshTokens = await getCustomIdAndRefreshTokens(idToken, options.apiKey);
    await (0, cookies_1.appendAuthCookies)(response, idAndRefreshTokens, options);
    return idAndRefreshTokens;
}
exports.refreshAuthCookies = refreshAuthCookies;
const defaultInvalidTokenHandler = async () => server_1.NextResponse.next();
const defaultValidTokenHandler = async () => server_1.NextResponse.next();
async function authentication(request, options) {
    var _a, _b, _c;
    const handleValidToken = (_a = options.handleValidToken) !== null && _a !== void 0 ? _a : defaultValidTokenHandler;
    const handleError = (_b = options.handleError) !== null && _b !== void 0 ? _b : defaultInvalidTokenHandler;
    const handleInvalidToken = (_c = options.handleInvalidToken) !== null && _c !== void 0 ? _c : defaultInvalidTokenHandler;
    if ([options.loginPath, options.logoutPath].includes(request.nextUrl.pathname)) {
        return createAuthMiddlewareResponse(request, options);
    }
    const { verifyIdToken, handleTokenRefresh } = (0, auth_1.getFirebaseAuth)(options.serviceAccount, options.apiKey);
    const idAndRefreshTokens = await (0, tokens_1.getRequestCookiesTokens)(request.cookies, options);
    if (!idAndRefreshTokens) {
        return handleInvalidToken();
    }
    return (0, auth_1.handleExpiredToken)(async () => {
        const decodedToken = await verifyIdToken(idAndRefreshTokens.idToken, options.checkRevoked);
        return await handleValidToken({
            token: idAndRefreshTokens.idToken,
            decodedToken,
        });
    }, async () => {
        const { token, decodedToken } = await handleTokenRefresh(idAndRefreshTokens.refreshToken, options.apiKey);
        return (0, cookies_1.appendAuthCookies)(await handleValidToken({ token, decodedToken }), {
            idToken: token,
            refreshToken: idAndRefreshTokens.refreshToken,
        }, options);
    }, async (e) => {
        return handleError(e);
    });
}
exports.authentication = authentication;
//# sourceMappingURL=middleware.js.map