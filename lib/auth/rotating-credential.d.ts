export declare class RotatingCredential {
    private keys;
    constructor(keys: string[]);
    private signKey;
    sign(data: string): Promise<string>;
    verify(data: string, digest: string): Promise<boolean>;
    index(data: string, digest: string): Promise<number>;
}
