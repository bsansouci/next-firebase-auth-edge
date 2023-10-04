"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFirebaseTokenGenerator = exports.FirebaseTokenGenerator = exports.BLACKLISTED_CLAIMS = void 0;
const crypto_signer_1 = require("./jwt/crypto-signer");
const validator_1 = require("./validator");
const error_1 = require("./error");
const ONE_HOUR_IN_SECONDS = 60 * 60;
exports.BLACKLISTED_CLAIMS = [
    "acr",
    "amr",
    "at_hash",
    "aud",
    "auth_time",
    "azp",
    "cnf",
    "c_hash",
    "exp",
    "iat",
    "iss",
    "jti",
    "nbf",
    "nonce",
];
const FIREBASE_AUDIENCE = "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit";
class FirebaseTokenGenerator {
    constructor(signer, tenantId) {
        this.tenantId = tenantId;
        this.signer = signer;
    }
    createCustomToken(uid, developerClaims) {
        let errorMessage;
        if (uid.length > 128) {
            errorMessage =
                "`uid` argument must a uid with less than or equal to 128 characters.";
        }
        else if (!FirebaseTokenGenerator.isDeveloperClaimsValid_(developerClaims)) {
            errorMessage =
                "`developerClaims` argument must be a valid, non-null object containing the developer claims.";
        }
        if (errorMessage) {
            throw new error_1.AuthError(error_1.AuthErrorCode.INVALID_ARGUMENT, errorMessage);
        }
        const claims = {};
        if (typeof developerClaims !== "undefined") {
            for (const key in developerClaims) {
                if (Object.prototype.hasOwnProperty.call(developerClaims, key)) {
                    if (exports.BLACKLISTED_CLAIMS.indexOf(key) !== -1) {
                        throw new error_1.AuthError(error_1.AuthErrorCode.INVALID_ARGUMENT, `Developer claim "${key}" is reserved and cannot be specified.`);
                    }
                    claims[key] = developerClaims[key];
                }
            }
        }
        return this.signer.getAccountId().then(async (account) => {
            const iat = Math.floor(Date.now() / 1000);
            const body = {
                aud: FIREBASE_AUDIENCE,
                iat,
                exp: iat + ONE_HOUR_IN_SECONDS,
                iss: account,
                sub: account,
                uid,
            };
            if (this.tenantId) {
                body.tenant_id = this.tenantId;
            }
            if (Object.keys(claims).length > 0) {
                body.claims = claims;
            }
            return this.signer.sign(body);
        });
    }
    static isDeveloperClaimsValid_(developerClaims) {
        if (typeof developerClaims === "undefined") {
            return true;
        }
        return (0, validator_1.isNonNullObject)(developerClaims);
    }
}
exports.FirebaseTokenGenerator = FirebaseTokenGenerator;
function createFirebaseTokenGenerator(credential, tenantId) {
    const signer = new crypto_signer_1.ServiceAccountSigner(credential);
    return new FirebaseTokenGenerator(signer, tenantId);
}
exports.createFirebaseTokenGenerator = createFirebaseTokenGenerator;
//# sourceMappingURL=token-generator.js.map