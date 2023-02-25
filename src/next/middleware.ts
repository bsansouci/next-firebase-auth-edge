import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { CookieSerializeOptions } from "cookie";
import { ServiceAccount } from "../auth/credential";
import {
  appendAuthCookies,
  removeAuthCookies,
  setAuthCookies,
} from "./cookies";
import { getRequestCookiesTokens, GetTokensOptions } from "./tokens";
import { getFirebaseAuth, handleExpiredToken, Tokens } from "../auth";
import { DecodedIdToken } from "../auth/token-verifier";

export interface CreateAuthMiddlewareOptions {
  loginPath: string;
  logoutPath: string;
  cookieName: string;
  cookieSignatureKeys: string[];
  cookieSerializeOptions: CookieSerializeOptions;
  serviceAccount: ServiceAccount;
  apiKey: string;
}

export async function createAuthMiddlewareResponse(
  request: NextRequest,
  options: CreateAuthMiddlewareOptions
): Promise<NextResponse> {
  if (request.nextUrl.pathname === options.loginPath) {
    return setAuthCookies(request.headers, {
      cookieName: options.cookieName,
      cookieSerializeOptions: options.cookieSerializeOptions,
      cookieSignatureKeys: options.cookieSignatureKeys,
      serviceAccount: options.serviceAccount,
      apiKey: options.apiKey,
    });
  }

  if (request.nextUrl.pathname === options.logoutPath) {
    return removeAuthCookies(request.headers, {
      cookieName: options.cookieName,
      cookieSerializeOptions: options.cookieSerializeOptions,
    });
  }

  return NextResponse.next();
}

export type GetAuthenticatedResponse = (tokens: Tokens) => NextResponse;
export type GetErrorResponse = (e: unknown) => NextResponse;

export interface AuthenticateOptions
  extends CreateAuthMiddlewareOptions,
    GetTokensOptions {
  redirectOptions: RedirectToLoginOptions;
  checkRevoked?: boolean;
  isTokenValid?: (token: DecodedIdToken) => boolean;
  getAuthenticatedResponse?: GetAuthenticatedResponse;
  getErrorResponse?: (e: unknown) => NextResponse;
}

export interface RedirectToLoginOptions {
  paramName: string;
  path: string;
}

export function redirectToLogin(
  request: NextRequest,
  options: RedirectToLoginOptions
): NextResponse {
  const url = request.nextUrl.clone();
  const redirectUrl = url.pathname;
  url.pathname = options.path;
  url.search = `${options.paramName}=${redirectUrl}${url.search}`;
  return NextResponse.redirect(url);
}

function hasVerifiedEmail(token: DecodedIdToken) {
  return token.email_verified;
}

const getDefaultAuthenticatedResponse: GetAuthenticatedResponse = () =>
  NextResponse.next();
const getDefaultErrorResponse =
  (request: NextRequest, options: RedirectToLoginOptions): GetErrorResponse =>
  () =>
    redirectToLogin(request, options);

export async function authentication(
  request: NextRequest,
  options: AuthenticateOptions
): Promise<NextResponse> {
  const isTokenValid = options.isTokenValid ?? hasVerifiedEmail;
  const getAuthenticatedResponse =
    options.getAuthenticatedResponse ?? getDefaultAuthenticatedResponse;
  const getErrorResponse =
    options.getErrorResponse ??
    getDefaultErrorResponse(request, options.redirectOptions);

  if (
    [options.loginPath, options.logoutPath].includes(request.nextUrl.pathname)
  ) {
    return createAuthMiddlewareResponse(request, options);
  }

  if (request.nextUrl.pathname === options.redirectOptions.path) {
    return NextResponse.next();
  }

  const { verifyIdToken, handleTokenRefresh } = getFirebaseAuth(
    options.serviceAccount,
    options.apiKey
  );

  const idAndRefreshTokens = await getRequestCookiesTokens(
    request.cookies,
    options
  );

  if (!idAndRefreshTokens) {
    return redirectToLogin(request, options.redirectOptions);
  }

  return handleExpiredToken(
    async () => {
      const decodedToken = await verifyIdToken(
        idAndRefreshTokens.idToken,
        options.checkRevoked
      );

      if (!isTokenValid(decodedToken)) {
        return redirectToLogin(request, options.redirectOptions);
      }

      return getAuthenticatedResponse({
        token: idAndRefreshTokens.idToken,
        decodedToken,
      });
    },
    async () => {
      const { token, decodedToken } = await handleTokenRefresh(
        idAndRefreshTokens.refreshToken,
        options.apiKey
      );

      if (!isTokenValid(decodedToken)) {
        return redirectToLogin(request, options.redirectOptions);
      }

      return appendAuthCookies(
        getAuthenticatedResponse({ token, decodedToken }),
        {
          idToken: token,
          refreshToken: idAndRefreshTokens.refreshToken,
        },
        options
      );
    },
    async (e) => {
      return getErrorResponse(e);
    }
  );
}
