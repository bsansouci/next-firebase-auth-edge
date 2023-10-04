"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = void 0;
const rotating_credential_1 = require("../rotating-credential");
const jose_1 = require("jose");
const get = (keys) => {
    const credential = new rotating_credential_1.RotatingCredential(keys);
    return async ({ signatureCookie, signedCookie, }) => {
        if (!(await credential.verify(signedCookie.value, signatureCookie.value))) {
            return null;
        }
        return {
            name: signedCookie.name,
            value: new TextDecoder().decode(jose_1.base64url.decode(signedCookie.value)),
        };
    };
};
exports.get = get;
//# sourceMappingURL=get.js.map