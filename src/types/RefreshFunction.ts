import type { Result, ResultAsync } from "neverthrow";

// General types for refresh functions
export type RefreshFunctionUnsafeSync<T> = (...args: any[]) => T;
export type RefreshFunctionUnsafeAsync<T> = (...args: any[]) => Promise<T>;
export type RefreshFunctionSafeSync<T, U> = (...args: any[]) => Result<T, U>;
export type RefreshFunctionSafeAsync<T, U> = (...args: any[]) => ResultAsync<T, U>;

// Unsafe / Safe unions
export type RefreshFunctionUnsafe<T> = RefreshFunctionUnsafeSync<T> | RefreshFunctionUnsafeAsync<T>;
export type RefreshFunctionSafe<T, U> = RefreshFunctionSafeSync<T, U> | RefreshFunctionSafeAsync<T, U>;

// Sync / Async unions
export type RefreshFunctionSync<T, U> = RefreshFunctionUnsafeSync<T> | RefreshFunctionSafeSync<T, U>;
export type RefreshFunctionAsync<T, U> = RefreshFunctionUnsafeAsync<T> | RefreshFunctionSafeAsync<T, U>;

// All-in-one union
export type RefreshFunction<T, U> = RefreshFunctionUnsafe<T> | RefreshFunctionSafe<T, U>;
