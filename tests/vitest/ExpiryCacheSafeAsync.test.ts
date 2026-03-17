import { describe, it, expect, vi } from "vitest";
import { errAsync, ok, okAsync } from "neverthrow";
import { wait } from "@darco2903/web-common";
import { Millisecond, Second } from "@darco2903/secondthought";
import { ExpiryCacheSafeAsync } from "../../src/ExpiryCacheSafeAsync";

describe("ExpiryCacheSafeAsync", () => {
    it("should create an instance with correct properties", () => {
        const cache = new ExpiryCacheSafeAsync(100, () => okAsync(0), 1000);
        expect(cache).toBeInstanceOf(ExpiryCacheSafeAsync);
        expect(cache.getData()).toBe(100);
        expect(cache.expirationTime).toBe(1000);
        expect(cache.expirationTimeAsTime.equals(new Millisecond(1000))).toBeTruthy();
        expect(cache.isExpired).toBeFalsy();
        expect(cache.doesExpire).toBeTruthy();
        expect(cache.timeToLive).toBeLessThanOrEqual(1000);
    });

    it("constructs with various types and respects initial state", async () => {
        const n = new ExpiryCacheSafeAsync(10, () => okAsync(1), 1000);
        expect(n).toBeInstanceOf(ExpiryCacheSafeAsync);
        expect(n.expirationTime).toBe(1000);
        expect(n.expirationTimeAsTime.equals(new Millisecond(1000))).toBeTruthy();
        expect(n.isExpired).toBe(false);
        expect(n.doesExpire).toBe(true);

        const str = new ExpiryCacheSafeAsync("str", () => okAsync("x"));
        expect(str.getData()).toBe("str");

        const obj = new ExpiryCacheSafeAsync({ a: 1 }, () => okAsync({ a: 2 }), 5000);
        expect(obj.getData()).toEqual({ a: 1 });

        const sumCache = new ExpiryCacheSafeAsync(1, (a: number, b: number) => okAsync(a + b), 0);
        expect(sumCache.doesExpire).toBe(false);
        expect(sumCache.timeToLive).toBeNull();
        expect(await sumCache.getDataOrRefresh(2, 3)).toStrictEqual(ok(1)); // should return cached value without using args
        sumCache.expire();
        expect(await sumCache.getDataOrRefresh(2, 3)).toStrictEqual(ok(5)); // should refresh and use args
    });

    it("constructor sets never-expire when expirationTime is 0", () => {
        const cache = new ExpiryCacheSafeAsync(1, () => okAsync(2), 0);
        expect(cache.getData()).toBe(1);
        expect(cache.doesExpire).toBeFalsy();
        expect(cache.timeToLive).toBeNull();
        expect(cache.timeToLiveAsTime).toBeNull();
    });

    it("timeToLive clamps and reports remaining time", () => {
        const cache = new ExpiryCacheSafeAsync(1, () => okAsync(2), 200);
        const ttl1 = cache.timeToLive;
        expect(typeof ttl1).toBe("number");
        expect(ttl1).toBeGreaterThanOrEqual(0);
        expect(ttl1).toBeLessThanOrEqual(200);

        // expire it
        cache.expire();
        expect(cache.timeToLive).toBe(0);
        expect(cache.timeToLiveAsTime!.equals(new Millisecond(0))).toBeTruthy();
    });

    it("should expire naturally after TTL and refresh resets expiration", async () => {
        const cache = new ExpiryCacheSafeAsync(10, () => okAsync(1), 50);
        expect(cache.getData()).toBe(10);
        expect(cache.isExpired).toBeFalsy();

        await wait(100);

        expect(cache.isExpired).toBeTruthy();
        expect(cache.getData()).toBeNull();
        expect(cache.timeToLive).toBe(0);
        expect(cache.timeToLiveAsTime!.equals(new Millisecond(0))).toBeTruthy();

        await cache.refresh();
        expect(cache.isExpired).toBeFalsy();
        expect(cache.getData()).toBe(1);
    });

    it("refresh updates data and expiration", async () => {
        const cb = vi.fn(() => okAsync(99));
        const cache = new ExpiryCacheSafeAsync(0, cb, 50);
        expect(cache.getData()).toBe(0);

        cache.expire();
        expect(cache.getData()).toBeNull();
        expect(cache.isExpired).toBeTruthy();

        await cache.refresh();

        expect(cb).toHaveBeenCalledTimes(1);
        expect(cache.getData()).toBe(99);
        expect(cache.timeToLive).toBeGreaterThan(0);
    });

    it("getDataOrRefresh triggers refresh when expired", async () => {
        const cb = vi.fn(() => okAsync(123));
        const cache = new ExpiryCacheSafeAsync(0, cb, 50);
        expect(cache.getData()).toBe(0);

        cache.expire();

        expect(cache.getData()).toBeNull();
        expect(cache.isExpired).toBeTruthy();

        expect(await cache.getDataOrRefresh()).toStrictEqual(ok(123));
        expect(cache.getData()).toBe(123);
    });

    it("refreshExpiresAt and refreshExpiresIn update expiration correctly", async () => {
        const cb = vi.fn(() => okAsync(7));
        const cache = new ExpiryCacheSafeAsync(0, cb, 1000);

        const future = Millisecond.now().add(new Second(5));
        await cache.refreshExpiresAt(future);
        expect(cache.getData()).toBe(7);
        expect(cache.expiresAt).toBe(future.time);
        expect(cache.expiresAtAsTime!.equals(future)).toBeTruthy();

        // refreshExpiresIn
        expect(await cache.refreshExpiresIn(2000)).toStrictEqual(ok(7));
        expect(cache.getData()).toBe(7);
        expect(cache.timeToLive).toBeGreaterThan(0);
        expect(cache.timeToLive).toBeLessThanOrEqual(2000);
    });

    it("neverExpire behave correctly", () => {
        const cb = vi.fn(() => okAsync(0));
        const cache = new ExpiryCacheSafeAsync(10, cb, 1000);
        expect(cache.isExpired).toBeFalsy();
        expect(cache.doesExpire).toBeTruthy();

        cache.expire();
        expect(cache.isExpired).toBeTruthy();
        expect(cache.doesExpire).toBeTruthy();

        cache.neverExpire();
        expect(cache.isExpired).toBeFalsy();
        expect(cache.doesExpire).toBeFalsy();
    });
});

describe("ExpiryCacheSafeAsync Nullable", () => {
    it("supports nullable data and refresh functions", async () => {
        const cb = vi.fn((res: number | null) => okAsync(res));
        const cache = new ExpiryCacheSafeAsync<number | null, typeof cb, never>(10, cb, 10_000);
        expect(cache.getData()).toBe(10);

        cache.expire();
        expect(cache.getData()).toBeNull();
        expect(cache.isExpired).toBeTruthy();

        await cache.refresh(null);
        expect(cache.getData()).toBeNull();
        expect(cache.isExpired).toBeFalsy();

        await cache.refresh(5);
        expect(cache.getData()).toBe(5);
        expect(cache.isExpired).toBeFalsy();
    });
});

describe("ExpiryCacheSafeAsync Result Err", () => {
    it("refresh error does not update data and expiration", async () => {
        const cache = new ExpiryCacheSafeAsync(10, () => errAsync(), 1000);
        expect(cache.getData()).toBe(10);

        cache.expire();
        expect(cache.getData()).toBeNull();
        expect(cache.isExpired).toBeTruthy();
        await cache.refresh();
        expect(cache.getData()).toBeNull();
        expect(cache.isExpired).toBeTruthy();
    });
});
