import type { ReturnTypeSafeAsync, ReturnTypeSafeSync, ReturnTypeUnsafeAsync, ReturnTypeUnsafeSync } from "./ReturnType.js";
import type { ReturnOptions } from "../ReturnOptions.js";

// General types for refresh functions
export type RefreshFunctionUnsafeSync<T> = (...args: any[]) => ReturnTypeUnsafeSync<T | ReturnOptions<T>>;
export type RefreshFunctionUnsafeAsync<T> = (...args: any[]) => ReturnTypeUnsafeAsync<T | ReturnOptions<T>>;
export type RefreshFunctionSafeSync<T, E> = (...args: any[]) => ReturnTypeSafeSync<T | ReturnOptions<T>, E>;
export type RefreshFunctionSafeAsync<T, E> = (...args: any[]) => ReturnTypeSafeAsync<T | ReturnOptions<T>, E>;

// Unsafe / Safe unions
export type RefreshFunctionUnsafe<T> = RefreshFunctionUnsafeSync<T> | RefreshFunctionUnsafeAsync<T>;
export type RefreshFunctionSafe<T, E> = RefreshFunctionSafeSync<T, E> | RefreshFunctionSafeAsync<T, E>;

// Sync / Async unions
export type RefreshFunctionSync<T, E = never> = RefreshFunctionUnsafeSync<T> | RefreshFunctionSafeSync<T, E>;
export type RefreshFunctionAsync<T, E = never> = RefreshFunctionUnsafeAsync<T> | RefreshFunctionSafeAsync<T, E>;

// All-in-one union
export type RefreshFunction<T, E = never> = RefreshFunctionUnsafe<T> | RefreshFunctionSafe<T, E>;
