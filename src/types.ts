export type RefreshFunction<T> = ((...args: any[]) => T) | ((...args: any[]) => Promise<T>);
