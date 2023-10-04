"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertMultiFactorInfoToServerFormat = exports.AuthRequestHandler = exports.AbstractAuthRequestHandler = exports.FIREBASE_AUTH_SIGN_UP_NEW_USER = exports.FIREBASE_AUTH_SET_ACCOUNT_INFO = exports.FIREBASE_AUTH_DELETE_ACCOUNT = exports.FIREBASE_AUTH_GET_ACCOUNT_INFO = exports.getSdkVersion = exports.ApiSettings = void 0;
const firebase_1 = require("./firebase");
const utils_1 = require("./utils");
const validator_1 = require("./validator");
const credential_1 = require("./credential");
const error_1 = require("./error");
class ApiSettings {
    constructor(endpoint, httpMethod = "POST") {
        this.endpoint = endpoint;
        this.httpMethod = httpMethod;
    }
    getEndpoint() {
        return this.endpoint;
    }
    getHttpMethod() {
        return this.httpMethod;
    }
}
exports.ApiSettings = ApiSettings;
function getSdkVersion() {
    return "11.2.0";
}
exports.getSdkVersion = getSdkVersion;
/** Firebase Auth request header. */
const FIREBASE_AUTH_HEADER = {
    "X-Client-Version": `Node/Admin/${getSdkVersion()}`,
    Accept: "application/json",
    "Content-Type": "application/json",
};
/** The Firebase Auth backend base URL format. */
const FIREBASE_AUTH_BASE_URL_FORMAT = "https://identitytoolkit.googleapis.com/{version}/projects/{projectId}{api}";
/** Firebase Auth base URlLformat when using the auth emultor. */
const FIREBASE_AUTH_EMULATOR_BASE_URL_FORMAT = "http://{host}/identitytoolkit.googleapis.com/{version}/projects/{projectId}{api}";
class AuthResourceUrlBuilder {
    constructor(version = "v1", projectId) {
        this.version = version;
        this.projectId = projectId;
        if ((0, firebase_1.useEmulator)()) {
            this.urlFormat = (0, utils_1.formatString)(FIREBASE_AUTH_EMULATOR_BASE_URL_FORMAT, {
                host: (0, firebase_1.emulatorHost)(),
            });
        }
        else {
            this.urlFormat = FIREBASE_AUTH_BASE_URL_FORMAT;
        }
    }
    async getUrl(api, params) {
        const baseParams = {
            version: this.version,
            projectId: this.projectId,
            api: api || "",
        };
        const baseUrl = (0, utils_1.formatString)(this.urlFormat, baseParams);
        return (0, utils_1.formatString)(baseUrl, params || {});
    }
}
exports.FIREBASE_AUTH_GET_ACCOUNT_INFO = new ApiSettings("/accounts:lookup", "POST");
exports.FIREBASE_AUTH_DELETE_ACCOUNT = new ApiSettings("/accounts:delete", "POST");
exports.FIREBASE_AUTH_SET_ACCOUNT_INFO = new ApiSettings("/accounts:update", "POST");
exports.FIREBASE_AUTH_SIGN_UP_NEW_USER = new ApiSettings("/accounts", "POST");
class AbstractAuthRequestHandler {
    static getErrorCode(response) {
        return (((0, validator_1.isNonNullObject)(response) && response.error && response.error.message) ||
            null);
    }
    constructor(serviceAccount) {
        this.getToken = (0, credential_1.getFirebaseAdminTokenProvider)(serviceAccount).getToken;
    }
    getAccountInfoByUid(uid) {
        const request = {
            localId: [uid],
        };
        return this.invokeRequestHandler(this.getAuthUrlBuilder(), exports.FIREBASE_AUTH_GET_ACCOUNT_INFO, request);
    }
    deleteAccount(uid) {
        return this.invokeRequestHandler(this.getAuthUrlBuilder(), exports.FIREBASE_AUTH_DELETE_ACCOUNT, {
            localId: uid,
        });
    }
    createNewAccount(properties) {
        const request = Object.assign({}, properties);
        if (typeof request.photoURL !== "undefined") {
            request.photoUrl = request.photoURL;
            delete request.photoURL;
        }
        if (typeof request.uid !== "undefined") {
            request.localId = request.uid;
            delete request.uid;
        }
        if (request.multiFactor) {
            if (Array.isArray(request.multiFactor.enrolledFactors) &&
                request.multiFactor.enrolledFactors.length > 0) {
                const mfaInfo = [];
                try {
                    request.multiFactor.enrolledFactors.forEach((multiFactorInfo) => {
                        if ("enrollmentTime" in multiFactorInfo) {
                            throw new error_1.AuthError(error_1.AuthErrorCode.INVALID_ARGUMENT, '"enrollmentTime" is not supported when adding second factors via "createUser()"');
                        }
                        else if ("uid" in multiFactorInfo) {
                            throw new error_1.AuthError(error_1.AuthErrorCode.INVALID_ARGUMENT, '"uid" is not supported when adding second factors via "createUser()"');
                        }
                        mfaInfo.push(convertMultiFactorInfoToServerFormat(multiFactorInfo));
                    });
                }
                catch (e) {
                    return Promise.reject(e);
                }
                request.mfaInfo = mfaInfo;
            }
            delete request.multiFactor;
        }
        return this.invokeRequestHandler(this.getAuthUrlBuilder(), exports.FIREBASE_AUTH_SIGN_UP_NEW_USER, request).then((response) => {
            return response.localId;
        });
    }
    updateExistingAccount(uid, properties) {
        const request = Object.assign(Object.assign({}, properties), { deleteAttribute: [], localId: uid });
        const deletableParams = {
            displayName: "DISPLAY_NAME",
            photoURL: "PHOTO_URL",
        };
        request.deleteAttribute = [];
        for (const key in deletableParams) {
            if (request[key] === null) {
                request.deleteAttribute.push(deletableParams[key]);
                delete request[key];
            }
        }
        if (request.deleteAttribute.length === 0) {
            delete request.deleteAttribute;
        }
        if (request.phoneNumber === null) {
            request.deleteProvider
                ? request.deleteProvider.push("phone")
                : (request.deleteProvider = ["phone"]);
            delete request.phoneNumber;
        }
        if (typeof request.providerToLink !== "undefined") {
            request.linkProviderUserInfo = Object.assign({}, request.providerToLink);
            delete request.providerToLink;
            request.linkProviderUserInfo.rawId = request.linkProviderUserInfo.uid;
            delete request.linkProviderUserInfo.uid;
        }
        if (typeof request.providersToUnlink !== "undefined") {
            if (!Array.isArray(request.deleteProvider)) {
                request.deleteProvider = [];
            }
            request.deleteProvider = request.deleteProvider.concat(request.providersToUnlink);
            delete request.providersToUnlink;
        }
        if (typeof request.photoURL !== "undefined") {
            request.photoUrl = request.photoURL;
            delete request.photoURL;
        }
        if (typeof request.disabled !== "undefined") {
            request.disableUser = request.disabled;
            delete request.disabled;
        }
        if (request.multiFactor) {
            if (request.multiFactor.enrolledFactors === null) {
                request.mfa = {};
            }
            else if (Array.isArray(request.multiFactor.enrolledFactors)) {
                request.mfa = {
                    enrollments: [],
                };
                try {
                    request.multiFactor.enrolledFactors.forEach((multiFactorInfo) => {
                        request.mfa.enrollments.push(convertMultiFactorInfoToServerFormat(multiFactorInfo));
                    });
                }
                catch (e) {
                    return Promise.reject(e);
                }
                if (request.mfa.enrollments.length === 0) {
                    delete request.mfa.enrollments;
                }
            }
            delete request.multiFactor;
        }
        return this.invokeRequestHandler(this.getAuthUrlBuilder(), exports.FIREBASE_AUTH_SET_ACCOUNT_INFO, request).then((response) => {
            return response.localId;
        });
    }
    setCustomUserClaims(uid, customUserClaims) {
        if (customUserClaims === null) {
            customUserClaims = {};
        }
        const request = {
            localId: uid,
            customAttributes: JSON.stringify(customUserClaims),
        };
        return this.invokeRequestHandler(this.getAuthUrlBuilder(), exports.FIREBASE_AUTH_SET_ACCOUNT_INFO, request).then((response) => {
            return response.localId;
        });
    }
    async invokeRequestHandler(urlBuilder, apiSettings, requestData, additionalResourceParams) {
        const url = await urlBuilder.getUrl(apiSettings.getEndpoint(), additionalResourceParams);
        const token = await this.getToken();
        const res = await fetch(url, {
            method: apiSettings.getHttpMethod(),
            headers: Object.assign(Object.assign({}, FIREBASE_AUTH_HEADER), { Authorization: `Bearer ${token.accessToken}` }),
            body: JSON.stringify(requestData),
        });
        if (!res.ok) {
            const error = await res.json();
            const errorCode = AbstractAuthRequestHandler.getErrorCode(error);
            if (!errorCode) {
                throw new error_1.AuthError(error_1.AuthErrorCode.INTERNAL_ERROR, `Error returned from server: ${JSON.stringify(error)}.`);
            }
            throw new error_1.AuthError(error_1.AuthErrorCode.INTERNAL_ERROR, `Error returned from server: ${JSON.stringify(error)}. Code: ${errorCode}`);
        }
        return await res.json();
    }
    getAuthUrlBuilder() {
        if (!this.authUrlBuilder) {
            this.authUrlBuilder = this.newAuthUrlBuilder();
        }
        return this.authUrlBuilder;
    }
}
exports.AbstractAuthRequestHandler = AbstractAuthRequestHandler;
class AuthRequestHandler extends AbstractAuthRequestHandler {
    constructor(serviceAccount) {
        super(serviceAccount);
        this.serviceAccount = serviceAccount;
        this.authResourceUrlBuilder = new AuthResourceUrlBuilder("v2", serviceAccount.projectId);
    }
    newAuthUrlBuilder() {
        return new AuthResourceUrlBuilder("v1", this.serviceAccount.projectId);
    }
}
exports.AuthRequestHandler = AuthRequestHandler;
function isPhoneFactor(multiFactorInfo) {
    return multiFactorInfo.factorId === "phone";
}
function isUTCDateString(dateString) {
    try {
        return dateString && new Date(dateString).toUTCString() === dateString;
    }
    catch (e) {
        return false;
    }
}
function convertMultiFactorInfoToServerFormat(multiFactorInfo) {
    let enrolledAt;
    if (typeof multiFactorInfo.enrollmentTime !== "undefined") {
        if (isUTCDateString(multiFactorInfo.enrollmentTime)) {
            enrolledAt = new Date(multiFactorInfo.enrollmentTime).toISOString();
        }
        else {
            throw new error_1.AuthError(error_1.AuthErrorCode.INVALID_ARGUMENT, `The second factor "enrollmentTime" for "${multiFactorInfo.uid}" must be a valid ` +
                "UTC date string.");
        }
    }
    if (isPhoneFactor(multiFactorInfo)) {
        const authFactorInfo = {
            mfaEnrollmentId: multiFactorInfo.uid,
            displayName: multiFactorInfo.displayName,
            phoneInfo: multiFactorInfo.phoneNumber,
            enrolledAt,
        };
        for (const objKey in authFactorInfo) {
            if (typeof authFactorInfo[objKey] === "undefined") {
                delete authFactorInfo[objKey];
            }
        }
        return authFactorInfo;
    }
    else {
        throw new error_1.AuthError(error_1.AuthErrorCode.INVALID_ARGUMENT, `Unsupported second factor "${JSON.stringify(multiFactorInfo)}" provided.`);
    }
}
exports.convertMultiFactorInfoToServerFormat = convertMultiFactorInfoToServerFormat;
//# sourceMappingURL=auth-request-handler.js.map