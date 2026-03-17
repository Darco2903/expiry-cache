import type { Time } from "@darco2903/secondthought";
import { ExpiryCacheAsyncInterface, ExpiryCacheUnsafeBase } from "./base/index.js";
import type { RefreshFunctionUnsafeAsync } from "./types/index.js";

export class ExpiryCacheAsync<T, U extends RefreshFunctionUnsafeAsync<T>>
    extends ExpiryCacheUnsafeBase<T, U>
    implements ExpiryCacheAsyncInterface<T, U>
{
    /** The promise of the current refresh operation, or null if no refresh is in progress. */
    protected _refreshCb: Promise<T> | null;

    /** Indicates whether the cache is currently being refreshed. */
    public get refreshing(): boolean {
        return this._refreshCb !== null;
    }

    /**
     * Creates an instance of ExpiryCacheAsync.
     */
    constructor(data: T, callback: U, expirationTime?: number | Time) {
        super(data, callback, expirationTime);
        this._refreshCb = null;
    }

    public async refresh(...args: Parameters<U>): Promise<T> {
        if (this.refreshing) {
            await this._refreshCb;
        } else {
            this._refreshCb = this.callback(...args);
            this.setData(await this._refreshCb);
            this._refreshCb = null;
        }
        return this.data;
    }

    public async getDataOrRefresh(...args: Parameters<U>): Promise<T> {
        if (this.isExpired) {
            await this.refresh(...args);
        }
        return this.data;
    }

    public async refreshExpiresAt(expiresAt: number | Time, ...args: Parameters<U>): Promise<T> {
        const expAt = this.argToMs(expiresAt);
        this.setDataExpiresAt(await this.callback(...args), expAt);
        return this.data;
    }

    public async refreshExpiresIn(expirationTime: number | Time, ...args: Parameters<U>): Promise<T> {
        const expTime = this.argToMs(expirationTime);
        this.setDataExpiresIn(await this.callback(...args), expTime);
        return this.data;
    }
}
