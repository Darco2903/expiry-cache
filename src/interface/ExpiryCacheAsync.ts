import type { ReturnTypeAsync } from "../types/ReturnType.js";
import type { RefreshFunctionAsync } from "../types/RefreshFunction.js";

export abstract class IExpiryCacheAsync<T, F extends RefreshFunctionAsync<T, E>, E = any> {
    public abstract refresh(...args: Parameters<F>): ReturnTypeAsync<T, E>;
    public abstract getDataOrRefresh(...args: Parameters<F>): ReturnTypeAsync<T, E>;
}
