import type { ReturnTypeSafe } from "../types/ReturnType.js";
import type { RefreshFunctionSafe } from "../types/RefreshFunction.js";

export abstract class IExpiryCacheSafe<T, F extends RefreshFunctionSafe<T, E>, E> {
    public abstract refresh(...args: Parameters<F>): ReturnTypeSafe<T, E>;
    public abstract getDataOrRefresh(...args: Parameters<F>): ReturnTypeSafe<T, E>;
}
