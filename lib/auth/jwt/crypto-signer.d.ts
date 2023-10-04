import { ServiceAccountCredential } from "../credential";
import { JWTPayload } from "jose";
export interface CryptoSigner {
    sign(payload: JWTPayload): Promise<string>;
    getAccountId(): Promise<string>;
}
export declare class ServiceAccountSigner implements CryptoSigner {
    private readonly credential;
    constructor(credential: ServiceAccountCredential);
    sign(payload: JWTPayload): Promise<string>;
    getAccountId(): Promise<string>;
}
