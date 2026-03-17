import type { Time } from "@darco2903/secondthought";
import type { RefreshFunctionAsync, ReturnTypeAsync } from "../types/index.js";

export abstract class ExpiryCacheAsyncInterface<T, U extends RefreshFunctionAsync<T, V>, V = any> {
    public abstract refresh(...args: Parameters<U>): ReturnTypeAsync<T, V>;
    public abstract getDataOrRefresh(...args: Parameters<U>): ReturnTypeAsync<T, V>;
    public abstract refreshExpiresAt(expiresAt: number | Time, ...args: Parameters<U>): ReturnTypeAsync<T, V>;
    public abstract refreshExpiresIn(expirationTime: number | Time, ...args: Parameters<U>): ReturnTypeAsync<T, V>;
}
