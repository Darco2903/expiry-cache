import type { ReturnTypeUnsafe } from "../types/ReturnType.js";
import type { RefreshFunctionUnsafe } from "../types/RefreshFunction.js";

export abstract class IExpiryCacheUnsafe<T, F extends RefreshFunctionUnsafe<T>> {
    public abstract refresh(...args: Parameters<F>): ReturnTypeUnsafe<T>;
    public abstract getDataOrRefresh(...args: Parameters<F>): ReturnTypeUnsafe<T>;
}
