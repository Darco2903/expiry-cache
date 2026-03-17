import type { Time } from "@darco2903/secondthought";
import { ExpiryCacheAsyncBase } from "./base/ExpiryCacheAsyncBase.js";
import type { RefreshFunctionUnsafeAsync, ReturnTypeUnsafeAsync } from "./types/index.js";
import type { ExpiryCacheAsyncInterface, ExpiryCacheUnsafeInterface } from "./interface/index.js";

export class ExpiryCacheAsync<T, U extends RefreshFunctionUnsafeAsync<T>>
    extends ExpiryCacheAsyncBase<T, U, ReturnTypeUnsafeAsync<T>>
    implements ExpiryCacheAsyncInterface<T, U>, ExpiryCacheUnsafeInterface<T, U>
{
    public async refresh(...args: Parameters<U>): Promise<T> {
        if (this.refreshing) {
            await this._refreshCb;
        } else {
            this._refreshCb = this.callback(...args);
            this.setData(await this._refreshCb);
            this._refreshCb = null;
        }
        return this.data;
    }

    public async getDataOrRefresh(...args: Parameters<U>): Promise<T> {
        if (this.isExpired) {
            await this.refresh(...args);
        }
        return this.data;
    }

    public async refreshExpiresAt(expiresAt: number | Time, ...args: Parameters<U>): Promise<T> {
        const expAt = this.argToMs(expiresAt);
        this.setDataExpiresAt(await this.callback(...args), expAt);
        return this.data;
    }

    public async refreshExpiresIn(expirationTime: number | Time, ...args: Parameters<U>): Promise<T> {
        const expTime = this.argToMs(expirationTime);
        this.setDataExpiresIn(await this.callback(...args), expTime);
        return this.data;
    }
}
