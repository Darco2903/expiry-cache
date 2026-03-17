import type { Time } from "@darco2903/secondthought";
import { ok, type Result } from "neverthrow";
import { ExpiryCacheSafeBase } from "./base/index.js";
import type { RefreshFunctionSafeSync } from "./types/index.js";

export class ExpiryCacheSafe<T, U extends RefreshFunctionSafeSync<T, V>, V> extends ExpiryCacheSafeBase<T, U, V> {
    /**
     * Creates an instance of ExpiryCacheSafe.
     */
    constructor(data: T, callback: U, expirationTime?: number | Time) {
        super(data, callback, expirationTime);
    }

    public refresh(...args: Parameters<U>): Result<T, V> {
        return this.callback(...args).andTee(this.setData.bind(this));
    }

    public getDataOrRefresh(...args: Parameters<U>): Result<T, V> {
        if (this.isExpired) {
            return this.refresh(...args);
        }
        return ok(this.data);
    }

    public refreshExpiresAt(expiresAt: number | Time, ...args: Parameters<U>): Result<T, V> {
        const expAt = this.argToMs(expiresAt);
        return this.callback(...args).andTee((res) => {
            this.setDataExpiresAt(res, expAt);
        });
    }

    public refreshExpiresIn(expirationTime: number | Time, ...args: Parameters<U>): Result<T, V> {
        const expTime = this.argToMs(expirationTime);
        return this.callback(...args).andTee((res) => {
            this.setDataExpiresIn(res, expTime);
        });
    }
}
