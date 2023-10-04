export declare enum AuthErrorCode {
    USER_NOT_FOUND = "USER_NOT_FOUND",
    USER_DISABLED = "USER_DISABLED",
    INVALID_CREDENTIAL = "INVALID_CREDENTIAL",
    TOKEN_EXPIRED = "TOKEN_EXPIRED",
    TOKEN_REVOKED = "TOKEN_REVOKED",
    INVALID_ARGUMENT = "INVALID_ARGUMENT",
    INTERNAL_ERROR = "INTERNAL_ERROR",
    NO_KID_IN_HEADER = "NO_KID_IN_HEADER",
    NO_MATCHING_KID = "NO_MATCHING_KID",
    INVALID_SIGNATURE = "INVALID_SIGNATURE"
}
export declare class AuthError extends Error {
    readonly code: AuthErrorCode;
    constructor(code: AuthErrorCode, customMessage?: string);
    toJSON(): object;
}
