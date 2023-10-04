import { Cookie, SignCookieResult } from "./index";
export declare const get: (keys: string[]) => ({ signatureCookie, signedCookie, }: SignCookieResult) => Promise<Cookie | null>;
