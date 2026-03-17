import type { Time } from "@darco2903/secondthought";
import { ExpiryCacheSyncBase } from "./base/index.js";
import type { RefreshFunctionUnsafeSync } from "./types/index.js";
import type { ExpiryCacheSyncInterface, ExpiryCacheUnsafeInterface } from "./interface/index.js";

export class ExpiryCache<T, U extends RefreshFunctionUnsafeSync<T>>
    extends ExpiryCacheSyncBase<T, U>
    implements ExpiryCacheSyncInterface<T, U>, ExpiryCacheUnsafeInterface<T, U>
{
    /**
     * Creates an instance of ExpiryCache.
     */
    constructor(data: T, callback: U, expirationTime?: number | Time) {
        super(data, callback, expirationTime);
    }

    public refresh(...args: Parameters<U>): T {
        this.setData(this.callback(...args));
        return this.data;
    }

    public getDataOrRefresh(...args: Parameters<U>): T {
        if (this.isExpired) {
            this.refresh(...args);
        }
        return this.data;
    }

    public refreshExpiresAt(expiresAt: number | Time, ...args: Parameters<U>): T {
        const expAt = this.argToMs(expiresAt);
        this.setDataExpiresAt(this.callback(...args), expAt);
        return this.data;
    }

    public refreshExpiresIn(expirationTime: number | Time, ...args: Parameters<U>): T {
        const expTime = this.argToMs(expirationTime);
        this.setDataExpiresIn(this.callback(...args), expTime);
        return this.data;
    }
}
