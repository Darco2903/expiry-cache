import { Time, Millisecond, Minute } from "@darco2903/secondthought";
import { TypedEmitter } from "@darco2903/typed-emitter";
import type { RefreshFunction, CacheReturnType } from "../types/index.js";
import { type ReturnOptions, ReturnOptionsBase, ReturnOptionsExpiresAtClass, ReturnOptionsExpiresInClass } from "../ReturnOptions.js";
import type { CacheEvents } from "../types/events.js";

export abstract class ExpiryCacheBase<T, F extends RefreshFunction<T, E>, E = any> {
    /** The cached data. */
    protected data: T;

    /** The function to refresh the cached data. */
    protected refreshFn: F;

    /** The event emitter for cache events. */
    public readonly emitter: TypedEmitter<CacheEvents<T, E>>;

    private _expirationTimeout: ReturnType<typeof setTimeout> | null;

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
     * @param refreshFn The function to refresh the cached data.
     * @param expirationTime The time in milliseconds after which the cache expires. Defaults to 60_000 (1 minute). If set to 0, the cache will never expire.
     */
    constructor(data: T, refreshFn: F, expirationTime: number | Time = new Minute(1)) {
        const expTime = this.argToMs(expirationTime);
        this.data = data;
        this._expiresAt = expTime.time === 0 ? expTime : Millisecond.now().add(expTime);
        this._expirationTime = expTime;
        this.refreshFn = refreshFn;
        this.emitter = new TypedEmitter();
        this._expirationTimeout = null;
        this.setExpirationTimeout();
    }

    /**
     * Expires the cache immediately.
     */
    public expire(): void {
        this._expiresAt = new Millisecond(-1);
        this.emitter.emit("expired");
    }

    /**
     * Sets the cache to never expire.
     */
    public neverExpire(): void {
        this._expiresAt = new Millisecond(0);
    }

    private setExpirationTimeout(): void {
        if (this._expirationTimeout) {
            clearTimeout(this._expirationTimeout);
        }

        if (this.timeToLive !== null) {
            this._expirationTimeout = setTimeout(() => {
                this._expirationTimeout = null;
                this.emitter.emit("expired");
            }, this.timeToLive);
        }
    }

    /**
     * Calculates the expiration timestamp based on the current time plus the given milliseconds. If ms is 0, it returns 0 to indicate never expires.
     * @param ms The time in milliseconds after which the cache should expire. If set to 0, the cache will never expire.
     */
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
        this.setExpirationTimeout();
    }

    /**
     * Sets the expiration timestamp to a specific time.
     * @param timestamp The expiration timestamp in milliseconds or as a Time object. If set to 0, the cache will never expire.
     */
    public setExpiresAt(timestamp: number | Time): void {
        this._expiresAt = this.argToMs(timestamp);
        this.setExpirationTimeout();
    }

    /**
     * Maps the return value of the refresh function to the actual data type. If the result is an instance of ReturnOptions, it extracts the data from it. Otherwise, it returns the result directly.
     * @param result
     */
    protected static mapRefreshReturn<T>(result: T | ReturnOptions<T>): T {
        if (result instanceof ReturnOptionsBase) {
            return result.data;
        }
        return result;
    }

    /**
     * Sets the cached data and resets the expiration timestamp based on the expiration time.
     * @param data The new data to be cached.
     */
    protected setData(data: T | ReturnOptions<T>): void {
        if (data instanceof ReturnOptionsBase) {
            if (data instanceof ReturnOptionsExpiresInClass) {
                this.setDataExpiresIn(data.data, data.expiresIn);
            } else if (data instanceof ReturnOptionsExpiresAtClass) {
                this.setDataExpiresAt(data.data, data.expiresAt);
            }
        } else {
            this.setDataExpiresIn(data, this._expirationTime);
        }
    }

    /**
     * Sets the cached data and sets a new expiration timestamp.
     * @param expiresAt The new expiration timestamp in milliseconds. If set to 0, the cache will never expire.
     */
    protected setDataExpiresAt(data: T, expiresAt: Millisecond): void {
        this.data = data;
        this._expiresAt = expiresAt;
        this.setExpirationTimeout();
    }

    /**
     * Sets the cached data and sets a new expiration time.
     * @param expirationTime The new expiration time in milliseconds. If set to 0, the cache will never expire.
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
     * @param args The arguments to pass to the refresh function.
     */
    public abstract refresh(...args: Parameters<F>): CacheReturnType<T, E>;

    /**
     * @param args The arguments to pass to the refresh function in case the cache is expired.
     */
    public abstract getDataOrRefresh(...args: Parameters<F>): CacheReturnType<T, E>;
}
