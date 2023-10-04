export type Claims = {
    [key: string]: any;
};
export declare const STANDARD_CLAIMS: string[];
export declare const filterStandardClaims: (obj?: Claims) => Claims;
