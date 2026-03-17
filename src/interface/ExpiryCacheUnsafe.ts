import type { Time } from "@darco2903/secondthought";
import type { RefreshFunctionUnsafe, ReturnTypeUnsafe } from "../types/index.js";

export abstract class ExpiryCacheUnsafeInterface<T, U extends RefreshFunctionUnsafe<T>> {
    public abstract refresh(...args: Parameters<U>): ReturnTypeUnsafe<T>;
    public abstract getDataOrRefresh(...args: Parameters<U>): ReturnTypeUnsafe<T>;
    public abstract refreshExpiresAt(expiresAt: number | Time, ...args: Parameters<U>): ReturnTypeUnsafe<T>;
    public abstract refreshExpiresIn(expirationTime: number | Time, ...args: Parameters<U>): ReturnTypeUnsafe<T>;
}
