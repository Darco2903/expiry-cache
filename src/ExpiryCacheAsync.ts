import { ExpiryCacheAsyncBase } from "./base/index.js";
import type { RefreshFunctionUnsafeAsync, ReturnTypeUnsafeAsync } from "./types/index.js";
import type { ExpiryCacheAsyncInterface, ExpiryCacheUnsafeInterface } from "./interface/index.js";
import type { ReturnOptions } from "./ReturnOptions.js";

export class ExpiryCacheAsync<T, F extends RefreshFunctionUnsafeAsync<T>>
    extends ExpiryCacheAsyncBase<T, F, ReturnTypeUnsafeAsync<T | ReturnOptions<T>>>
    implements ExpiryCacheAsyncInterface<T, F>, ExpiryCacheUnsafeInterface<T, F>
{
    /**
     * Refreshes the cache by calling the refresh function with the provided arguments and updates the cache data. Returns the updated cache data.
     * If a refresh is already in progress, it returns the existing refresh promise instead of calling the callback again.
     */
    public async refresh(...args: Parameters<F>): Promise<T> {
        if (this.refreshing) {
            await this._refreshCb;
        } else {
            this._refreshCb = this.refreshFn(...args);
            this.setData(await this._refreshCb);
            this._refreshCb = null;
        }
        return this.data;
    }

    /**
     * Returns the cached data if it is not expired. If the cache is expired, it refreshes the cache by calling the refresh function with the provided arguments and returns the updated cache data.
     */
    public async getDataOrRefresh(...args: Parameters<F>): Promise<T> {
        if (this.isExpired) {
            await this.refresh(...args);
        }
        return this.data;
    }
}
