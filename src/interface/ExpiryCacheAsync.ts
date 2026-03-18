import type { RefreshFunctionAsync, ReturnTypeAsync } from "../types/index.js";

export abstract class ExpiryCacheAsyncInterface<T, F extends RefreshFunctionAsync<T, E>, E = any> {
    public abstract refresh(...args: Parameters<F>): ReturnTypeAsync<T, E>;
    public abstract getDataOrRefresh(...args: Parameters<F>): ReturnTypeAsync<T, E>;
}
