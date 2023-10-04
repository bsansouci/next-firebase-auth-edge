import { VerifyOptions } from "./jwt/verify";
import { JWTPayload, ProtectedHeaderParameters } from "jose";
export declare const ALGORITHM_RS256: "RS256";
type PublicKeys = {
    [key: string]: string;
};
export type DecodedToken = {
    header: ProtectedHeaderParameters;
    payload: JWTPayload;
};
export interface SignatureVerifier {
    verify(token: string, options?: VerifyOptions): Promise<void>;
}
export interface KeyFetcher {
    fetchPublicKeys(): Promise<PublicKeys>;
}
export declare class UrlKeyFetcher implements KeyFetcher {
    private clientCertUrl;
    constructor(clientCertUrl: string);
    private fetchPublicKeysResponse;
    private fetchAndCachePublicKeys;
    fetchPublicKeys(): Promise<PublicKeys>;
}
export declare class PublicKeySignatureVerifier implements SignatureVerifier {
    private keyFetcher;
    constructor(keyFetcher: KeyFetcher);
    static withCertificateUrl(clientCertUrl: string): PublicKeySignatureVerifier;
    private getPublicKey;
    verify(token: string, options?: VerifyOptions): Promise<void>;
    private verifyWithoutKid;
    private verifyWithAllKeys;
}
export declare function fetchPublicKey(fetcher: KeyFetcher, header: ProtectedHeaderParameters): Promise<string>;
export {};
