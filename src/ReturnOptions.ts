import { Millisecond, type Time } from "@darco2903/secondthought";
import { argToMs } from "./utils.js";

export abstract class ReturnOptions<T> {
    public readonly data: T;

    constructor(data: T) {
        this.data = data;
    }

    public static ExpiresAt<T>(data: T, expiresAt: number | Time) {
        return new ReturnOptionsExpiresAtClass(data, expiresAt);
    }

    public static ExpiresIn<T>(data: T, expiresIn: number | Time) {
        return new ReturnOptionsExpiresInClass(data, expiresIn);
    }
}

export class ReturnOptionsExpiresInClass<T> extends ReturnOptions<T> {
    public readonly expiresIn: Millisecond;

    constructor(data: T, expiresIn: number | Time) {
        super(data);
        this.expiresIn = argToMs(expiresIn);
    }
}

export class ReturnOptionsExpiresAtClass<T> extends ReturnOptions<T> {
    public readonly expiresAt: Millisecond;

    constructor(data: T, expiresAt: number | Time) {
        super(data);
        this.expiresAt = argToMs(expiresAt);
    }
}
