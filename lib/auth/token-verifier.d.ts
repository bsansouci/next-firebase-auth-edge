import { VerifyOptions } from "./jwt/verify";
export interface DecodedIdToken {
    aud: string;
    auth_time: number;
    email?: string;
    email_verified?: boolean;
    exp: number;
    firebase: {
        identities: {
            [key: string]: any;
        };
        sign_in_provider: string;
        sign_in_second_factor?: string;
        second_factor_identifier?: string;
        tenant?: string;
        [key: string]: any;
    };
    iat: number;
    iss: string;
    phone_number?: string;
    picture?: string;
    sub: string;
    uid: string;
    [key: string]: any;
}
export declare class FirebaseTokenVerifier {
    private issuer;
    private projectId;
    private readonly signatureVerifier;
    constructor(clientCertUrl: string, issuer: string, projectId: string);
    verifyJWT(jwtToken: string, options?: VerifyOptions): Promise<DecodedIdToken>;
    private decodeAndVerify;
    private verifyContent;
    private verifySignature;
    private mapJoseErrorToAuthError;
}
export declare function createIdTokenVerifier(projectId: string): FirebaseTokenVerifier;
