import { describe, it, expect } from "vitest";
import { ExpiryCache } from "../../src/ExpiryCache";

describe("ExpiryCache create", () => {
    it("should create a new ExpiryCache instance", () => {
        const cache = new ExpiryCache(10, () => 1, 999_999_999);
        expect(cache).toBeInstanceOf(ExpiryCache);
        expect(cache.expirationTime).toBe(999_999_999);
        expect(cache.isExpired).toBe(false);
        expect(cache.getData()).toBe(10);
    });

    it("should create a new ExpiryCache instance", () => {
        const cache = new ExpiryCache("str", () => "newStr");
        expect(cache).toBeInstanceOf(ExpiryCache);
        expect(cache.expirationTime).toBe(1000 * 60);
        expect(cache.isExpired).toBe(false);
        expect(cache.getData()).toBe("str");
    });

    it("should create a new ExpiryCache instance", () => {
        const cache = new ExpiryCache({ data: "str", num: 42 }, () => ({ data: "newStr", num: 43 }), 5000);
        expect(cache).toBeInstanceOf(ExpiryCache);
        expect(cache.expirationTime).toBe(5000);
        expect(cache.isExpired).toBe(false);
        expect(cache.getData()).toEqual({ data: "str", num: 42 });
    });
});

describe("ExpiryCache expiration", () => {
    it("should expire after the specified time", async () => {
        const cache = new ExpiryCache(10, () => 1, 200);
        expect(cache).toBeInstanceOf(ExpiryCache);
        expect(cache.expirationTime).toBe(200);
        expect(cache.isExpired).toBe(false);
        expect(cache.getData()).toBe(10);

        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(cache.isExpired).toBe(false);
        expect(cache.getData()).toBe(10);

        await new Promise((resolve) => setTimeout(resolve, 200));
        expect(cache.isExpired).toBe(true);
        expect(cache.getData()).toBe(null);

        const expireAt = Date.now() + cache.expirationTime;
        await cache.refresh();

        expect(cache.isExpired).toBe(false);
        expect(cache.expiresAt).toBeCloseTo(expireAt, -2);
        expect(cache.getData()).toBe(1);
    });

    it("should expire after the specified time", async () => {
        const cache = new ExpiryCache(10, () => 1);
        expect(cache).toBeInstanceOf(ExpiryCache);
        expect(cache.isExpired).toBe(false);
        expect(cache.getData()).toBe(10);

        const expireAt = Date.now() + 10;
        await cache.refreshExpiresAt(expireAt);

        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(cache.isExpired).toBe(true);
        expect(cache.expiresAt).toBe(expireAt);
        expect(cache.getData()).toBe(null);
    });

    it("should expire after the specified time", async () => {
        const cache = new ExpiryCache(10, () => 1);
        expect(cache).toBeInstanceOf(ExpiryCache);
        expect(cache.isExpired).toBe(false);
        expect(cache.getData()).toBe(10);

        const expireIn = 10;
        const expireAt = Date.now() + expireIn;
        await cache.refreshExpiresIn(expireIn);

        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(cache.isExpired).toBe(true);
        expect(cache.expiresAt).toBeCloseTo(expireAt, -2);
        expect(cache.getData()).toBe(null);
    });

    it("should expire after the specified time", async () => {
        const cache = new ExpiryCache(10, () => 1, 999_999_999);
        expect(cache).toBeInstanceOf(ExpiryCache);
        expect(cache.expirationTime).toBe(999_999_999);
        expect(cache.isExpired).toBe(false);
        expect(cache.getData()).toBe(10);

        cache.expired();
        expect(cache.isExpired).toBe(true);
        expect(cache.expiresAt).toBe(0);
        expect(cache.getData()).toBe(null);
    });
});

describe("ExpiryCache getDataOrRefresh", () => {
    it("should get data or refresh", async () => {
        let callCount = 0;
        const cache = new ExpiryCache(
            10,
            () => {
                callCount++;
                return callCount;
            },
            200
        );

        expect(cache).toBeInstanceOf(ExpiryCache);
        expect(cache.expirationTime).toBe(200);
        expect(cache.isExpired).toBe(false);
        expect(cache.getData()).toBe(10);
        expect(callCount).toBe(0);

        const data1 = await cache.getDataOrRefresh();
        expect(data1).toBe(10);
        expect(callCount).toBe(0);
        await new Promise((resolve) => setTimeout(resolve, 250));

        const data2 = await cache.getDataOrRefresh();
        expect(data2).toBe(1);
        expect(callCount).toBe(1);
    });
});
