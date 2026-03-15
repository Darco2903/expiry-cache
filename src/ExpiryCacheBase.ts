import { Time, Millisecond, Minute } from "@darco2903/secondthought";
import type { RefreshFunction, RefreshFunctionAsync } from "./types.js";

export abstract class ExpiryCacheBase<T, U extends RefreshFunction<T> | RefreshFunctionAsync<T>> {
    /** The cached data. */
    protected data: T;

    /** The function to refresh the cached data. */
    protected callback: U;

    /** The time in milliseconds after which the cache expires. 0 means never expires. */
    protected _expirationTime: Millisecond;

    /** The expiration timestamp in milliseconds. 0 means never expires, -1 means already expired or no data. */
    protected _expiresAt: Millisecond;

    /**
     * Gets the expiration time in milliseconds. This is the duration after which the cache expires, not the absolute expiration timestamp.
     */
    public get expirationTime(): number {
        return this._expirationTime.time;
    }

    /**
     * Gets the expiration time as a Millisecond object. This is the duration after which the cache expires, not the absolute expiration timestamp.
     */
    public get expirationTimeAsTime(): Millisecond {
        return this._expirationTime;
    }

    /**
     * Gets the expiration timestamp in milliseconds.
     */
    public get expiresAt(): number {
        return this._expiresAt.time;
    }

    /**
     * Gets the expiration timestamp as a Millisecond object.
     */
    public get expiresAtAsTime(): Millisecond {
        return this._expiresAt;
    }

    /**
     * Checks if the cache is set to expire.
     */
    public get doesExpire(): boolean {
        return this._expiresAt.time !== 0;
    }

    /**
     * Checks if the cache is expired.
     */
    public get isExpired(): boolean {
        return this.doesExpire && Millisecond.now().greaterThanOrEqual(this._expiresAt);
    }

    /**
     * Gets the time to live (TTL) in milliseconds. Returns null if the cache does not expire.
     */
    public get timeToLive(): number | null {
        if (this.doesExpire) {
            return Math.max(0, this._expiresAt.clone().sub(Millisecond.now()).time);
        }
        return null;
    }

    /**
     * Gets the time to live (TTL) as a Millisecond object. Returns null if the cache does not expire.
     */
    public get timeToLiveAsTime(): Millisecond | null {
        if (this.doesExpire) {
            return Time.max(new Millisecond(0), this._expiresAt.clone().sub(Millisecond.now()))!.toMillisecond();
        }
        return null;
    }

    /**
     * Converts a number or Time object to milliseconds.
     */
    protected argToMs(arg: number | Time): Millisecond {
        return typeof arg === "number" ? new Millisecond(arg) : arg.toMillisecond();
    }

    /**
     * Creates an instance of ExpiryCache.
     * @param data  The initial data to be cached.
     * @param callback The function to refresh the cached data.
     * @param expirationTime The time in milliseconds after which the cache expires. Defaults to 60_000 (1 minute). If set to 0, the cache will never expire.
     */
    constructor(data: T, callback: U, expirationTime: number | Time = new Minute(1)) {
        const expTime = this.argToMs(expirationTime);
        this.data = data;
        this._expiresAt = expTime.time === 0 ? expTime : Millisecond.now().add(expTime);
        this._expirationTime = expTime;
        this.callback = callback;
    }

    /**
     * Expires the cache immediately.
     */
    public expire(): void {
        this._expiresAt = new Millisecond(-1);
    }

    /**
     * Sets the cache to never expire.
     */
    public neverExpire(): void {
        this._expiresAt = new Millisecond(0);
    }

    protected expIn(ms: Millisecond): Millisecond {
        return ms.time === 0 ? ms : Millisecond.now().add(ms);
    }

    /**
     * Sets the expiration timestamp based on the current time plus the given milliseconds.
     * @param ms The time in milliseconds after which the cache should expire. If set to 0, the cache will never expire.
     */
    public setExpiresIn(ms: number | Time): void {
        const t = this.argToMs(ms);
        this._expiresAt = this.expIn(t);
    }

    /**
     * Sets the expiration timestamp to a specific time.
     * @param timestamp The expiration timestamp in milliseconds.
     */
    public setExpiresAt(timestamp: number | Time): void {
        this._expiresAt = this.argToMs(timestamp);
    }

    /**
     * Sets the cached data and resets the expiration timestamp based on the expiration time.
     */
    protected setData(data: T): void {
        this.setDataExpiresIn(data, this._expirationTime);
    }

    /**
     * Sets the cached data and sets a new expiration timestamp.
     * @param expiresAt The new expiration timestamp in milliseconds.
     */
    protected setDataExpiresAt(data: T, expiresAt: Millisecond): void {
        this.data = data;
        this._expiresAt = expiresAt;
    }

    /**
     * Sets the cached data and sets a new expiration time.
     * @param expirationTime The new expiration time in milliseconds.
     */
    protected setDataExpiresIn(data: T, expirationTime: Millisecond): void {
        this.setDataExpiresAt(data, this.expIn(expirationTime));
    }

    /**
     * Gets the raw cached data without checking expiration.
     */
    public getRawData(): T {
        return this.data;
    }

    /**
     * Gets the cached data if not expired, otherwise returns null.
     */
    public getData(): T | null {
        if (this.isExpired) {
            return null;
        }
        return this.data;
    }

    /**
     * Refreshes the cached data using the callback function.
     */
    public abstract refresh(...args: Parameters<U>): void | Promise<void>;

    /**
     * Gets the cached data or refreshes it if expired.
     */
    public abstract getDataOrRefresh(...args: Parameters<U>): T | Promise<T>;

    /**
     * Refreshes the cached data and sets a new expiration timestamp.
     * @param expiresAt The new expiration timestamp in milliseconds.
     */
    public abstract refreshExpiresAt(expiresAt: number | Time, ...args: Parameters<U>): void | Promise<void>;

    /**
     * Refreshes the cached data and sets a new expiration time.
     * @param expirationTime The new expiration time in milliseconds.
     */
    public abstract refreshExpiresIn(expirationTime: number | Time, ...args: Parameters<U>): void | Promise<void>;
}
