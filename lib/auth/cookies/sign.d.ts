import { Cookie, SignCookieResult } from "./index";
export declare const sign: (keys: string[]) => (cookie: Cookie) => Promise<SignCookieResult>;
