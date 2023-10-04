"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sign = void 0;
const jose_1 = require("jose");
const signature_verifier_1 = require("../signature-verifier");
async function sign({ payload, privateKey, keyId, }) {
    const key = await (0, jose_1.importPKCS8)(privateKey, signature_verifier_1.ALGORITHM_RS256);
    return new jose_1.SignJWT(payload)
        .setProtectedHeader({ alg: signature_verifier_1.ALGORITHM_RS256, kid: keyId })
        .sign(key);
}
exports.sign = sign;
//# sourceMappingURL=sign.js.map