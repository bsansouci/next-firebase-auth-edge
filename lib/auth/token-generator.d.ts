import { CryptoSigner } from "./jwt/crypto-signer";
import { ServiceAccountCredential } from "./credential";
export declare const BLACKLISTED_CLAIMS: string[];
export declare class FirebaseTokenGenerator {
    readonly tenantId?: string | undefined;
    private readonly signer;
    constructor(signer: CryptoSigner, tenantId?: string | undefined);
    createCustomToken(uid: string, developerClaims?: {
        [key: string]: any;
    }): Promise<string>;
    private static isDeveloperClaimsValid_;
}
export declare function createFirebaseTokenGenerator(credential: ServiceAccountCredential, tenantId?: string): FirebaseTokenGenerator;
