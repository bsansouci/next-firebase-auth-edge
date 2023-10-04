import { ServiceAccount } from "./credential";
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD";
export declare class ApiSettings {
    private endpoint;
    private httpMethod;
    constructor(endpoint: string, httpMethod?: HttpMethod);
    getEndpoint(): string;
    getHttpMethod(): HttpMethod;
}
export declare function getSdkVersion(): string;
declare class AuthResourceUrlBuilder {
    protected version: string;
    private projectId;
    protected urlFormat: string;
    constructor(version: string, projectId: string);
    getUrl(api?: string, params?: object): Promise<string>;
}
export declare const FIREBASE_AUTH_GET_ACCOUNT_INFO: ApiSettings;
export declare const FIREBASE_AUTH_DELETE_ACCOUNT: ApiSettings;
export declare const FIREBASE_AUTH_SET_ACCOUNT_INFO: ApiSettings;
export declare const FIREBASE_AUTH_SIGN_UP_NEW_USER: ApiSettings;
export declare abstract class AbstractAuthRequestHandler {
    private authUrlBuilder;
    private getToken;
    private static getErrorCode;
    constructor(serviceAccount: ServiceAccount);
    getAccountInfoByUid(uid: string): Promise<object>;
    deleteAccount(uid: string): Promise<object>;
    createNewAccount(properties: CreateRequest): Promise<string>;
    updateExistingAccount(uid: string, properties: UpdateRequest): Promise<string>;
    setCustomUserClaims(uid: string, customUserClaims: object | null): Promise<string>;
    protected invokeRequestHandler(urlBuilder: AuthResourceUrlBuilder, apiSettings: ApiSettings, requestData: object | undefined, additionalResourceParams?: object): Promise<object>;
    protected abstract newAuthUrlBuilder(): AuthResourceUrlBuilder;
    private getAuthUrlBuilder;
}
export declare class AuthRequestHandler extends AbstractAuthRequestHandler {
    private serviceAccount;
    protected readonly authResourceUrlBuilder: AuthResourceUrlBuilder;
    constructor(serviceAccount: ServiceAccount);
    protected newAuthUrlBuilder(): AuthResourceUrlBuilder;
}
export declare function convertMultiFactorInfoToServerFormat(multiFactorInfo: UpdateMultiFactorInfoRequest): AuthFactorInfo;
export interface AuthFactorInfo {
    mfaEnrollmentId?: string;
    displayName?: string;
    phoneInfo?: string;
    enrolledAt?: string;
    [key: string]: any;
}
export interface BaseUpdateMultiFactorInfoRequest {
    uid?: string;
    displayName?: string;
    enrollmentTime?: string;
    factorId: string;
}
export interface UpdatePhoneMultiFactorInfoRequest extends BaseUpdateMultiFactorInfoRequest {
    phoneNumber: string;
}
export type UpdateMultiFactorInfoRequest = UpdatePhoneMultiFactorInfoRequest;
export interface MultiFactorUpdateSettings {
    enrolledFactors: UpdateMultiFactorInfoRequest[] | null;
}
export interface UpdateRequest {
    disabled?: boolean;
    displayName?: string | null;
    email?: string;
    emailVerified?: boolean;
    password?: string;
    phoneNumber?: string | null;
    photoURL?: string | null;
    multiFactor?: MultiFactorUpdateSettings;
    providerToLink?: UserProvider;
    providersToUnlink?: string[];
}
export interface UserProvider {
    uid?: string;
    displayName?: string;
    email?: string;
    phoneNumber?: string;
    photoURL?: string;
    providerId?: string;
}
export interface BaseCreateMultiFactorInfoRequest {
    displayName?: string;
    factorId: string;
}
export interface CreatePhoneMultiFactorInfoRequest extends BaseCreateMultiFactorInfoRequest {
    phoneNumber: string;
}
export type CreateMultiFactorInfoRequest = CreatePhoneMultiFactorInfoRequest;
export interface MultiFactorCreateSettings {
    enrolledFactors: CreateMultiFactorInfoRequest[];
}
export interface CreateRequest extends UpdateRequest {
    uid?: string;
    multiFactor?: MultiFactorCreateSettings;
}
export {};
