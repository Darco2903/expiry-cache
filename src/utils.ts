import { type Time, Millisecond } from "@darco2903/secondthought";

/**
 * Converts a number or Time object to milliseconds.
 */
export function argToMs(arg: number | Time): Millisecond {
    return typeof arg === "number" ? new Millisecond(arg) : arg.toMillisecond();
}
