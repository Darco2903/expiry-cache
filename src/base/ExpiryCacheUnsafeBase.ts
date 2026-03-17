import type { Time } from "@darco2903/secondthought";
import { ExpiryCacheBase } from "./ExpiryCacheBase.js";
import type { RefreshFunctionUnsafe, ReturnTypeUnsafe } from "../types/index.js";

export abstract class ExpiryCacheUnsafeBase<T, U extends RefreshFunctionUnsafe<T>> extends ExpiryCacheBase<T, U> {
    /**
     * Refreshes the cached data using the callback function.
     */
    public abstract refresh(...args: Parameters<U>): ReturnTypeUnsafe<T>;

    /**
     * Gets the cached data or refreshes it if the cache is expired.
     */
    public abstract getDataOrRefresh(...args: Parameters<U>): ReturnTypeUnsafe<T>;

    /**
     * Refreshes the cached data and sets a new expiration timestamp.
     */
    public abstract refreshExpiresAt(expiresAt: number | Time, ...args: Parameters<U>): ReturnTypeUnsafe<T>;

    /**
     * Refreshes the cached data and sets a new expiration time.
     */
    public abstract refreshExpiresIn(expirationTime: number | Time, ...args: Parameters<U>): ReturnTypeUnsafe<T>;
}
