import { ExpiryCacheBase } from "./ExpiryCacheBase.js";
import type { RefreshFunctionSync } from "../types/index.js";

export abstract class ExpiryCacheSyncBase<T, F extends RefreshFunctionSync<T, E>, E = any> extends ExpiryCacheBase<T, F, E> {
    // No additional properties or methods needed for the sync base class.
}
