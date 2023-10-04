"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirebaseAdminTokenProvider = exports.ServiceAccountCredential = void 0;
const sign_1 = require("./jwt/sign");
const TOKEN_EXPIRY_THRESHOLD_MILLIS = 5 * 60 * 1000;
const GOOGLE_TOKEN_AUDIENCE = "https://accounts.google.com/o/oauth2/token";
const GOOGLE_AUTH_TOKEN_HOST = "accounts.google.com";
const GOOGLE_AUTH_TOKEN_PATH = "/o/oauth2/token";
const ONE_HOUR_IN_SECONDS = 60 * 60;
const accessTokenCache = new Map();
class ServiceAccountCredential {
    constructor(serviceAccount) {
        this.projectId = serviceAccount.projectId;
        this.privateKey = serviceAccount.privateKey;
        this.clientEmail = serviceAccount.clientEmail;
    }
    async fetchAccessToken(url) {
        const token = await this.createJwt();
        const postData = "grant_type=urn%3Aietf%3Aparams%3Aoauth%3A" +
            "grant-type%3Ajwt-bearer&assertion=" +
            token;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
            body: postData,
        });
        const data = await response.json();
        if (!data.access_token || !data.expires_in) {
            throw new Error(`Unexpected response while fetching access token: ${JSON.stringify(data)}`);
        }
        return {
            accessToken: data.access_token,
            expirationTime: Date.now() + data.expires_in * 1000,
        };
    }
    async fetchAndCacheAccessToken(url) {
        const response = await this.fetchAccessToken(url);
        accessTokenCache.set(url.toString(), response);
        return response;
    }
    async getAccessToken(forceRefresh) {
        const url = new URL(`https://${GOOGLE_AUTH_TOKEN_HOST}${GOOGLE_AUTH_TOKEN_PATH}`);
        if (forceRefresh) {
            return this.fetchAndCacheAccessToken(url);
        }
        const cachedResponse = accessTokenCache.get(url.toString());
        if (!cachedResponse ||
            cachedResponse.expirationTime - Date.now() <=
                TOKEN_EXPIRY_THRESHOLD_MILLIS) {
            return this.fetchAndCacheAccessToken(url);
        }
        return cachedResponse;
    }
    async createJwt() {
        const iat = Math.floor(Date.now() / 1000);
        const payload = {
            aud: GOOGLE_TOKEN_AUDIENCE,
            iat,
            exp: iat + ONE_HOUR_IN_SECONDS,
            iss: this.clientEmail,
            sub: this.clientEmail,
            scope: [
                "https://www.googleapis.com/auth/cloud-platform",
                "https://www.googleapis.com/auth/firebase.database",
                "https://www.googleapis.com/auth/firebase.messaging",
                "https://www.googleapis.com/auth/identitytoolkit",
                "https://www.googleapis.com/auth/userinfo.email",
            ].join(" "),
        };
        return (0, sign_1.sign)({
            payload,
            privateKey: this.privateKey,
        });
    }
}
exports.ServiceAccountCredential = ServiceAccountCredential;
const getFirebaseAdminTokenProvider = (account) => {
    const credential = new ServiceAccountCredential(account);
    async function getToken(forceRefresh = false) {
        return credential.getAccessToken(forceRefresh);
    }
    return {
        getToken,
    };
};
exports.getFirebaseAdminTokenProvider = getFirebaseAdminTokenProvider;
//# sourceMappingURL=credential.js.map