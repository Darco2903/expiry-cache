import { describe, it, expect, vi } from "vitest";
import { ExpiryCache } from "../../src/ExpiryCache";

function wait(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

describe("ExpiryCache", () => {
    it("constructs with various types and respects initial state", () => {
        const n = new ExpiryCache(10, () => 1, 1000);
        expect(n).toBeInstanceOf(ExpiryCache);
        expect(n.expirationTime).toBe(1000);
        expect(n.isExpired).toBe(false);
        expect(n.doesExpire).toBe(true);

        const s = new ExpiryCache("str", () => "x");
        expect(s.getData()).toBe("str");

        const o = new ExpiryCache({ a: 1 }, () => ({ a: 2 }), 5000);
        expect(o.getData()).toEqual({ a: 1 });

        const un = new ExpiryCache<number, () => number>(null, () => 10, 5000);
        expect(un.isExpired).toBe(true);
        expect(un.getData()).toBeNull();

        const never = new ExpiryCache(1, () => 2, 0);
        expect(never.doesExpire).toBe(false);
        expect(never.timeToLive).toBeNull();
    });

    it("expires after TTL and refresh resets expiration", async () => {
        const cache = new ExpiryCache(10, () => 1, 200);
        expect(cache.getData()).toBe(10);

        await wait(250);
        expect(cache.isExpired).toBe(true);
        expect(cache.getData()).toBeNull();

        const expireAt = Date.now() + cache.expirationTime;
        await cache.refresh();
        expect(cache.isExpired).toBe(false);
        expect(cache.expiresAt).toBeGreaterThanOrEqual(expireAt - 5);
        expect(cache.getData()).toBe(1);
    });

    it("setExpiresAt and setExpiresIn behave as absolute expirations", async () => {
        const cache = new ExpiryCache(1, () => 2, 1000);
        const ts = Date.now() + 3000;
        cache.setExpiresAt(ts);
        expect(cache.expiresAt).toBe(ts);

        cache.setExpiresIn(2000);
        expect(cache.timeToLive).toBeGreaterThan(0);
    });

    it("invalidate, expire and neverExpire behave correctly", () => {
        const cache = new ExpiryCache(42, () => 0, 1000);
        expect(cache.hasData).toBe(true);
        cache.invalidate();
        expect(cache.hasData).toBe(false);
        expect(cache.isExpired).toBe(true);

        cache.neverExpire();
        expect(cache.doesExpire).toBe(false);
    });

    it("refresh and getDataOrRefresh update value and preserve old data on error", async () => {
        const success = vi.fn(async () => 99);
        const cache = new ExpiryCache<number, typeof success>(null, success, 50);
        await cache.refresh();
        expect(success).toHaveBeenCalledOnce();
        expect(cache.getData()).toBe(99);

        const throwing = vi.fn(async () => {
            throw new Error("boom");
        });
        // swap callback for test
        (cache as any).callback = throwing;
        await expect(cache.refresh()).rejects.toThrow();
        // value should remain as previous successful value
        expect(cache.getData()).toBe(99);
    });

    it("getDataOrRefresh triggers refresh when expired and supports args", async () => {
        const cb = vi.fn(async (v: number) => v);
        const cache = new ExpiryCache<number, typeof cb>(null, cb, 5000);
        const v = await cache.getDataOrRefresh(123);
        expect(v).toBe(123);
        expect(cache.getData()).toBe(123);
    });

    it("single-flight: concurrent refresh calls share a single callback invocation", async () => {
        let calls = 0;
        const cb = vi.fn(async () => {
            calls++;
            await wait(20);
            return 7;
        });
        const cache = new ExpiryCache<number, typeof cb>(null, cb, 1000);

        const [a, b, c] = await Promise.all([cache.getDataOrRefresh(), cache.getDataOrRefresh(), cache.getDataOrRefresh()]);
        expect(calls).toBe(1);
        expect(a).toBe(7);
        expect(b).toBe(7);
        expect(c).toBe(7);
    });
});
