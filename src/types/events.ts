export interface CacheEvents<T, E> {
    expired: [void];
    refreshed: [T];
    error: [E];
}
