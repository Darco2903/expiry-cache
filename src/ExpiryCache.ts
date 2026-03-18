import { ExpiryCacheSyncBase } from "./base/index.js";
import type { RefreshFunctionUnsafeSync } from "./types/index.js";
import type { ExpiryCacheSyncInterface, ExpiryCacheUnsafeInterface } from "./interface/index.js";

export class ExpiryCache<T, F extends RefreshFunctionUnsafeSync<T>>
    extends ExpiryCacheSyncBase<T, F>
    implements ExpiryCacheSyncInterface<T, F>, ExpiryCacheUnsafeInterface<T, F>
{
    /**
     * Refreshes the cache by calling the refresh function with the provided arguments and updates the cache data. Returns the updated cache data.
     */
    public refresh(...args: Parameters<F>): T {
        this.setData(this.refreshFn(...args));
        this.emitter.emit("refreshed", this.data);
        return this.data;
    }

    /**
     * Returns the cached data if it is not expired. If the cache is expired, it refreshes the cache by calling the refresh function with the provided arguments and returns the updated cache data.
     */
    public getDataOrRefresh(...args: Parameters<F>): T {
        if (this.isExpired) {
            this.refresh(...args);
        }
        return this.data;
    }
}
