import { ExpiryCacheBase } from "./ExpiryCacheBase.js";
import type { RefreshFunctionSync } from "../types/index.js";

export abstract class ExpiryCacheSyncBase<T, U extends RefreshFunctionSync<T, V>, V = any> extends ExpiryCacheBase<T, U, V> {
    // No additional properties or methods needed for the sync base class.
}
