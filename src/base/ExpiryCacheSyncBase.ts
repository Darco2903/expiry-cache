import { ExpiryCacheBase } from "./ExpiryCacheBase.js";
import type { RefreshFunctionSync } from "../types/index.js";
import type { CacheEvents } from "../types/events.js";

export abstract class ExpiryCacheSyncBase<
    T,
    F extends RefreshFunctionSync<T, E>,
    M extends CacheEvents<T, E>,
    E = never,
> extends ExpiryCacheBase<T, F, M, E> {
    // No additional properties or methods needed for the sync base class.
}
