"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIdTokenVerifier = exports.FirebaseTokenVerifier = void 0;
const firebase_1 = require("./firebase");
const signature_verifier_1 = require("./signature-verifier");
const validator_1 = require("./validator");
const jose_1 = require("jose");
const error_1 = require("./error");
class FirebaseTokenVerifier {
    constructor(clientCertUrl, issuer, projectId) {
        this.issuer = issuer;
        this.projectId = projectId;
        if (!(0, validator_1.isURL)(clientCertUrl)) {
            throw new error_1.AuthError(error_1.AuthErrorCode.INVALID_ARGUMENT, "The provided public client certificate URL is an invalid URL.");
        }
        this.signatureVerifier =
            signature_verifier_1.PublicKeySignatureVerifier.withCertificateUrl(clientCertUrl);
    }
    async verifyJWT(jwtToken, options) {
        const decoded = await this.decodeAndVerify(jwtToken, this.projectId, options);
        const decodedIdToken = decoded.payload;
        decodedIdToken.uid = decodedIdToken.sub;
        return decodedIdToken;
    }
    async decodeAndVerify(token, projectId, options) {
        const header = (0, jose_1.decodeProtectedHeader)(token);
        const payload = (0, jose_1.decodeJwt)(token);
        this.verifyContent({ header, payload }, projectId);
        await this.verifySignature(token, options);
        return { header, payload };
    }
    verifyContent(fullDecodedToken, projectId) {
        const header = fullDecodedToken && fullDecodedToken.header;
        const payload = fullDecodedToken && fullDecodedToken.payload;
        let errorMessage;
        if (!(0, firebase_1.useEmulator)() && typeof header.kid === "undefined") {
            const isCustomToken = payload.aud === firebase_1.FIREBASE_AUDIENCE;
            if (isCustomToken) {
                errorMessage = `idToken was expected, but custom token was provided`;
            }
            else {
                errorMessage = `idToken has no "kid" claim.`;
            }
        }
        else if (!(0, firebase_1.useEmulator)() && header.alg !== signature_verifier_1.ALGORITHM_RS256) {
            errorMessage = `Incorrect algorithm. ${signature_verifier_1.ALGORITHM_RS256} expected, ${header.alg} provided`;
        }
        else if (payload.iss !== this.issuer + projectId) {
            errorMessage = `idToken has incorrect "iss" (issuer) claim. Expected ${this.issuer}${projectId}, but got ${payload.iss}`;
        }
        else if (typeof payload.sub !== "string") {
        }
        else if (payload.sub === "") {
            errorMessage = `idToken has an empty string "sub" (subject) claim.`;
        }
        else if (payload.sub.length > 128) {
            errorMessage = `idToken has "sub" (subject) claim longer than 128 characters.`;
        }
        if (errorMessage) {
            throw new error_1.AuthError(error_1.AuthErrorCode.INVALID_ARGUMENT, errorMessage);
        }
    }
    verifySignature(jwtToken, options) {
        return this.signatureVerifier.verify(jwtToken, options).catch((error) => {
            throw this.mapJoseErrorToAuthError(error);
        });
    }
    mapJoseErrorToAuthError(error) {
        if (error instanceof jose_1.errors.JWTExpired) {
            return new error_1.AuthError(error_1.AuthErrorCode.TOKEN_EXPIRED, error.message);
        }
        if (error instanceof jose_1.errors.JWSSignatureVerificationFailed) {
            return new error_1.AuthError(error_1.AuthErrorCode.INVALID_SIGNATURE);
        }
        if (error instanceof error_1.AuthError &&
            error.code === error_1.AuthErrorCode.NO_MATCHING_KID) {
            const message = `idToken has "kid" claim which does not correspond to a known public key. Most likely the token is expired, so get a fresh token from your client app and try again.`;
            return new error_1.AuthError(error_1.AuthErrorCode.INVALID_ARGUMENT, message);
        }
        return new error_1.AuthError(error_1.AuthErrorCode.INTERNAL_ERROR, error.message);
    }
}
exports.FirebaseTokenVerifier = FirebaseTokenVerifier;
function createIdTokenVerifier(projectId) {
    return new FirebaseTokenVerifier(firebase_1.CLIENT_CERT_URL, "https://securetoken.google.com/", projectId);
}
exports.createIdTokenVerifier = createIdTokenVerifier;
//# sourceMappingURL=token-verifier.js.map