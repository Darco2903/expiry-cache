import type { Time } from "@darco2903/secondthought";
import type { RefreshFunctionAsync } from "../types/RefreshFunction.js";
import type { ExpiryCacheBase } from "./ExpiryCacheBase.js";
import type { ReturnTypeAsync } from "../types/ReturnType.js";

export interface ExpiryCacheAsyncInterface<T, U extends RefreshFunctionAsync<T, V>, V = any> extends ExpiryCacheBase<T, U, V> {
    /** Indicates whether the cache is currently being refreshed. */
    get refreshing(): boolean;

    refresh(...args: Parameters<U>): ReturnTypeAsync<T, V>;
    getDataOrRefresh(...args: Parameters<U>): ReturnTypeAsync<T, V>;
    refreshExpiresAt(expiresAt: number | Time, ...args: Parameters<U>): ReturnTypeAsync<T, V>;
    refreshExpiresIn(expirationTime: number | Time, ...args: Parameters<U>): ReturnTypeAsync<T, V>;
}
