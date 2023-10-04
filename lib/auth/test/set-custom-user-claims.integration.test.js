"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const uuid_1 = require("uuid");
const { FIREBASE_API_KEY, FIREBASE_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY, } = process.env;
describe("set custom user claims integration test", () => {
    const { createCustomToken, getUser, setCustomUserClaims, verifyIdToken } = (0, index_1.getFirebaseAuth)({
        clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
        projectId: FIREBASE_PROJECT_ID,
    }, FIREBASE_API_KEY);
    it("should create custom user claims", async () => {
        const userId = (0, uuid_1.v4)();
        const customToken = await createCustomToken(userId, {
            customClaim: "customClaimValue",
        });
        const { idToken } = await (0, index_1.customTokenToIdAndRefreshTokens)(customToken, FIREBASE_API_KEY);
        await verifyIdToken(idToken);
        await setCustomUserClaims(userId, {
            newCustomClaim: "newCustomClaimValue",
        });
        const user = await getUser(userId);
        expect(user.uid).toEqual(userId);
        expect(user.customClaims).toEqual({
            newCustomClaim: "newCustomClaimValue",
        });
    });
});
//# sourceMappingURL=set-custom-user-claims.integration.test.js.map