import { describe, it, expect, vi } from "vitest";
import { err, ok } from "neverthrow";
import { wait } from "@darco2903/web-common";
import { Millisecond } from "@darco2903/secondthought";
import { ExpiryCacheSafe, ReturnOptionsExpiresAt, ReturnOptionsExpiresIn } from "../../src/index.js";

describe("ExpiryCacheSafe", () => {
    it("should create an instance with correct properties", () => {
        const cache = new ExpiryCacheSafe(100, () => ok(0), 1000);
        expect(cache).toBeInstanceOf(ExpiryCacheSafe);
        expect(cache.getData()).toBe(100);
        expect(cache.expirationTime).toBe(1000);
        expect(cache.isExpired).toBeFalsy();
        expect(cache.doesExpire).toBeTruthy();
        expect(cache.timeToLive).toBeLessThanOrEqual(1000);
    });

    it("constructs with various types and respects initial state", async () => {
        const n = new ExpiryCacheSafe(10, () => ok(1), 1000);
        expect(n).toBeInstanceOf(ExpiryCacheSafe);
        expect(n.expirationTime).toBe(1000);
        expect(n.isExpired).toBe(false);
        expect(n.doesExpire).toBe(true);

        const str = new ExpiryCacheSafe("str", () => ok("x"));
        expect(str.getData()).toBe("str");

        const obj = new ExpiryCacheSafe({ a: 1 }, () => ok({ a: 2 }), 5000);
        expect(obj.getData()).toEqual({ a: 1 });

        const sumCache = new ExpiryCacheSafe(1, (a: number, b: number) => ok(a + b), 0);
        expect(sumCache.doesExpire).toBe(false);
        expect(sumCache.timeToLive).toBeNull();
        expect(sumCache.getDataOrRefresh(2, 3)).toStrictEqual(ok(1)); // should return cached value without using args
        sumCache.expire();
        expect(sumCache.getDataOrRefresh(2, 3)).toStrictEqual(ok(5)); // should refresh and use args
    });

    it("constructor sets never-expire when expirationTime is 0", () => {
        const cache = new ExpiryCacheSafe(1, () => ok(2), 0);
        expect(cache.getData()).toBe(1);
        expect(cache.doesExpire).toBeFalsy();
        expect(cache.timeToLive).toBeNull();
    });

    it("timeToLive clamps and reports remaining time", () => {
        const cache = new ExpiryCacheSafe(1, () => ok(2), 200);
        const ttl1 = cache.timeToLive;
        expect(typeof ttl1).toBe("number");
        expect(ttl1).toBeGreaterThanOrEqual(0);
        expect(ttl1).toBeLessThanOrEqual(200);

        // expire it
        cache.expire();
        expect(cache.timeToLive).toBe(0);
    });

    it("should expire naturally after TTL and refresh resets expiration", async () => {
        const cache = new ExpiryCacheSafe(10, () => ok(1), 50);
        expect(cache.getData()).toBe(10);
        expect(cache.isExpired).toBeFalsy();

        await wait(100);

        expect(cache.isExpired).toBeTruthy();
        expect(cache.getData()).toBeNull();
        expect(cache.timeToLive).toBe(0);

        cache.refresh();
        expect(cache.isExpired).toBeFalsy();
        expect(cache.getData()).toBe(1);
    });

    it("refresh updates data and expiration", () => {
        const cb = vi.fn(() => ok(99));
        const cache = new ExpiryCacheSafe<number, typeof cb, never>(0, cb, 50);
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
        const cb = vi.fn(() => ok(123));
        const cache = new ExpiryCacheSafe(0, cb, 50);
        expect(cache.getData()).toBe(0);

        cache.expire();

        expect(cache.getData()).toBeNull();
        expect(cache.isExpired).toBeTruthy();

        expect(cache.getDataOrRefresh()).toStrictEqual(ok(123));
        expect(cache.getData()).toBe(123);
    });

    it("neverExpire behave correctly", () => {
        const cache = new ExpiryCacheSafe(10, () => ok(0), 1000);
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

describe("ExpiryCacheSafe update expiration time", () => {
    it("setExpiresIn updates expiration time correctly", () => {
        const cache = new ExpiryCacheSafe(10, () => ok(0), 100);
        expect(cache.timeToLive).toBeLessThanOrEqual(100);
        expect(cache.expirationTime).toBe(100);
        expect(cache.expirationTimeAsTime).toStrictEqual(new Millisecond(100));

        cache.setExpiresIn(200);
        expect(cache.timeToLive).toBeLessThanOrEqual(200);
        expect(cache.expirationTime).toBe(200);
        expect(cache.expirationTimeAsTime).toStrictEqual(new Millisecond(200));
    });

    it("setExpiresAt updates expiration time correctly", () => {
        const now = Millisecond.now().add(new Millisecond(100));
        const cache = new ExpiryCacheSafe(10, () => ok(0), 100);
        expect(cache.timeToLive).toBeLessThanOrEqual(100);
        expect(cache.expiresAt).toBeGreaterThanOrEqual(now.time);
        expect(cache.expiresAtAsTime.greaterThanOrEqual(now)).toBeTruthy();

        const newExpiresAt = Millisecond.now().add(new Millisecond(200));
        cache.setExpiresAt(newExpiresAt);
        expect(cache.timeToLive).toBeLessThanOrEqual(200);
        expect(cache.expiresAt).toBe(newExpiresAt.time);
        expect(cache.expiresAtAsTime.greaterThanOrEqual(newExpiresAt)).toBeTruthy();
    });
});

describe("ExpiryCacheSafe Nullable", () => {
    it("supports nullable data and refresh functions", () => {
        const cb = vi.fn((res: number | null) => ok(res));
        const cache = new ExpiryCacheSafe<number | null, typeof cb, never>(10, cb, 10_000);
        expect(cache.getData()).toBe(10);

        cache.expire();
        expect(cache.getData()).toBeNull();
        expect(cache.isExpired).toBeTruthy();

        expect(cache.refresh(null)).toStrictEqual(ok(null));
        expect(cache.getData()).toBeNull();
        expect(cache.isExpired).toBeFalsy();

        expect(cache.refresh(5)).toStrictEqual(ok(5));
        expect(cache.getData()).toBe(5);
        expect(cache.isExpired).toBeFalsy();
    });
});

describe("ExpiryCacheSafe Result Err", () => {
    it("refresh error does not update data and expiration", () => {
        const cache = new ExpiryCacheSafe(10, () => err(1), 50);
        expect(cache.getData()).toBe(10);

        cache.expire();
        expect(cache.getData()).toBeNull();
        expect(cache.isExpired).toBeTruthy();
        expect(cache.refresh()).toStrictEqual(err(1));
        expect(cache.getData()).toBeNull();
        expect(cache.isExpired).toBeTruthy();
    });
});

describe("ExpiryCacheSafe with return options", () => {
    it("should handle expires in return options correctly", async () => {
        const cache = new ExpiryCacheSafe(10, () => ok(ReturnOptionsExpiresIn(0, 100)), 1000);
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
        const cache = new ExpiryCacheSafe(
            10,
            () => {
                const expiresAt = Millisecond.now().add(new Millisecond(100));
                return ok(ReturnOptionsExpiresAt(0, expiresAt));
            },
            100,
        );
        expect(cache.getData()).toBe(10);
        expect(cache.isExpired).toBeFalsy();
        expect(cache.timeToLive).toBeLessThanOrEqual(100);

        await wait(200);
        expect(cache.isExpired).toBeTruthy();
        expect(cache.getData()).toBeNull();

        cache.refresh();
        expect(cache.getData()).toBe(0);
        expect(cache.isExpired).toBeFalsy();
        expect(cache.timeToLive).toBeLessThanOrEqual(100);
    });
});

describe("ExpiryCacheSafe expire event", () => {
    it("should emit expire event when cache expires", async () => {
        const cache = new ExpiryCacheSafe(10, () => ok(0), 50);
        const start = Millisecond.now();
        let elapsed = 0;
        const expiredCallback = vi.fn(() => {
            elapsed = Millisecond.now().sub(start).time;
        });
        cache.on("expired", expiredCallback);
        expect(expiredCallback).toHaveBeenCalledTimes(0);

        await wait(100);
        expect(expiredCallback).toHaveBeenCalledTimes(1);
        expect(elapsed).toBeGreaterThanOrEqual(50);
    });

    it("should emit expire event when cache expires after being refreshed", async () => {
        const cache = new ExpiryCacheSafe(10, () => ok(0), 50);

        cache.refresh();

        const start = Millisecond.now();
        let elapsed = 0;
        const expiredCallback = vi.fn(() => {
            elapsed = Millisecond.now().sub(start).time;
        });
        cache.on("expired", expiredCallback);
        expect(expiredCallback).toHaveBeenCalledTimes(0);

        await wait(100);

        expect(expiredCallback).toHaveBeenCalledTimes(1);
        expect(elapsed).toBeGreaterThanOrEqual(50);
    });
});

describe("ExpiryCacheSafe refreshed event", () => {
    it("should emit refreshed event when cache is refreshed", () => {
        const cache = new ExpiryCacheSafe(10, () => ok(0), 100);
        let refreshedData: number | null = null;
        const refreshedCallback = vi.fn((data) => {
            refreshedData = data;
        });
        cache.on("refreshed", refreshedCallback);
        expect(refreshedCallback).toHaveBeenCalledTimes(0);
        expect(refreshedData).toBeNull();

        cache.refresh();
        expect(refreshedCallback).toHaveBeenCalledTimes(1);
        expect(refreshedData).toBe(0);
    });
});

describe("ExpiryCacheSafe error event", () => {
    it("should emit error event when refresh fails", () => {
        const cache = new ExpiryCacheSafe(10, () => err(1), 100);
        let errorData: number | null = null;
        const errorCallback = vi.fn((error) => {
            errorData = error;
        });

        cache.on("error", errorCallback);
        expect(errorCallback).toHaveBeenCalledTimes(0);
        expect(errorData).toBeNull();

        cache.refresh();

        expect(errorCallback).toHaveBeenCalledTimes(1);
        expect(errorData).toBe(1);
    });
});
