"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rotating_credential_1 = require("./rotating-credential");
describe("rotating-credential", () => {
    it("should sign and verify string using provided keys", async () => {
        const credential = new rotating_credential_1.RotatingCredential(["key1", "key2"]);
        const key = await credential.sign("some string");
        expect(key).toEqual("5HbAdrpJpHWA9T_0SMi3bEb3cp6ZArMxq1FF0GAOMyc");
        expect(await credential.verify("some string", key)).toBe(true);
        expect(await credential.verify("some string", "wat")).toBe(false);
        expect(await credential.verify("some", key)).toBe(false);
    });
    it("should sign and verify string using different set keys where at least one matches", async () => {
        const credential1 = new rotating_credential_1.RotatingCredential(["key1", "key2"]);
        const credential2 = new rotating_credential_1.RotatingCredential(["key2"]);
        const credential3 = new rotating_credential_1.RotatingCredential(["key2", "key1"]);
        const key1 = await credential1.sign("some string");
        const key2 = await credential2.sign("some string");
        const key3 = await credential3.sign("some string");
        expect(await credential1.verify("some string", key2)).toBe(true);
        expect(await credential1.verify("some string", key3)).toBe(true);
        expect(await credential3.verify("some string", key2)).toBe(true);
        expect(await credential3.verify("some string", key1)).toBe(true);
        expect(await credential2.verify("some string", key1)).toBe(false);
    });
});
//# sourceMappingURL=rotating-credential.test.js.map