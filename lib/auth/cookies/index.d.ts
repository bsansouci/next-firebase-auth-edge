export declare const getSignatureCookieName: (name: string) => string;
export interface Cookie {
    name: string;
    value: string;
}
export interface SignCookieResult {
    signedCookie: Cookie;
    signatureCookie: Cookie;
}
