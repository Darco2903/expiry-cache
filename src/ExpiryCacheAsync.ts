import { type Time, Minute } from "@darco2903/secondthought";
import { ExpiryCacheBase } from "./ExpiryCacheBase.js";
import type { RefreshFunctionAsync } from "./types.js";

export class ExpiryCacheAsync<T, U extends RefreshFunctionAsync<T>> extends ExpiryCacheBase<T, U> {
    protected _refreshCb: Promise<T> | null;

    public get refreshing(): boolean {
        return this._refreshCb !== null;
    }

    /**
     * Creates an instance of ExpiryCache.
     * @param data  The initial data to be cached.
     * @param callback The function to refresh the cached data.
     * @param expirationTime The time in milliseconds after which the cache expires. Defaults to 60_000 (1 minute). If set to 0, the cache will never expire.
     */
    constructor(data: T, callback: U, expirationTime: number | Time = new Minute(1)) {
        super(data, callback, expirationTime);
        this._refreshCb = null;
    }

    /**
     * Refreshes the cached data using the callback function.
     */
    public async refresh(...args: Parameters<U>): Promise<void> {
        if (this.refreshing) {
            await this._refreshCb;
        } else {
            this._refreshCb = this.callback(...args);
            this.setData(await this._refreshCb);
            this._refreshCb = null;
        }
    }

    public async getDataOrRefresh(...args: Parameters<U>): Promise<T> {
        if (this.isExpired) {
            await this.refresh(...args);
        }
        return this.data;
    }

    /**
     * Refreshes the cached data and sets a new expiration timestamp.
     * @param expiresAt The new expiration timestamp in milliseconds.
     */
    public async refreshExpiresAt(expiresAt: number | Time, ...args: Parameters<U>): Promise<void> {
        const expAt = this.argToMs(expiresAt);
        this.setDataExpiresAt(await this.callback(...args), expAt);
    }

    /**
     * Refreshes the cached data and sets a new expiration time.
     * @param expirationTime The new expiration time in milliseconds.
     */
    public async refreshExpiresIn(expirationTime: number | Time, ...args: Parameters<U>): Promise<void> {
        const expTime = this.argToMs(expirationTime);
        this.setDataExpiresIn(await this.callback(...args), expTime);
    }
}
