export type RefreshFunction<T> = (...args: any[]) => T;
export type RefreshFunctionAsync<T> = (...args: any[]) => Promise<T>;
