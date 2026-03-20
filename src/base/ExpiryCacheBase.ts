import { TypedEmitterProtected } from "@darco2903/typed-emitter";
import { Time, Millisecond, Minute } from "@darco2903/secondthought";
import type { RefreshFunction } from "../types/RefreshFunction.js";
import type { CacheReturnType } from "../types/ReturnType.js";
import { ReturnOptions, ReturnOptionsExpiresAtClass, ReturnOptionsExpiresInClass } from "../ReturnOptions.js";
import type { CacheEvents } from "../types/events.js";
import { argToMs } from "../utils.js";

export abstract class ExpiryCacheBase<
    T,
    F extends RefreshFunction<T, E>,
    M extends CacheEvents<T, E>,
    E = never,
> extends TypedEmitterProtected<M> {
    /** The cached data. */
    protected data: T;

    /** The function to refresh the cached data. */
    protected refreshFn: F;

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
     * Creates an instance of ExpiryCache.
     * @param data  The initial data to be cached.
     * @param refreshFn The function to refresh the cached data.
     * @param expirationTime The time in milliseconds after which the cache expires. Defaults to 60_000 (1 minute). If set to 0, the cache will never expire.
     */
    constructor(data: T, refreshFn: F, expirationTime: number | Time = new Minute(1)) {
        super();
        const expTime = argToMs(expirationTime);
        this.data = data;
        this._expiresAt = expTime.time === 0 ? expTime : Millisecond.now().add(expTime);
        this._expirationTime = expTime;
        this.refreshFn = refreshFn;
        this._expirationTimeout = null;
        this.setExpirationTimeout();
    }

    /**
     * Expires the cache immediately.
     */
    public expire(): void {
        this._expiresAt = new Millisecond(-1);
        this._emit("expired");
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
                this._emit("expired");
            }, this.timeToLive);
            this._expirationTimeout.unref();
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
        const t = argToMs(ms);
        this._expirationTime = t;
        this._setExpiresAt(this.expIn(t));
    }

    /**
     * Sets the expiration timestamp to a specific time.
     * @param expiresAt The expiration timestamp in milliseconds or as a Time object. If set to 0, the cache will never expire.
     */
    public setExpiresAt(expiresAt: number | Time): void {
        const t = argToMs(expiresAt);
        this._setExpiresAt(t);
    }

    protected _setExpiresAt(expiresAt: Millisecond): void {
        this._expiresAt = expiresAt;
        this.setExpirationTimeout();
    }

    /**
     * Sets the cached data and resets the expiration timestamp based on the expiration time.
     * @param data The new data to be cached.
     */
    protected setData(data: T | ReturnOptions<T>): void {
        if (data instanceof ReturnOptions) {
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
        this._setExpiresAt(expiresAt);
    }

    /**
     * Sets the cached data and sets a new expiration time.
     * @param expirationTime The new expiration time in milliseconds. If set to 0, the cache will never expire.
     */
    protected setDataExpiresIn(data: T, expirationTime: Millisecond): void {
        this.data = data;
        this.setExpiresIn(expirationTime);
    }

    /**
     * Gets the cached data without checking expiration.
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
