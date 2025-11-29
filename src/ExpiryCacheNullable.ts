import type { RefreshFunction } from "./types.js";

export class ExpiryCacheNullable<T, U extends RefreshFunction<T>> {
    protected data: T | null;
    public readonly expirationTime: number;
    protected callback: U;
    protected _refreshCb: Promise<T> | null;

    /** The expiration timestamp in milliseconds. 0 means never expires, -1 means already expired or no data. */
    protected _expiresAt: number;

    /**
     * Checks if there is cached data.
     */
    public get hasData(): boolean {
        return this.data !== null;
    }

    /**
     * Gets the expiration timestamp in milliseconds.
     */
    public get expiresAt(): number {
        return this._expiresAt;
    }

    public get refreshing(): boolean {
        return this._refreshCb !== null;
    }

    /**
     * Checks if the cache is set to expire.
     */
    public get doesExpire(): boolean {
        return this._expiresAt !== 0;
    }

    /**
     * Checks if the cache is expired.
     */
    public get isExpired(): boolean {
        return this.doesExpire && Date.now() >= this._expiresAt;
    }

    /**
     * Gets the time to live (TTL) in milliseconds.
     */
    public get timeToLive(): number | null {
        if (this.doesExpire) {
            return Math.max(0, this._expiresAt - Date.now());
        }
        return null;
    }

    /**
     * Creates an instance of ExpiryCache.
     * @param data  The initial data to be cached.
     * @param callback The function to refresh the cached data.
     * @param expirationTime The time in milliseconds after which the cache expires. Defaults to 60_000 (1 minute). If set to 0, the cache will never expire.
     */
    constructor(data: T | null, callback: U, expirationTime: number = 60_000) {
        this.data = data;
        this._expiresAt = expirationTime === 0 ? 0 : data === null ? -1 : Date.now() + expirationTime;
        this.expirationTime = expirationTime;
        this.callback = callback;
        this._refreshCb = null;
    }

    /**
     * Expires the cache immediately.
     */
    public expire(): void {
        this._expiresAt = -1;
    }

    /**
     * Invalidates the cached data and expires the cache.
     */
    public invalidate(): void {
        this.data = null;
        this.expire();
    }

    /**
     * Sets the cache to never expire.
     */
    public neverExpire(): void {
        this._expiresAt = 0;
    }

    protected expIn(ms: number): number {
        return ms === 0 ? 0 : Date.now() + ms;
    }

    /**
     * Sets the expiration timestamp based on the current time plus the given milliseconds.
     * @param ms The time in milliseconds after which the cache should expire. If set to 0, the cache will never expire.
     */
    public setExpiresIn(ms: number): void {
        this._expiresAt = this.expIn(ms);
    }

    /**
     * Sets the expiration timestamp to a specific time.
     * @param timestamp The expiration timestamp in milliseconds.
     */
    public setExpiresAt(timestamp: number): void {
        this._expiresAt = timestamp;
    }

    /**
     * Sets the cached data and resets the expiration timestamp based on the expiration time.
     */
    protected setData(data: T): void {
        this.setDataExpiresIn(data, this.expirationTime);
    }

    /**
     * Sets the cached data and sets a new expiration timestamp.
     * @param expiresAt The new expiration timestamp in milliseconds.
     */
    protected setDataExpiresAt(data: T, expiresAt: number): void {
        this.data = data;
        this._expiresAt = expiresAt;
    }

    /**
     * Sets the cached data and sets a new expiration time.
     * @param expirationTime The new expiration time in milliseconds.
     */
    protected setDataExpiresIn(data: T, expirationTime: number): void {
        this.setDataExpiresAt(data, this.expIn(expirationTime));
    }

    /**
     * Gets the raw cached data without checking expiration.
     */
    public getRawData(): T | null {
        return this.data;
    }

    /**
     * Gets the cached data if not expired, otherwise returns null.
     */
    public getData(): T | null {
        if (this.isExpired) {
            return null;
        }
        return this.data;
    }

    /**
     * Refreshes the cached data using the callback function.
     */
    public async refresh(...args: Parameters<U>): Promise<void> {
        if (this.refreshing) {
            await this._refreshCb;
        } else {
            this._refreshCb = Promise.resolve(this.callback(...args));
            try {
                this.setData(await this._refreshCb);
            } finally {
                this._refreshCb = null;
            }
        }
    }

    /**
     * Gets the cached data or refreshes it if expired.
     */
    public async getDataOrRefresh(...args: Parameters<U>): Promise<T | null> {
        if (this.isExpired) {
            await this.refresh(...args);
        }
        return this.data;
    }

    /**
     * Gets the cached data or refreshes it if expired, returning null on failure.
     */
    public async tryGetDataOrRefresh(...args: Parameters<U>): Promise<T | null> {
        return this.getDataOrRefresh(...args).catch(() => null);
    }

    /**
     * Refreshes the cached data and sets a new expiration timestamp.
     * @param expiresAt The new expiration timestamp in milliseconds.
     */
    public async refreshExpiresAt(expiresAt: number, ...args: Parameters<U>): Promise<void> {
        this.setDataExpiresAt(await this.callback(...args), expiresAt);
    }

    /**
     * Refreshes the cached data and sets a new expiration time.
     * @param expirationTime The new expiration time in milliseconds.
     */
    public async refreshExpiresIn(expirationTime: number, ...args: Parameters<U>): Promise<void> {
        this.setDataExpiresIn(await this.callback(...args), expirationTime);
    }
}
