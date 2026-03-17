import { Time } from "@darco2903/secondthought";
import { ExpiryCacheBase } from "./ExpiryCacheBase.js";
import type { RefreshFunctionAsync, ReturnTypeAsync } from "../types/index.js";

export abstract class ExpiryCacheAsyncBase<
    T,
    U extends RefreshFunctionAsync<T, W>,
    V extends ReturnTypeAsync<T, W>,
    W = any,
> extends ExpiryCacheBase<T, U, W> {
    /** The promise of the current refresh operation, or null if no refresh is in progress. */
    protected _refreshCb: V | null;

    /** Indicates whether the cache is currently being refreshed. */
    public get refreshing(): boolean {
        return this._refreshCb !== null;
    }

    constructor(data: T, callback: U, expirationTime?: number | Time) {
        super(data, callback, expirationTime);
        this._refreshCb = null;
    }
}
