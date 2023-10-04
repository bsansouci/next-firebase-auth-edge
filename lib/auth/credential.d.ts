export interface GoogleOAuthAccessToken {
    access_token: string;
    expires_in: number;
}
export interface Credential {
    getAccessToken(forceRefresh: boolean): Promise<FirebaseAccessToken>;
}
export interface ServiceAccount {
    projectId: string;
    privateKey: string;
    clientEmail: string;
}
export declare class ServiceAccountCredential implements Credential {
    readonly projectId: string;
    readonly privateKey: string;
    readonly clientEmail: string;
    constructor(serviceAccount: ServiceAccount);
    private fetchAccessToken;
    private fetchAndCacheAccessToken;
    getAccessToken(forceRefresh: boolean): Promise<FirebaseAccessToken>;
    private createJwt;
}
export interface FirebaseAccessToken {
    accessToken: string;
    expirationTime: number;
}
export declare const getFirebaseAdminTokenProvider: (account: ServiceAccount) => {
    getToken: (forceRefresh?: boolean) => Promise<FirebaseAccessToken>;
};
