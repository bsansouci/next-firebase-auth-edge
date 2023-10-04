import { DecodedIdToken } from "./token-verifier";
import { CreateRequest, UpdateRequest } from "./auth-request-handler";
import { ServiceAccount } from "./credential";
import { UserRecord } from "./user-record";
import { AuthError } from "./error";
import { VerifyOptions } from "./jwt/verify";
export declare function customTokenToIdAndRefreshTokens(customToken: string, firebaseApiKey: string): Promise<IdAndRefreshTokens>;
export declare function isUserNotFoundError(error: unknown): error is AuthError;
export declare function isInvalidCredentialError(error: unknown): error is AuthError;
export declare function handleExpiredToken<T>(verifyIdToken: () => Promise<T>, onExpired: (e: AuthError) => Promise<T>, onError: (e: unknown) => Promise<T>): Promise<T>;
export interface IdAndRefreshTokens {
    idToken: string;
    refreshToken: string;
}
export interface Tokens {
    decodedToken: DecodedIdToken;
    token: string;
}
export declare function getFirebaseAuth(serviceAccount: ServiceAccount, apiKey: string): {
    verifyAndRefreshExpiredIdToken: (token: string, refreshToken: string, options?: VerifyOptions) => Promise<Tokens | null>;
    verifyIdToken: (idToken: string, checkRevoked?: boolean, options?: VerifyOptions) => Promise<DecodedIdToken>;
    createCustomToken: (uid: string, developerClaims?: object) => Promise<string>;
    getCustomIdAndRefreshTokens: (idToken: string, firebaseApiKey: string) => Promise<IdAndRefreshTokens>;
    handleTokenRefresh: (refreshToken: string, firebaseApiKey: string) => Promise<Tokens>;
    deleteUser: (uid: string) => Promise<void>;
    setCustomUserClaims: (uid: string, customUserClaims: object | null) => Promise<void>;
    getUser: (uid: string) => Promise<UserRecord>;
    updateUser: (uid: string, properties: UpdateRequest) => Promise<UserRecord>;
    createUser: (properties: CreateRequest) => Promise<UserRecord>;
};
