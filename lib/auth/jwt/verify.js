"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = exports.getPublicCryptoKey = void 0;
const firebase_1 = require("../firebase");
const jose_1 = require("jose");
const signature_verifier_1 = require("../signature-verifier");
const keyMap = new Map();
async function importPublicCryptoKey(publicKey) {
    if (publicKey.startsWith("-----BEGIN CERTIFICATE-----")) {
        return (0, jose_1.importX509)(publicKey, signature_verifier_1.ALGORITHM_RS256);
    }
    return (0, jose_1.importSPKI)(publicKey, signature_verifier_1.ALGORITHM_RS256);
}
async function getPublicCryptoKey(publicKey) {
    const cachedKey = keyMap.get(publicKey);
    if (cachedKey) {
        return cachedKey;
    }
    const key = await importPublicCryptoKey(publicKey);
    keyMap.set(publicKey, key);
    return key;
}
exports.getPublicCryptoKey = getPublicCryptoKey;
async function verify(jwtString, getPublicKey, options = {}) {
    var _a;
    const currentDate = (_a = options.currentDate) !== null && _a !== void 0 ? _a : new Date();
    const currentTimestamp = currentDate.getTime() / 1000;
    const payload = (0, jose_1.decodeJwt)(jwtString);
    if (!(0, firebase_1.useEmulator)()) {
        const key = await getPublicCryptoKey(await getPublicKey());
        const { payload } = await (0, jose_1.jwtVerify)(jwtString, key, { currentDate });
        return payload;
    }
    if (typeof payload.nbf !== "undefined") {
        if (typeof payload.nbf !== "number") {
            throw new jose_1.errors.JWTInvalid("invalid nbf value");
        }
        if (payload.nbf > currentTimestamp) {
            throw new jose_1.errors.JWTExpired("jwt not active: " + new Date(payload.nbf * 1000).toISOString());
        }
    }
    if (typeof payload.exp !== "undefined") {
        if (typeof payload.exp !== "number") {
            throw new jose_1.errors.JWTInvalid("invalid exp value");
        }
        if (currentTimestamp >= payload.exp) {
            throw new jose_1.errors.JWTExpired("token expired: " + new Date(payload.exp * 1000).toISOString());
        }
    }
    return payload;
}
exports.verify = verify;
//# sourceMappingURL=verify.js.map