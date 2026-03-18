import type { RefreshFunctionSync, ReturnTypeSync } from "../types/index.js";

export abstract class ExpiryCacheSyncInterface<T, F extends RefreshFunctionSync<T, E>, E = any> {
    public abstract refresh(...args: Parameters<F>): ReturnTypeSync<T, E>;
    public abstract getDataOrRefresh(...args: Parameters<F>): ReturnTypeSync<T, E>;
}
