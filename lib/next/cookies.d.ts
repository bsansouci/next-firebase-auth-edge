import { IdAndRefreshTokens } from "../auth";
import { ServiceAccount } from "../auth/credential";
import { CookieSerializeOptions } from "cookie";
import { NextResponse } from "next/server";
import { NextApiResponse } from "next";
export interface SetAuthCookiesOptions {
    cookieName: string;
    cookieSignatureKeys: string[];
    cookieSerializeOptions: CookieSerializeOptions;
    serviceAccount: ServiceAccount;
    apiKey: string;
}
export declare function appendAuthCookiesApi(response: NextApiResponse, tokens: IdAndRefreshTokens, options: SetAuthCookiesOptions): Promise<void>;
export declare function appendAuthCookies(response: NextResponse, tokens: IdAndRefreshTokens, options: SetAuthCookiesOptions): Promise<NextResponse<unknown>>;
export declare function refreshAuthCookies(idToken: string, response: NextApiResponse, options: SetAuthCookiesOptions): Promise<IdAndRefreshTokens>;
export declare function setAuthCookies(headers: Headers, options: SetAuthCookiesOptions): Promise<NextResponse>;
export interface RemoveAuthCookiesOptions {
    cookieName: string;
    cookieSerializeOptions: CookieSerializeOptions;
}
export declare function removeAuthCookies(headers: Headers, options: RemoveAuthCookiesOptions): NextResponse;
