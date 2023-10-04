import { JWTPayload } from "jose";
export type SignOptions = {
    readonly payload: JWTPayload;
    readonly privateKey: string;
    readonly keyId?: string;
};
export declare function sign({ payload, privateKey, keyId, }: SignOptions): Promise<string>;
