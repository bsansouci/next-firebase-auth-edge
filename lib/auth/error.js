"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthError = exports.AuthErrorCode = void 0;
var AuthErrorCode;
(function (AuthErrorCode) {
    AuthErrorCode["USER_NOT_FOUND"] = "USER_NOT_FOUND";
    AuthErrorCode["USER_DISABLED"] = "USER_DISABLED";
    AuthErrorCode["INVALID_CREDENTIAL"] = "INVALID_CREDENTIAL";
    AuthErrorCode["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    AuthErrorCode["TOKEN_REVOKED"] = "TOKEN_REVOKED";
    AuthErrorCode["INVALID_ARGUMENT"] = "INVALID_ARGUMENT";
    AuthErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    AuthErrorCode["NO_KID_IN_HEADER"] = "NO_KID_IN_HEADER";
    AuthErrorCode["NO_MATCHING_KID"] = "NO_MATCHING_KID";
    AuthErrorCode["INVALID_SIGNATURE"] = "INVALID_SIGNATURE";
})(AuthErrorCode = exports.AuthErrorCode || (exports.AuthErrorCode = {}));
const AuthErrorMessages = {
    [AuthErrorCode.USER_NOT_FOUND]: "User not found",
    [AuthErrorCode.INVALID_CREDENTIAL]: "Invalid credentials",
    [AuthErrorCode.TOKEN_EXPIRED]: "Token expired",
    [AuthErrorCode.USER_DISABLED]: "User disabled",
    [AuthErrorCode.TOKEN_REVOKED]: "Token revoked",
    [AuthErrorCode.INVALID_ARGUMENT]: "Invalid argument",
    [AuthErrorCode.INTERNAL_ERROR]: "Internal error",
    [AuthErrorCode.NO_KID_IN_HEADER]: "No kid in jwt header",
    [AuthErrorCode.NO_MATCHING_KID]: "Kid is not matching any certificate",
    [AuthErrorCode.INVALID_SIGNATURE]: "Invalid token signature.",
};
function getErrorMessage(code, customMessage) {
    if (!customMessage) {
        return AuthErrorMessages[code];
    }
    return `${AuthErrorMessages[code]}: ${customMessage}`;
}
class AuthError extends Error {
    constructor(code, customMessage) {
        super(getErrorMessage(code, customMessage));
        this.code = code;
        Object.setPrototypeOf(this, AuthError.prototype);
    }
    toJSON() {
        return {
            code: this.code,
            message: this.message,
        };
    }
}
exports.AuthError = AuthError;
//# sourceMappingURL=error.js.map