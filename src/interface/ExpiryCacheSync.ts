import type { ReturnTypeSync } from "../types/ReturnType.js";
import type { RefreshFunctionSync } from "../types/RefreshFunction.js";

export abstract class IExpiryCacheSync<T, F extends RefreshFunctionSync<T, E>, E = any> {
    public abstract refresh(...args: Parameters<F>): ReturnTypeSync<T, E>;
    public abstract getDataOrRefresh(...args: Parameters<F>): ReturnTypeSync<T, E>;
}
