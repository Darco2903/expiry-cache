import { describe, it, expect, vi } from "vitest";
import { wait } from "@darco2903/web-common";
import { Millisecond } from "@darco2903/secondthought";
import { ExpiryCache, ReturnOptionsExpiresAt, ReturnOptionsExpiresIn } from "../../src/index.js";

describe("ExpiryCache", () => {
    it("should create an instance with correct properties", () => {
        const cache = new ExpiryCache(100, () => 0, 1000);
        expect(cache).toBeInstanceOf(ExpiryCache);
        expect(cache.getData()).toBe(100);
        expect(cache.expirationTime).toBe(1000);
        expect(cache.isExpired).toBeFalsy();
        expect(cache.doesExpire).toBeTruthy();
        expect(cache.timeToLive).toBeLessThanOrEqual(1000);
    });

    it("constructs with various types and respects initial state", async () => {
        const n = new ExpiryCache(10, () => 1, 1000);
        expect(n).toBeInstanceOf(ExpiryCache);
        expect(n.expirationTime).toBe(1000);
        expect(n.isExpired).toBe(false);
        expect(n.doesExpire).toBe(true);

        const str = new ExpiryCache("str", () => "x");
        expect(str.getData()).toBe("str");

        const obj = new ExpiryCache({ a: 1 }, () => ({ a: 2 }), 5000);
        expect(obj.getData()).toEqual({ a: 1 });

        const sumCache = new ExpiryCache(1, (a: number, b: number) => a + b, 0);
        expect(sumCache.doesExpire).toBe(false);
        expect(sumCache.timeToLive).toBeNull();
        expect(sumCache.getDataOrRefresh(2, 3)).toBe(1); // should return cached value without using args
        sumCache.expire();
        expect(sumCache.getDataOrRefresh(2, 3)).toBe(5); // should refresh and use args
    });

    it("constructor sets never-expire when expirationTime is 0", () => {
        const cache = new ExpiryCache(1, () => 2, 0);
        expect(cache.getData()).toBe(1);
        expect(cache.doesExpire).toBeFalsy();
        expect(cache.timeToLive).toBeNull();
    });

    it("timeToLive clamps and reports remaining time", () => {
        const cache = new ExpiryCache(1, () => 2, 200);
        const ttl1 = cache.timeToLive;
        expect(typeof ttl1).toBe("number");
        expect(ttl1).toBeGreaterThanOrEqual(0);
        expect(ttl1).toBeLessThanOrEqual(200);

        // expire it
        cache.expire();
        expect(cache.timeToLive).toBe(0);
    });

    it("should expire naturally after TTL and refresh resets expiration", async () => {
        const cache = new ExpiryCache(10, () => 1, 50);
        expect(cache.getData()).toBe(10);
        expect(cache.isExpired).toBeFalsy();

        await wait(100);

        expect(cache.isExpired).toBeTruthy();
        expect(cache.getData()).toBeNull();
        expect(cache.timeToLive).toBe(0);

        expect(cache.refresh()).toBe(1);
        expect(cache.isExpired).toBeFalsy();
        expect(cache.getData()).toBe(1);
    });

    it("refresh updates data and expiration", () => {
        const cb = vi.fn(() => 99);
        const cache = new ExpiryCache<number, typeof cb>(0, cb, 50);
        expect(cache.getData()).toBe(0);

        cache.expire();
        expect(cache.getData()).toBeNull();
        expect(cache.isExpired).toBeTruthy();

        cache.refresh();

        expect(cb).toHaveBeenCalledTimes(1);
        expect(cache.getData()).toBe(99);
        expect(cache.timeToLive).toBeGreaterThan(0);
    });

    it("getDataOrRefresh triggers refresh when expired", () => {
        const cb = vi.fn(() => 123);
        const cache = new ExpiryCache(0, cb, 50);
        expect(cache.getData()).toBe(0);

        cache.expire();

        expect(cache.getData()).toBeNull();
        expect(cache.isExpired).toBeTruthy();

        expect(cache.getDataOrRefresh()).toBe(123);
        expect(cache.getData()).toBe(123);
    });

    it("neverExpire behave correctly", () => {
        const cache = new ExpiryCache(10, () => 0, 1000);
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

describe("ExpiryCache Nullable", () => {
    it("supports nullable data and refresh functions", () => {
        const cb = vi.fn((res: number | null) => res);
        const cache = new ExpiryCache<number | null, typeof cb>(10, cb, 10_000);
        expect(cache.getData()).toBe(10);

        cache.expire();
        expect(cache.getData()).toBeNull();
        expect(cache.isExpired).toBeTruthy();

        cache.refresh(null);
        expect(cache.getData()).toBeNull();
        expect(cache.isExpired).toBeFalsy();

        cache.refresh(5);
        expect(cache.getData()).toBe(5);
        expect(cache.isExpired).toBeFalsy();
    });
});

describe("ExpiryCache with return options", () => {
    it("should handle expires in return options correctly", async () => {
        const cache = new ExpiryCache(10, () => ReturnOptionsExpiresIn(0, 100), 1000);
        expect(cache.getData()).toBe(10);
        expect(cache.isExpired).toBeFalsy();
        expect(cache.timeToLive).toBeLessThanOrEqual(1000);

        await wait(1000);
        expect(cache.isExpired).toBeTruthy();
        expect(cache.getData()).toBeNull();

        cache.refresh();
        expect(cache.getData()).toBe(0);
        expect(cache.isExpired).toBeFalsy();
        expect(cache.timeToLive).toBeLessThanOrEqual(100);
    });

    it("should handle expires at return options correctly", async () => {
        const cache = new ExpiryCache(
            10,
            () => {
                const expiresAt = Millisecond.now().add(new Millisecond(100));
                return ReturnOptionsExpiresAt(0, expiresAt);
            },
            1000,
        );
        expect(cache.getData()).toBe(10);
        expect(cache.isExpired).toBeFalsy();
        expect(cache.timeToLive).toBeLessThanOrEqual(1000);

        await wait(1000);
        expect(cache.isExpired).toBeTruthy();
        expect(cache.getData()).toBeNull();

        cache.refresh();
        expect(cache.getData()).toBe(0);
        expect(cache.isExpired).toBeFalsy();
        expect(cache.timeToLive).toBeLessThanOrEqual(100);
    });
});
