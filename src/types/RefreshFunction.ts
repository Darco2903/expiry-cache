import type { ReturnTypeSafeAsync, ReturnTypeSafeSync, ReturnTypeUnsafeAsync, ReturnTypeUnsafeSync } from "./ReturnType.js";
import type { ReturnOptions } from "../ReturnOptions.js";

// General types for refresh functions
export type RefreshFunctionUnsafeSync<T> = (...args: any[]) => ReturnTypeUnsafeSync<T | ReturnOptions<T>>;
export type RefreshFunctionUnsafeAsync<T> = (...args: any[]) => ReturnTypeUnsafeAsync<T | ReturnOptions<T>>;
export type RefreshFunctionSafeSync<T, U> = (...args: any[]) => ReturnTypeSafeSync<T | ReturnOptions<T>, U>;
export type RefreshFunctionSafeAsync<T, U> = (...args: any[]) => ReturnTypeSafeAsync<T | ReturnOptions<T>, U>;

// Unsafe / Safe unions
export type RefreshFunctionUnsafe<T> = RefreshFunctionUnsafeSync<T> | RefreshFunctionUnsafeAsync<T>;
export type RefreshFunctionSafe<T, U> = RefreshFunctionSafeSync<T, U> | RefreshFunctionSafeAsync<T, U>;

// Sync / Async unions
export type RefreshFunctionSync<T, U> = RefreshFunctionUnsafeSync<T> | RefreshFunctionSafeSync<T, U>;
export type RefreshFunctionAsync<T, U> = RefreshFunctionUnsafeAsync<T> | RefreshFunctionSafeAsync<T, U>;

// All-in-one union
export type RefreshFunction<T, U> = RefreshFunctionUnsafe<T> | RefreshFunctionSafe<T, U>;
