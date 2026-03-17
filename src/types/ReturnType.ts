import type { Result, ResultAsync } from "neverthrow";

// General types for return values
export type ReturnTypeUnsafeSync<T> = T;
export type ReturnTypeUnsafeAsync<T> = Promise<T>;
export type ReturnTypeSafeSync<T, U> = Result<T, U>;
export type ReturnTypeSafeAsync<T, U> = ResultAsync<T, U>;

// Unsafe / Safe union
export type ReturnTypeUnsafe<T> = ReturnTypeUnsafeSync<T> | ReturnTypeUnsafeAsync<T>;
export type ReturnTypeSafe<T, U> = ReturnTypeSafeSync<T, U> | ReturnTypeSafeAsync<T, U>;

// Sync / Async unions
export type ReturnTypeSync<T, U> = ReturnTypeUnsafeSync<T> | ReturnTypeSafeSync<T, U>;
export type ReturnTypeAsync<T, U> = ReturnTypeUnsafeAsync<T> | ReturnTypeSafeAsync<T, U>;

// All-in-one union
export type ReturnType<T, U> = ReturnTypeUnsafe<T> | ReturnTypeSafe<T, U>;
