import type { Time } from "@darco2903/secondthought";
import type { RefreshFunctionSafe, ReturnTypeSafe } from "../types/index.js";

export abstract class ExpiryCacheSafeInterface<T, U extends RefreshFunctionSafe<T, V>, V> {
    public abstract refresh(...args: Parameters<U>): ReturnTypeSafe<T, V>;
    public abstract getDataOrRefresh(...args: Parameters<U>): ReturnTypeSafe<T, V>;
    public abstract refreshExpiresAt(expiresAt: number | Time, ...args: Parameters<U>): ReturnTypeSafe<T, V>;
    public abstract refreshExpiresIn(expirationTime: number | Time, ...args: Parameters<U>): ReturnTypeSafe<T, V>;
}
