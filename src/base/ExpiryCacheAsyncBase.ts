import { Time } from "@darco2903/secondthought";
import { ExpiryCacheBase } from "./ExpiryCacheBase.js";
import type { ReturnOptions } from "../ReturnOptions.js";
import type { RefreshFunctionAsync } from "../types/RefreshFunction.js";
import type { ReturnTypeAsync } from "../types/ReturnType.js";
import type { CacheEvents } from "../types/events.js";

export abstract class ExpiryCacheAsyncBase<
    T,
    F extends RefreshFunctionAsync<T, E>,
    V extends ReturnTypeAsync<T | ReturnOptions<T>, E>,
    M extends CacheEvents<T, E>,
    E = any,
> extends ExpiryCacheBase<T, F, M, E> {
    /** The promise of the current refresh operation, or null if no refresh is in progress. */
    protected _refreshCb: V | null;

    /** Indicates whether the cache is currently being refreshed. */
    public get refreshing(): boolean {
        return this._refreshCb !== null;
    }

    constructor(data: T, callback: F, expirationTime?: number | Time) {
        super(data, callback, expirationTime);
        this._refreshCb = null;
    }
}
