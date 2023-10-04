"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceAccountSigner = void 0;
const sign_1 = require("./sign");
class ServiceAccountSigner {
    constructor(credential) {
        this.credential = credential;
    }
    async sign(payload) {
        return (0, sign_1.sign)({ payload, privateKey: this.credential.privateKey });
    }
    getAccountId() {
        return Promise.resolve(this.credential.clientEmail);
    }
}
exports.ServiceAccountSigner = ServiceAccountSigner;
//# sourceMappingURL=crypto-signer.js.map