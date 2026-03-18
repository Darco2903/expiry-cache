import { ok, type Result } from "neverthrow";
import { ExpiryCacheSyncBase } from "./base/index.js";
import type { RefreshFunctionSafeSync } from "./types/index.js";
import type { ExpiryCacheSafeInterface, ExpiryCacheSyncInterface } from "./interface/index.js";
import type { CacheEventsSafe } from "./types/events.js";

export class ExpiryCacheSafe<T, F extends RefreshFunctionSafeSync<T, E>, E>
    extends ExpiryCacheSyncBase<T, F, CacheEventsSafe<T, E>, E>
    implements ExpiryCacheSyncInterface<T, F, E>, ExpiryCacheSafeInterface<T, F, E>
{
    /**
     * Refreshes the cache by calling the refresh function with the provided arguments and updates the cache data if the result is Ok, otherwise it does not update the cache data.
     * Returns the refresh function result.
     */
    public refresh(...args: Parameters<F>): Result<T, E> {
        return this.refreshFn(...args)
            .andTee((data) => this.setData(data))
            .map(ExpiryCacheSyncBase.mapRefreshReturn<T>)
            .andTee((data) => {
                this._emit("refreshed", data);
            })
            .orTee((err) => {
                this._emit("error", err);
            });
    }

    /**
     * Returns the cached data if it is not expired.
     * If the cache is expired, it refreshes the cache by calling the refresh function with the provided arguments and returns the refresh function result.
     * It behaves the same as the refresh method if the cache is expired, otherwise it returns the cached data wrapped in an Ok result.
     */
    public getDataOrRefresh(...args: Parameters<F>): Result<T, E> {
        if (this.isExpired) {
            return this.refresh(...args);
        }
        return ok(this.data);
    }
}
