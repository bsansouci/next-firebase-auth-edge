"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirebaseAuth = exports.handleExpiredToken = exports.isInvalidCredentialError = exports.isUserNotFoundError = exports.customTokenToIdAndRefreshTokens = void 0;
const firebase_1 = require("./firebase");
const token_verifier_1 = require("./token-verifier");
const auth_request_handler_1 = require("./auth-request-handler");
const credential_1 = require("./credential");
const user_record_1 = require("./user-record");
const token_generator_1 = require("./token-generator");
const error_1 = require("./error");
const getCustomTokenEndpoint = (apiKey) => {
    if ((0, firebase_1.useEmulator)()) {
        return `http://${process.env
            .FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`;
    }
    return `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`;
};
const getRefreshTokenEndpoint = (apiKey) => {
    if ((0, firebase_1.useEmulator)()) {
        return `http://${process.env
            .FIREBASE_AUTH_EMULATOR_HOST}/securetoken.googleapis.com/v1/token?key=${apiKey}`;
    }
    return `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;
};
async function customTokenToIdAndRefreshTokens(customToken, firebaseApiKey) {
    const refreshTokenResponse = await fetch(getCustomTokenEndpoint(firebaseApiKey), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            token: customToken,
            returnSecureToken: true,
        }),
    });
    const refreshTokenJSON = (await refreshTokenResponse.json());
    if (!refreshTokenResponse.ok) {
        throw new Error(`Problem getting a refresh token: ${JSON.stringify(refreshTokenJSON)}`);
    }
    return {
        idToken: refreshTokenJSON.idToken,
        refreshToken: refreshTokenJSON.refreshToken,
    };
}
exports.customTokenToIdAndRefreshTokens = customTokenToIdAndRefreshTokens;
const isUserNotFoundResponse = (data) => {
    var _a, _b;
    return (((_a = data === null || data === void 0 ? void 0 : data.error) === null || _a === void 0 ? void 0 : _a.code) === 400 &&
        ((_b = data === null || data === void 0 ? void 0 : data.error) === null || _b === void 0 ? void 0 : _b.message) === "USER_NOT_FOUND");
};
const refreshExpiredIdToken = async (refreshToken, apiKey) => {
    // https://firebase.google.com/docs/reference/rest/auth/#section-refresh-token
    const response = await fetch(getRefreshTokenEndpoint(apiKey), {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
    });
    if (!response.ok) {
        const data = await response.json();
        const errorMessage = `Error fetching access token: ${JSON.stringify(data.error)} ${data.error_description ? `(${data.error_description})` : ""}`;
        if (isUserNotFoundResponse(data)) {
            throw new error_1.AuthError(error_1.AuthErrorCode.USER_NOT_FOUND);
        }
        throw new error_1.AuthError(error_1.AuthErrorCode.INVALID_CREDENTIAL, errorMessage);
    }
    const data = await response.json();
    return data.id_token;
};
function isUserNotFoundError(error) {
    return (error === null || error === void 0 ? void 0 : error.code) === error_1.AuthErrorCode.USER_NOT_FOUND;
}
exports.isUserNotFoundError = isUserNotFoundError;
function isInvalidCredentialError(error) {
    return (error === null || error === void 0 ? void 0 : error.code) === error_1.AuthErrorCode.INVALID_CREDENTIAL;
}
exports.isInvalidCredentialError = isInvalidCredentialError;
async function handleExpiredToken(verifyIdToken, onExpired, onError) {
    try {
        return await verifyIdToken();
    }
    catch (e) {
        switch (e.code) {
            case error_1.AuthErrorCode.TOKEN_EXPIRED:
                try {
                    return await onExpired(e);
                }
                catch (e) {
                    return onError(e);
                }
            default:
                return onError(e);
        }
    }
}
exports.handleExpiredToken = handleExpiredToken;
function getFirebaseAuth(serviceAccount, apiKey) {
    const authRequestHandler = new auth_request_handler_1.AuthRequestHandler(serviceAccount);
    const credential = new credential_1.ServiceAccountCredential(serviceAccount);
    const tokenGenerator = (0, token_generator_1.createFirebaseTokenGenerator)(credential);
    const handleTokenRefresh = async (refreshToken, firebaseApiKey) => {
        const newToken = await refreshExpiredIdToken(refreshToken, firebaseApiKey);
        const decodedToken = await verifyIdToken(newToken);
        return {
            decodedToken: decodedToken,
            token: newToken,
        };
    };
    async function getUser(uid) {
        return authRequestHandler.getAccountInfoByUid(uid).then((response) => {
            // Returns the user record populated with server response.
            return new user_record_1.UserRecord(response.users[0]);
        });
    }
    async function verifyDecodedJWTNotRevokedOrDisabled(decodedIdToken) {
        return getUser(decodedIdToken.sub).then((user) => {
            if (user.disabled) {
                throw new error_1.AuthError(error_1.AuthErrorCode.USER_DISABLED);
            }
            if (user.tokensValidAfterTime) {
                const authTimeUtc = decodedIdToken.auth_time * 1000;
                const validSinceUtc = new Date(user.tokensValidAfterTime).getTime();
                if (authTimeUtc < validSinceUtc) {
                    throw new error_1.AuthError(error_1.AuthErrorCode.TOKEN_REVOKED);
                }
            }
            return decodedIdToken;
        });
    }
    async function verifyIdToken(idToken, checkRevoked = false, options) {
        const idTokenVerifier = (0, token_verifier_1.createIdTokenVerifier)(serviceAccount.projectId);
        const decodedIdToken = await idTokenVerifier.verifyJWT(idToken, options);
        if (checkRevoked) {
            return verifyDecodedJWTNotRevokedOrDisabled(decodedIdToken);
        }
        return decodedIdToken;
    }
    async function verifyAndRefreshExpiredIdToken(token, refreshToken, options) {
        return await handleExpiredToken(async () => {
            const decodedToken = await verifyIdToken(token, false, options);
            return { token, decodedToken };
        }, async () => {
            if (refreshToken) {
                return handleTokenRefresh(refreshToken, apiKey);
            }
            return null;
        }, async () => {
            return null;
        });
    }
    function createCustomToken(uid, developerClaims) {
        return tokenGenerator.createCustomToken(uid, developerClaims);
    }
    async function getCustomIdAndRefreshTokens(idToken, firebaseApiKey) {
        const tenant = await verifyIdToken(idToken);
        const customToken = await createCustomToken(tenant.uid);
        return customTokenToIdAndRefreshTokens(customToken, firebaseApiKey);
    }
    async function deleteUser(uid) {
        await authRequestHandler.deleteAccount(uid);
    }
    async function setCustomUserClaims(uid, customUserClaims) {
        await authRequestHandler.setCustomUserClaims(uid, customUserClaims);
    }
    async function createUser(properties) {
        return authRequestHandler.createNewAccount(properties).then((uid) => {
            return getUser(uid);
        });
    }
    async function updateUser(uid, properties) {
        return authRequestHandler
            .updateExistingAccount(uid, properties)
            .then((existingUid) => {
            return getUser(existingUid);
        });
    }
    return {
        verifyAndRefreshExpiredIdToken,
        verifyIdToken,
        createCustomToken,
        getCustomIdAndRefreshTokens,
        handleTokenRefresh,
        deleteUser,
        setCustomUserClaims,
        getUser,
        updateUser,
        createUser,
    };
}
exports.getFirebaseAuth = getFirebaseAuth;
//# sourceMappingURL=index.js.map