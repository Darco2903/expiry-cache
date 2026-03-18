export interface CacheEventsUnsafe<T> {
    expired: [];
    refreshed: [T];
}

export interface CacheEventsSafe<T, E> extends CacheEventsUnsafe<T> {
    error: [E];
}

export type CacheEvents<T, E = never> = CacheEventsSafe<T, E> | CacheEventsUnsafe<T>;
