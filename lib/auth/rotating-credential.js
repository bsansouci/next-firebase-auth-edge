"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotatingCredential = void 0;
const jose_1 = require("jose");
function toUint8Array(key) {
    return Uint8Array.from(key.split("").map((x) => x.charCodeAt(0)));
}
class RotatingCredential {
    constructor(keys) {
        this.keys = keys;
    }
    async signKey(data, keyValue) {
        const jws = await new jose_1.FlattenedSign(jose_1.base64url.decode(data))
            .setProtectedHeader({ alg: "HS256" })
            .sign(toUint8Array(keyValue));
        return jws.signature;
    }
    async sign(data) {
        return this.signKey(data, this.keys[0]);
    }
    async verify(data, digest) {
        return (await this.index(data, digest)) > -1;
    }
    async index(data, digest) {
        for (const key of this.keys) {
            const signedKey = await this.signKey(data, key);
            if (signedKey === digest) {
                return this.keys.findIndex((it) => it === key);
            }
        }
        return -1;
    }
}
exports.RotatingCredential = RotatingCredential;
//# sourceMappingURL=rotating-credential.js.map