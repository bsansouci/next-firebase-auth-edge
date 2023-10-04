"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterStandardClaims = exports.STANDARD_CLAIMS = void 0;
exports.STANDARD_CLAIMS = [
    "aud",
    "auth_time",
    "email",
    "email_verified",
    "exp",
    "firebase",
    "iat",
    "iss",
    "name",
    "phone_number",
    "picture",
    "sub",
    "uid",
    "user_id",
];
const filterStandardClaims = (obj = {}) => {
    const claims = {};
    Object.keys(obj).forEach((key) => {
        if (!exports.STANDARD_CLAIMS.includes(key)) {
            claims[key] = obj[key];
        }
    });
    return claims;
};
exports.filterStandardClaims = filterStandardClaims;
//# sourceMappingURL=claims.js.map