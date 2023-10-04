import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { CookieSerializeOptions } from "cookie";
import { ServiceAccount } from "../auth/credential";
import { SetAuthCookiesOptions } from "./cookies";
import { GetTokensOptions } from "./tokens";
import { IdAndRefreshTokens, Tokens } from "../auth";
export interface CreateAuthMiddlewareOptions {
    loginPath: string;
    logoutPath: string;
    cookieName: string;
    cookieSignatureKeys: string[];
    cookieSerializeOptions: CookieSerializeOptions;
    serviceAccount: ServiceAccount;
    apiKey: string;
}
export declare function createAuthMiddlewareResponse(request: NextRequest, options: CreateAuthMiddlewareOptions): Promise<NextResponse>;
export type HandleInvalidToken = () => Promise<NextResponse>;
export type HandleValidToken = (tokens: Tokens) => Promise<NextResponse>;
export type HandleError = (e: unknown) => Promise<NextResponse>;
export interface AuthenticationOptions extends CreateAuthMiddlewareOptions, GetTokensOptions {
    checkRevoked?: boolean;
    handleInvalidToken?: HandleInvalidToken;
    handleValidToken?: HandleValidToken;
    handleError?: HandleError;
}
export declare function refreshAuthCookies(idToken: string, response: NextResponse, options: SetAuthCookiesOptions): Promise<IdAndRefreshTokens>;
export declare function authentication(request: NextRequest, options: AuthenticationOptions): Promise<NextResponse>;
