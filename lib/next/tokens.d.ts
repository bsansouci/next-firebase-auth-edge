import type { RequestCookies } from "next/dist/server/web/spec-extension/cookies";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { ServiceAccount } from "../auth/credential";
import { IdAndRefreshTokens, Tokens } from "../auth";
export interface GetTokensOptions extends GetCookiesTokensOptions {
    serviceAccount: ServiceAccount;
    apiKey: string;
}
export declare function validateOptions(options: GetTokensOptions): void;
export interface GetCookiesTokensOptions {
    cookieName: string;
    cookieSignatureKeys: string[];
}
export declare function getRequestCookiesTokens(cookies: RequestCookies | ReadonlyRequestCookies, options: GetCookiesTokensOptions): Promise<IdAndRefreshTokens | null>;
export declare function getTokens(cookies: RequestCookies | ReadonlyRequestCookies, options: GetTokensOptions): Promise<Tokens | null>;
export declare function getTokensFromObject(cookies: Partial<{
    [K in string]: string;
}>, options: GetTokensOptions): Promise<Tokens | null>;
