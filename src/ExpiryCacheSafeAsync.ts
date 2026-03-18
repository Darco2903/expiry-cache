import { okAsync, type ResultAsync } from "neverthrow";
import { ExpiryCacheAsyncBase } from "./base/index.js";
import type { RefreshFunctionSafeAsync, ReturnTypeSafeAsync } from "./types/index.js";
import type { ExpiryCacheAsyncInterface, ExpiryCacheSafeInterface } from "./interface/index.js";
import type { ReturnOptions } from "./ReturnOptions.js";

export class ExpiryCacheSafeAsync<T, F extends RefreshFunctionSafeAsync<T, E>, E>
    extends ExpiryCacheAsyncBase<T, F, ReturnTypeSafeAsync<T | ReturnOptions<T>, E>, E>
    implements ExpiryCacheAsyncInterface<T, F, E>, ExpiryCacheSafeInterface<T, F, E>
{
    /**
     * Refreshes the cache by calling the refresh function with the provided arguments and updates the cache data if the result is Ok, otherwise it does not update the cache data.
     * Returns the refresh function result.
     * If a refresh is already in progress, it returns the existing refresh promise instead of calling the callback again.
     */
    public refresh(...args: Parameters<F>): ResultAsync<T, E> {
        if (this._refreshCb !== null) {
            return this._refreshCb.map(ExpiryCacheSafeAsync.mapRefreshReturn<T>);
        } else {
            this._refreshCb = this.refreshFn(...args);
            return this._refreshCb
                .andTee((res) => this.setData(res))
                .map(ExpiryCacheSafeAsync.mapRefreshReturn<T>)
                .andTee(() => {
                    this._refreshCb = null;
                })
                .orTee(() => {
                    this._refreshCb = null;
                });
        }
    }

    /**
     * Returns the cached data if it is not expired.
     * If the cache is expired, it refreshes the cache by calling the refresh function with the provided arguments and returns the refresh function result.
     * It behaves the same as the refresh method if the cache is expired, otherwise it returns the cached data wrapped in an Ok result.
     */
    public getDataOrRefresh(...args: Parameters<F>): ResultAsync<T, E> {
        if (this.isExpired) {
            return this.refresh(...args);
        }
        return okAsync(this.data);
    }
}
