import { Time } from "@darco2903/secondthought";
import { ExpiryCacheBase } from "./ExpiryCacheBase.js";
import type { RefreshFunctionSafe, ReturnTypeSafe } from "../types/index.js";

export abstract class ExpiryCacheSafeBase<T, U extends RefreshFunctionSafe<T, V>, V> extends ExpiryCacheBase<T, U, V> {
    /**
     * Refreshes the cached data using the callback function and updates the cache if the result is Ok.
     */
    public abstract refresh(...args: Parameters<U>): ReturnTypeSafe<T, V>;

    /**
     * Gets the cached data or refreshes it if the cache is expired.
     */
    public abstract getDataOrRefresh(...args: Parameters<U>): ReturnTypeSafe<T, V>;

    /**
     * Refreshes the cached data and sets a new expiration timestamp if the result is Ok.
     */
    public abstract refreshExpiresAt(expiresAt: number | Time, ...args: Parameters<U>): ReturnTypeSafe<T, V>;

    /**
     * Refreshes the cached data and sets a new expiration time if the result is Ok.
     */
    public abstract refreshExpiresIn(expirationTime: number | Time, ...args: Parameters<U>): ReturnTypeSafe<T, V>;
}
