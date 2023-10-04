import { KeyLike } from "jose";
import { DecodedIdToken } from "../token-verifier";
export interface VerifyOptions {
    currentDate?: Date;
}
export declare function getPublicCryptoKey(publicKey: string): Promise<KeyLike>;
export declare function verify(jwtString: string, getPublicKey: () => Promise<string>, options?: VerifyOptions): Promise<DecodedIdToken>;
