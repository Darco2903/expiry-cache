import { describe, it, expect, vi } from "vitest";
import { ExpiryCacheNullable } from "../../src/ExpiryCacheNullable";

describe("ExpiryCacheNullable", () => {
    it("constructor sets expired when data is null", () => {
        const cache = new ExpiryCacheNullable<number, () => number>(null, () => 1, 1000);
        expect(cache.hasData).toBe(false);
        expect(cache.isExpired).toBe(true);
        expect(cache.getData()).toBeNull();
    });

    it("constructor sets never-expire when expirationTime is 0", () => {
        const cache = new ExpiryCacheNullable<number, () => number>(1, () => 2, 0);
        expect(cache.doesExpire).toBe(false);
        expect(cache.timeToLive).toBeNull();
        expect(cache.getData()).toBe(1);
    });

    it("timeToLive clamps and reports remaining time", async () => {
        const cache = new ExpiryCacheNullable<number, () => number>(1, () => 2, 200);
        const ttl1 = cache.timeToLive;
        expect(typeof ttl1).toBe("number");
        expect(ttl1).toBeGreaterThanOrEqual(0);

        // expire it
        cache.expire();
        expect(cache.timeToLive).toBe(0);
    });

    it("invalidate clears data and marks expired", () => {
        const cache = new ExpiryCacheNullable(42, () => 1, 1000);
        expect(cache.hasData).toBe(true);
        cache.invalidate();
        expect(cache.hasData).toBe(false);
        expect(cache.isExpired).toBe(true);
    });

    it("neverExpire keeps data and TTL is null", () => {
        const cache = new ExpiryCacheNullable(7, () => 1, 1000);
        cache.neverExpire();
        expect(cache.doesExpire).toBe(false);
        expect(cache.timeToLive).toBeNull();
        expect(cache.getData()).toBe(7);
    });

    it("refresh updates data and expiration", async () => {
        const cb = vi.fn(async () => {
            return 99;
        });
        const cache = new ExpiryCacheNullable<number, typeof cb>(null, cb, 50);
        await cache.refresh();
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cache.getData()).toBe(99);
        expect(cache.timeToLive).toBeGreaterThan(0);
    });

    it("getDataOrRefresh triggers refresh when expired", async () => {
        const cb = vi.fn(async () => 123);
        const cache = new ExpiryCacheNullable<number, typeof cb>(null, cb, 50);
        const v = await cache.getDataOrRefresh();
        expect(v).toBe(123);
        expect(cache.getData()).toBe(123);
    });

    it("concurrent refresh calls use single-flight", async () => {
        let calls = 0;
        const cb = vi.fn(async () => {
            calls++;
            // small delay
            await new Promise((r) => setTimeout(r, 20));
            return 555;
        });

        const cache = new ExpiryCacheNullable<number, typeof cb>(null, cb, 100);

        // start multiple concurrent refreshes
        const p1 = cache.getDataOrRefresh();
        const p2 = cache.getDataOrRefresh();
        const p3 = cache.getDataOrRefresh();

        const results = await Promise.all([p1, p2, p3]);
        expect(results[0]).toBe(555);
        expect(results[1]).toBe(555);
        expect(results[2]).toBe(555);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(calls).toBe(1);
    });

    it("refresh preserves old data on error and propagates error", async () => {
        let called = 0;
        const goodCb = vi.fn(async () => {
            called++;
            return 10;
        });

        const throwingCb = vi.fn(async () => {
            throw new Error("fail");
        });

        const cache = new ExpiryCacheNullable<number, typeof goodCb>(null, goodCb, 10);
        await cache.refresh();
        expect(cache.getData()).toBe(10);

        // replace callback with throwing one
        cache["callback"] = throwingCb;
        await expect(cache.refresh()).rejects.toThrow();
        // data should remain the previous value
        expect(cache.getData()).toBe(10);
    });

    it("refreshExpiresAt and refreshExpiresIn update expiration correctly", async () => {
        const cb = vi.fn(async () => 7);
        const cache = new ExpiryCacheNullable<number, typeof cb>(null, cb, 1000);

        const future = Date.now() + 5000;
        await cache.refreshExpiresAt(future);
        expect(cache.getData()).toBe(7);
        expect(cache.expiresAt).toBeGreaterThanOrEqual(future - 1);

        // refreshExpiresIn
        await cache.refreshExpiresIn(2000);
        expect(cache.getData()).toBe(7);
        expect(cache.timeToLive).toBeGreaterThan(0);
    });
});
