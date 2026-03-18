import type { RefreshFunctionSafe, ReturnTypeSafe } from "../types/index.js";

export abstract class ExpiryCacheSafeInterface<T, F extends RefreshFunctionSafe<T, E>, E> {
    public abstract refresh(...args: Parameters<F>): ReturnTypeSafe<T, E>;
    public abstract getDataOrRefresh(...args: Parameters<F>): ReturnTypeSafe<T, E>;
}
