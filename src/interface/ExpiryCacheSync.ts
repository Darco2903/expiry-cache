import type { Time } from "@darco2903/secondthought";
import type { RefreshFunctionSync, ReturnTypeSync } from "../types/index.js";

export abstract class ExpiryCacheSyncInterface<T, U extends RefreshFunctionSync<T, V>, V = any> {
    public abstract refresh(...args: Parameters<U>): ReturnTypeSync<T, V>;
    public abstract getDataOrRefresh(...args: Parameters<U>): ReturnTypeSync<T, V>;
    public abstract refreshExpiresAt(expiresAt: number | Time, ...args: Parameters<U>): ReturnTypeSync<T, V>;
    public abstract refreshExpiresIn(expirationTime: number | Time, ...args: Parameters<U>): ReturnTypeSync<T, V>;
}
