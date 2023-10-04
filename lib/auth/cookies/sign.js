"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sign = void 0;
const rotating_credential_1 = require("../rotating-credential");
const index_1 = require("./index");
const jose_1 = require("jose");
const sign = (keys) => {
    const credential = new rotating_credential_1.RotatingCredential(keys);
    return async (cookie) => {
        const value = jose_1.base64url.encode(cookie.value);
        const hash = await credential.sign(value);
        return {
            signedCookie: { name: cookie.name, value },
            signatureCookie: {
                name: (0, index_1.getSignatureCookieName)(cookie.name),
                value: hash,
            },
        };
    };
};
exports.sign = sign;
//# sourceMappingURL=sign.js.map