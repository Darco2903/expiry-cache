export type RefreshFunction<T> = ((...args: any[]) => T) | ((...args: any[]) => Promise<T>);
export type RefreshFunctionNullable<T> = RefreshFunction<T | null>;
