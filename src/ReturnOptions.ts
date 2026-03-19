import { Millisecond, type Time } from "@darco2903/secondthought";
import { argToMs } from "./utils.js";

export abstract class ReturnOptionsBase<T> {
    public readonly data: T;

    constructor(data: T) {
        this.data = data;
    }
}

export class ReturnOptionsExpiresInClass<T> extends ReturnOptionsBase<T> {
    public readonly expiresIn: Millisecond;

    constructor(data: T, expiresIn: number | Time) {
        super(data);
        this.expiresIn = argToMs(expiresIn);
    }
}

export class ReturnOptionsExpiresAtClass<T> extends ReturnOptionsBase<T> {
    public readonly expiresAt: Millisecond;

    constructor(data: T, expiresAt: number | Time) {
        super(data);
        this.expiresAt = argToMs(expiresAt);
    }
}

export type ReturnOptions<T> = ReturnOptionsExpiresInClass<T> | ReturnOptionsExpiresAtClass<T>;

export function ReturnOptionsExpiresIn<T>(data: T, expiresIn: number | Time) {
    return new ReturnOptionsExpiresInClass(data, expiresIn);
}

export function ReturnOptionsExpiresAt<T>(data: T, expiresAt: number | Time) {
    return new ReturnOptionsExpiresAtClass(data, expiresAt);
}
