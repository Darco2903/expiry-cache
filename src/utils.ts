import { type Time, Millisecond } from "@darco2903/secondthought";
import { ReturnOptionsBase, type ReturnOptions } from "./ReturnOptions.js";

/**
 * Converts a number or Time object to milliseconds.
 */
export function argToMs(arg: number | Time): Millisecond {
    return typeof arg === "number" ? new Millisecond(arg) : arg.toMillisecond();
}

/**
 * Maps the return value of the refresh function to the actual data type. If the result is an instance of ReturnOptions, it extracts the data from it. Otherwise, it returns the result directly.
 */
export function mapRefreshReturn<T>(result: T | ReturnOptions<T>): T {
    if (result instanceof ReturnOptionsBase) {
        return result.data;
    }
    return result;
}
