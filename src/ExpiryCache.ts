type RefreshFunction<T> = ((...args: any[]) => T) | ((...args: any[]) => Promise<T>);

export class ExpiryCache<T, U extends RefreshFunction<T>> {
    protected data: T;
    protected _expiresAt: number;
    public readonly expirationTime: number;
    protected callback: U;

    /**
     * Checks if the cache is expired.
     */
    public get isExpired(): boolean {
        return Date.now() >= this._expiresAt;
    }

    /**
     * Gets the expiration timestamp in milliseconds.
     */
    public get expiresAt(): number {
        return this._expiresAt;
    }

    /**
     * Creates an instance of ExpiryCache.
     * @param data  The initial data to be cached.
     * @param callback The function to refresh the cached data.
     * @param expirationTime The time in milliseconds after which the cache expires. Defaults to 60_000 (1 minute).
     */
    constructor(data: T, callback: U, expirationTime: number = 60_000) {
        this.data = data;
        this._expiresAt = Date.now() + expirationTime;
        this.expirationTime = expirationTime;
        this.callback = callback;
    }

    /**
     * Expires the cache immediately.
     */
    public expired(): void {
        this._expiresAt = 0;
    }

    /**
     * Sets the cached data and resets the expiration timestamp based on the expiration time.
     */
    protected setData(data: T): void {
        this.data = data;
        this._expiresAt = Date.now() + this.expirationTime;
    }

    /**
     * Sets the cached data and sets a new expiration timestamp.
     * @param expiresAt The new expiration timestamp in milliseconds.
     */
    protected setDataExpiresAt(data: T, expiresAt: number): void {
        this.data = data;
        this._expiresAt = expiresAt;
    }

    /**
     * Sets the cached data and sets a new expiration time.
     * @param expirationTime The new expiration time in milliseconds.
     */
    protected setDataExpiresIn(data: T, expirationTime: number): void {
        this.data = data;
        this._expiresAt = Date.now() + expirationTime;
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
     * Gets the cached data or refreshes it if expired.
     */
    public async getDataOrRefresh(...args: Parameters<U>): Promise<T> {
        if (this.isExpired) {
            await this.refresh(...args);
        }
        return this.data;
    }

    /**
     * Refreshes the cached data using the callback function.
     */
    public async refresh(...args: Parameters<U>): Promise<void> {
        this.setData(await this.callback(...args));
    }

    /**
     * Refreshes the cached data and sets a new expiration timestamp.
     * @param expiresAt The new expiration timestamp in milliseconds.
     */
    public async refreshExpiresAt(expiresAt: number, ...args: Parameters<U>): Promise<void> {
        this.setDataExpiresAt(await this.callback(...args), expiresAt);
    }

    /**
     * Refreshes the cached data and sets a new expiration time.
     * @param expirationTime The new expiration time in milliseconds.
     */
    public async refreshExpiresIn(expirationTime: number, ...args: Parameters<U>): Promise<void> {
        this.setDataExpiresIn(await this.callback(...args), expirationTime);
    }
}
