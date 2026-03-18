import type { RefreshFunctionUnsafe, ReturnTypeUnsafe } from "../types/index.js";

export abstract class ExpiryCacheUnsafeInterface<T, F extends RefreshFunctionUnsafe<T>> {
    public abstract refresh(...args: Parameters<F>): ReturnTypeUnsafe<T>;
    public abstract getDataOrRefresh(...args: Parameters<F>): ReturnTypeUnsafe<T>;
}
