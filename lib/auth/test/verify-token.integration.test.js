"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const uuid_1 = require("uuid");
const error_1 = require("../error");
const { FIREBASE_API_KEY, FIREBASE_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY, } = process.env;
const TEST_SERVICE_ACCOUNT = {
    clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
    projectId: FIREBASE_PROJECT_ID,
};
describe("verify token integration test", () => {
    const { handleTokenRefresh, createCustomToken, verifyAndRefreshExpiredIdToken, verifyIdToken, deleteUser, } = (0, index_1.getFirebaseAuth)(TEST_SERVICE_ACCOUNT, FIREBASE_API_KEY);
    it("should create and verify custom token", async () => {
        const userId = (0, uuid_1.v4)();
        const customToken = await createCustomToken(userId, {
            customClaim: "customClaimValue",
        });
        const { idToken } = await (0, index_1.customTokenToIdAndRefreshTokens)(customToken, FIREBASE_API_KEY);
        const tenant = await verifyIdToken(idToken);
        expect(tenant.uid).toEqual(userId);
        expect(tenant.customClaim).toEqual("customClaimValue");
    });
    it("should throw AuthError if token is expired", async () => {
        const userId = (0, uuid_1.v4)();
        const customToken = await createCustomToken(userId, {
            customClaim: "customClaimValue",
        });
        const { idToken } = await (0, index_1.customTokenToIdAndRefreshTokens)(customToken, FIREBASE_API_KEY);
        return expect(() => verifyIdToken(idToken, false, {
            currentDate: new Date(Date.now() + 7200 * 1000),
        })).rejects.toHaveProperty("code", error_1.AuthErrorCode.TOKEN_EXPIRED);
    });
    it("should refresh token if expired", async () => {
        var _a;
        const userId = (0, uuid_1.v4)();
        const customToken = await createCustomToken(userId, {
            customClaim: "customClaimValue",
        });
        const { idToken, refreshToken } = await (0, index_1.customTokenToIdAndRefreshTokens)(customToken, FIREBASE_API_KEY);
        const result = await verifyAndRefreshExpiredIdToken(idToken, refreshToken, {
            currentDate: new Date(Date.now() + 7200 * 1000),
        });
        expect((_a = result === null || result === void 0 ? void 0 : result.decodedToken) === null || _a === void 0 ? void 0 : _a.customClaim).toEqual("customClaimValue");
    });
    it("should verify token", async () => {
        const userId = (0, uuid_1.v4)();
        const customToken = await createCustomToken(userId, {
            customClaim: "customClaimValue",
        });
        const { idToken, refreshToken } = await (0, index_1.customTokenToIdAndRefreshTokens)(customToken, FIREBASE_API_KEY);
        const tokens = await verifyAndRefreshExpiredIdToken(idToken, refreshToken);
        expect(tokens === null || tokens === void 0 ? void 0 : tokens.decodedToken.uid).toEqual(userId);
        expect(tokens === null || tokens === void 0 ? void 0 : tokens.decodedToken.customClaim).toEqual("customClaimValue");
    });
    it("should checked revoked token", async () => {
        const userId = (0, uuid_1.v4)();
        const customToken = await createCustomToken(userId, {
            customClaim: "customClaimValue",
        });
        const { idToken } = await (0, index_1.customTokenToIdAndRefreshTokens)(customToken, FIREBASE_API_KEY);
        const tenant = await verifyIdToken(idToken, true);
        expect(tenant.uid).toEqual(userId);
        expect(tenant.customClaim).toEqual("customClaimValue");
    });
    it("should refresh token", async () => {
        const userId = (0, uuid_1.v4)();
        const customToken = await createCustomToken(userId, {
            customClaim: "customClaimValue",
        });
        const { idToken, refreshToken } = await (0, index_1.customTokenToIdAndRefreshTokens)(customToken, FIREBASE_API_KEY);
        const { decodedToken } = await handleTokenRefresh(refreshToken, FIREBASE_API_KEY);
        expect(decodedToken.uid).toEqual(userId);
        expect(decodedToken.customClaim).toEqual("customClaimValue");
        expect(decodedToken.token).not.toEqual(idToken);
    });
    it("should throw firebase auth error when user is not found during token refresh", async () => {
        const userId = (0, uuid_1.v4)();
        const customToken = await createCustomToken(userId, {
            customClaim: "customClaimValue",
        });
        const { refreshToken } = await (0, index_1.customTokenToIdAndRefreshTokens)(customToken, FIREBASE_API_KEY);
        await deleteUser(userId);
        return expect(() => handleTokenRefresh(refreshToken, FIREBASE_API_KEY)).rejects.toEqual(new error_1.AuthError(error_1.AuthErrorCode.USER_NOT_FOUND));
    });
    it('should be able to catch "user not found" error and return null', async () => {
        const userId = (0, uuid_1.v4)();
        const customToken = await createCustomToken(userId, {
            customClaim: "customClaimValue",
        });
        async function customGetToken() {
            try {
                return await handleTokenRefresh(refreshToken, FIREBASE_API_KEY);
            }
            catch (e) {
                if ((0, index_1.isUserNotFoundError)(e)) {
                    return null;
                }
                throw e;
            }
        }
        const { refreshToken } = await (0, index_1.customTokenToIdAndRefreshTokens)(customToken, FIREBASE_API_KEY);
        await deleteUser(userId);
        expect(await customGetToken()).toEqual(null);
    });
});
//# sourceMappingURL=verify-token.integration.test.js.map