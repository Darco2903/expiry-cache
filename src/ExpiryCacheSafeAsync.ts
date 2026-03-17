import type { Time } from "@darco2903/secondthought";
import { okAsync, type ResultAsync } from "neverthrow";
import { ExpiryCacheAsyncBase } from "./base/ExpiryCacheAsyncBase.js";
import type { RefreshFunctionSafeAsync, ReturnTypeSafeAsync } from "./types/index.js";
import type { ExpiryCacheAsyncInterface, ExpiryCacheSafeInterface } from "./interface/index.js";

export class ExpiryCacheSafeAsync<T, U extends RefreshFunctionSafeAsync<T, V>, V>
    extends ExpiryCacheAsyncBase<T, U, ReturnTypeSafeAsync<T, V>, V>
    implements ExpiryCacheAsyncInterface<T, U, V>, ExpiryCacheSafeInterface<T, U, V>
{
    /**
     * Refreshes the cached data using the callback function and updates the cache if the result is Ok.
     * If a refresh is already in progress, it returns the existing refresh promise instead of calling the callback again.
     */
    public refresh(...args: Parameters<U>): ResultAsync<T, V> {
        if (this._refreshCb !== null) {
            return this._refreshCb;
        } else {
            this._refreshCb = this.callback(...args);
            return this._refreshCb
                .andTee((res) => this.setData(res))
                .andTee(() => {
                    this._refreshCb = null;
                })
                .orTee(() => {
                    this._refreshCb = null;
                });
        }
    }

    public getDataOrRefresh(...args: Parameters<U>): ResultAsync<T, V> {
        if (this.isExpired) {
            return this.refresh(...args);
        }
        return okAsync(this.data);
    }

    public refreshExpiresAt(expiresAt: number | Time, ...args: Parameters<U>): ResultAsync<T, V> {
        const expAt = this.argToMs(expiresAt);
        return this.callback(...args).andTee((res) => {
            this.setDataExpiresAt(res, expAt);
        });
    }

    public refreshExpiresIn(expirationTime: number | Time, ...args: Parameters<U>): ResultAsync<T, V> {
        const expTime = this.argToMs(expirationTime);
        return this.callback(...args).andTee((res) => {
            this.setDataExpiresIn(res, expTime);
        });
    }
}
