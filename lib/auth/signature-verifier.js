"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPublicKey = exports.PublicKeySignatureVerifier = exports.UrlKeyFetcher = exports.ALGORITHM_RS256 = void 0;
const validator_1 = require("./validator");
const verify_1 = require("./jwt/verify");
const jose_1 = require("jose");
const firebase_1 = require("./firebase");
const error_1 = require("./error");
exports.ALGORITHM_RS256 = "RS256";
function getExpiresAt(res) {
    if (!res.headers.has("cache-control")) {
        return 0;
    }
    const cacheControlHeader = res.headers.get("cache-control");
    const parts = cacheControlHeader.split(",");
    const maxAge = parts.reduce((acc, part) => {
        const subParts = part.trim().split("=");
        if (subParts[0] === "max-age") {
            return +subParts[1];
        }
        return acc;
    }, 0);
    return Date.now() + maxAge * 1000;
}
const keyResponseCache = new Map();
class UrlKeyFetcher {
    constructor(clientCertUrl) {
        this.clientCertUrl = clientCertUrl;
        if (!(0, validator_1.isURL)(clientCertUrl)) {
            throw new Error("The provided public client certificate URL is not a valid URL.");
        }
    }
    async fetchPublicKeysResponse(url) {
        const res = await fetch(url);
        if (!res.ok) {
            let errorMessage = "Error fetching public keys for Google certs: ";
            const data = await res.json();
            if (data.error) {
                errorMessage += `${data.error}`;
                if (data.error_description) {
                    errorMessage += " (" + data.error_description + ")";
                }
            }
            else {
                errorMessage += `${await res.text()}`;
            }
            throw new Error(errorMessage);
        }
        const data = await res.json();
        if (data.error) {
            throw new Error("Error fetching public keys for Google certs: " + data.error);
        }
        const expiresAt = getExpiresAt(res);
        return {
            keys: data,
            expiresAt,
        };
    }
    async fetchAndCachePublicKeys(url) {
        const response = await this.fetchPublicKeysResponse(url);
        keyResponseCache.set(url.toString(), response);
        return response.keys;
    }
    async fetchPublicKeys() {
        const url = new URL(this.clientCertUrl);
        const cachedResponse = keyResponseCache.get(url.toString());
        if (!cachedResponse) {
            return this.fetchAndCachePublicKeys(url);
        }
        const { keys, expiresAt } = cachedResponse;
        const now = Date.now();
        if (expiresAt <= now) {
            return this.fetchAndCachePublicKeys(url);
        }
        return keys;
    }
}
exports.UrlKeyFetcher = UrlKeyFetcher;
class PublicKeySignatureVerifier {
    constructor(keyFetcher) {
        this.keyFetcher = keyFetcher;
        if (!(0, validator_1.isNonNullObject)(keyFetcher)) {
            throw new Error("The provided key fetcher is not an object or null.");
        }
    }
    static withCertificateUrl(clientCertUrl) {
        return new PublicKeySignatureVerifier(new UrlKeyFetcher(clientCertUrl));
    }
    async getPublicKey(header) {
        if ((0, firebase_1.useEmulator)()) {
            return "";
        }
        return fetchPublicKey(this.keyFetcher, header);
    }
    async verify(token, options) {
        const header = (0, jose_1.decodeProtectedHeader)(token);
        try {
            await (0, verify_1.verify)(token, () => this.getPublicKey(header), options);
        }
        catch (e) {
            if (e instanceof error_1.AuthError && e.code === error_1.AuthErrorCode.NO_KID_IN_HEADER) {
                await this.verifyWithoutKid(token);
                return;
            }
            throw e;
        }
    }
    async verifyWithoutKid(token) {
        const publicKeys = await this.keyFetcher.fetchPublicKeys();
        return this.verifyWithAllKeys(token, publicKeys);
    }
    async verifyWithAllKeys(token, keys) {
        const promises = [];
        Object.values(keys).forEach((key) => {
            const promise = (0, verify_1.verify)(token, async () => key)
                .then(() => true)
                .catch((error) => {
                if (error instanceof jose_1.errors.JWTExpired) {
                    throw error;
                }
                return false;
            });
            promises.push(promise);
        });
        return Promise.all(promises).then((result) => {
            if (result.every((r) => r === false)) {
                throw new error_1.AuthError(error_1.AuthErrorCode.INVALID_SIGNATURE);
            }
        });
    }
}
exports.PublicKeySignatureVerifier = PublicKeySignatureVerifier;
async function fetchPublicKey(fetcher, header) {
    if (!header.kid) {
        throw new error_1.AuthError(error_1.AuthErrorCode.NO_KID_IN_HEADER);
    }
    const kid = header.kid;
    const publicKeys = await fetcher.fetchPublicKeys();
    if (!Object.prototype.hasOwnProperty.call(publicKeys, kid)) {
        throw new error_1.AuthError(error_1.AuthErrorCode.NO_MATCHING_KID);
    }
    return publicKeys[kid];
}
exports.fetchPublicKey = fetchPublicKey;
//# sourceMappingURL=signature-verifier.js.map