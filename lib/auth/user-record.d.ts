export interface MultiFactorInfoResponse {
    mfaEnrollmentId: string;
    displayName?: string;
    phoneInfo?: string;
    enrolledAt?: string;
    [key: string]: any;
}
export interface ProviderUserInfoResponse {
    rawId: string;
    displayName?: string;
    email?: string;
    photoUrl?: string;
    phoneNumber?: string;
    providerId: string;
    federatedId?: string;
}
export interface GetAccountInfoUserResponse {
    localId: string;
    email?: string;
    emailVerified?: boolean;
    phoneNumber?: string;
    displayName?: string;
    photoUrl?: string;
    disabled?: boolean;
    passwordHash?: string;
    salt?: string;
    customAttributes?: string;
    validSince?: string;
    tenantId?: string;
    providerUserInfo?: ProviderUserInfoResponse[];
    mfaInfo?: MultiFactorInfoResponse[];
    createdAt?: string;
    lastLoginAt?: string;
    lastRefreshAt?: string;
    [key: string]: any;
}
export declare abstract class MultiFactorInfo {
    readonly uid: string;
    readonly displayName?: string;
    readonly factorId: string;
    readonly enrollmentTime?: string;
    static initMultiFactorInfo(response: MultiFactorInfoResponse): MultiFactorInfo | null;
    constructor(response: MultiFactorInfoResponse);
    toJSON(): object;
    protected abstract getFactorId(response: MultiFactorInfoResponse): string | null;
    private initFromServerResponse;
}
export declare class PhoneMultiFactorInfo extends MultiFactorInfo {
    readonly phoneNumber: string;
    constructor(response: MultiFactorInfoResponse);
    toJSON(): object;
    protected getFactorId(response: MultiFactorInfoResponse): string | null;
}
export declare class MultiFactorSettings {
    enrolledFactors: MultiFactorInfo[];
    constructor(response: GetAccountInfoUserResponse);
    toJSON(): object;
}
export declare class UserMetadata {
    readonly creationTime: string;
    readonly lastSignInTime: string;
    readonly lastRefreshTime?: string | null;
    constructor(response: GetAccountInfoUserResponse);
    toJSON(): object;
}
export declare class UserInfo {
    readonly uid: string;
    readonly displayName: string;
    readonly email: string;
    readonly photoURL: string;
    readonly providerId: string;
    readonly phoneNumber: string;
    constructor(response: ProviderUserInfoResponse);
    toJSON(): object;
}
export declare class UserRecord {
    readonly uid: string;
    readonly email?: string;
    readonly emailVerified: boolean;
    readonly displayName?: string;
    readonly photoURL?: string;
    readonly phoneNumber?: string;
    readonly disabled: boolean;
    readonly metadata: UserMetadata;
    readonly providerData: UserInfo[];
    readonly passwordHash?: string;
    readonly passwordSalt?: string;
    readonly customClaims?: {
        [key: string]: any;
    };
    readonly tenantId?: string | null;
    readonly tokensValidAfterTime?: string;
    readonly multiFactor?: MultiFactorSettings;
    constructor(response: GetAccountInfoUserResponse);
    toJSON(): object;
}
