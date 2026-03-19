import { describe, it, expect } from "vitest";
import { Millisecond } from "@darco2903/secondthought";
import { ExpiryCache, ReturnOptionsExpiresAt, ReturnOptionsExpiresIn } from "../../src/index.js";

describe("No ReturnOptions", () => {
    it("should create an instance with correct properties", () => {
        const cache = new ExpiryCache(100, () => 0, 100);
        expect(cache.expirationTime).toBe(100);
        expect(cache.expirationTimeAsTime).toStrictEqual(new Millisecond(100));

        const expiresAt = Millisecond.now().add(new Millisecond(100));
        cache.refresh();
        expect(cache.expirationTime).toBe(100);
        expect(cache.expirationTimeAsTime).toStrictEqual(new Millisecond(100));
        expect(cache.expiresAtAsTime.greaterThanOrEqual(expiresAt)).toBeTruthy();
        expect(cache.expiresAt).toBeGreaterThanOrEqual(expiresAt.time);
    });
});

describe("ReturnOptions", () => {
    it("should handle ReturnOptionsExpiresIn correctly", () => {
        const cache = new ExpiryCache(100, (expiresIn: number) => ReturnOptionsExpiresIn(0, expiresIn), 100);
        expect(cache.expirationTime).toBe(100);
        expect(cache.expirationTimeAsTime).toStrictEqual(new Millisecond(100));

        const expiresAt = Millisecond.now().add(new Millisecond(200));
        cache.refresh(200);
        expect(cache.expirationTime).toBe(200);
        expect(cache.expirationTimeAsTime).toStrictEqual(new Millisecond(200));
        expect(cache.expiresAtAsTime.greaterThanOrEqual(expiresAt)).toBeTruthy();
        expect(cache.expiresAt).toBeGreaterThanOrEqual(expiresAt.time);
    });

    it("should handle ReturnOptionsExpiresAt correctly", () => {
        const cache = new ExpiryCache(100, (expiresAt: number) => ReturnOptionsExpiresAt(0, expiresAt), 100);
        expect(cache.expirationTime).toBe(100);
        expect(cache.expirationTimeAsTime).toStrictEqual(new Millisecond(100));

        const expiresAt = Millisecond.now().add(new Millisecond(200));
        cache.refresh(expiresAt.time);
        expect(cache.expirationTime).toBe(100);
        expect(cache.expirationTimeAsTime).toStrictEqual(new Millisecond(100));
        expect(cache.expiresAt).toBe(expiresAt.time);
        expect(cache.expiresAtAsTime).toStrictEqual(expiresAt);
    });
});
