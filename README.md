# Expiry Cache

## Description

A simple in-memory cache with expiry functionality. It allows you to store data that automatically expires after a specified duration, with support for synchronous and asynchronous data fetching.

> Note: This package utilizes the [**@darco2903/secondthought**](https://www.npmjs.com/package/@darco2903/secondthought) package for time-related operations, providing enhanced capabilities for handling and manipulating time-related data. While its use is not mandatory, it is recommended for optimal safety and reliability when working with time values.

## Features

- **Type Safety**: Strongly typed cache entries and fetcher functions.
- **Automatic Expiry**: Cache entries automatically expire after a specified duration.
- **Manual Expiry**: Manually expire cache entries when needed.
- **Synchronous and Asynchronous Fetching**: Support for both synchronous and asynchronous data fetching.
- **Safe Fetching**: Safe cache fetching that returns a `Result` type, allowing for error handling without throwing exceptions.
- **Stale Data Access**: Option to access stale data even after it has expired.
- **Parameterized Fetching**: Support for fetcher functions that require parameters.
- **Return Options**: Allow to set expiry time when refreshing the cache. For exemple API tokens that return their expiry time.
- **Event Emission**: Emit events on cache refresh and expiry for better integration with other parts of your application.

## Installation

```bash
npm install @darco2903/expiry-cache
```

## Example Usage

### Basic Example

```ts
import { ExpiryCache } from "@darco2903/expiry-cache";

const cache = new ExpiryCache("initial", () => "refreshed", 1000); // ExpiryCache<string, () => string>
console.log(cache.getData()); // initial

await new Promise((resolve) => setTimeout(resolve, 1100)); // wait for cache to expire
console.log(cache.isExpired); // true
console.log(cache.getData()); // null
console.log(cache.getRawData()); // initial (returns the raw data even if expired)

cache.refresh();
console.log(cache.getData()); // refreshed

await new Promise((resolve) => setTimeout(resolve, 1100)); // wait for cache to expire
console.log(cache.isExpired); // true
console.log(cache.getDataOrRefresh()); // refreshed (refreshes the cache and returns the new value)

console.log(cache.expirationTime); // 1000
console.log(cache.expiresAt); // current timestamp + 1000 milliseconds
console.log(cache.timeToLive); // time remaining until expiration in milliseconds

cache.expire(); // Manually expire the cache
console.log(cache.isExpired); // true
```

### With Parameters

You can also use the cache with a fetcher function that requires parameters. In this case, the `refresh` method accepts the necessary parameters to fetch the new data.

```ts
import { ExpiryCache } from "@darco2903/expiry-cache";

const cache = new ExpiryCache(10, (a: number, b: number) => a + b, 200); // ExpiryCache<number, (a: number, b: number) => number>

cache.refresh(5, 7); // typed: refresh(a: number, b: number)
console.log(cache.getData()); // 12
```

### With Async Fetcher

Same as the ExpiryCache, but with an asynchronous fetcher function. The `refresh` method will return a promise that resolves when the cache has been updated.

```ts
import { ExpiryCacheAsync } from "@darco2903/expiry-cache";

async function getApiData(): Promise<string> {
    // Simulate an API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("fetched data from API");
        }, 500);
    });
}

const cache = new ExpiryCacheAsync("initial data", getApiData, 5000);

await cache.refresh();
console.log(cache.getData()); // fetched data from API
```

### With Result

Allows to handle errors without throwing exceptions, returning a `Result` type instead. The cache will be updated only if the result is `Ok`, otherwise nothing is changed and the cache is not refreshed when the result is `Err`.

In this example, we have a fetcher function that performs a division operation. If the divisor is zero, it returns an error instead of throwing an exception.

```ts
import { ExpiryCacheSafe } from "@darco2903/expiry-cache";
import { err, ok } from "neverthrow";

const cache = new ExpiryCacheSafe(1, (a: number, b: number) => (b === 0 ? err("Division by zero") : ok(a / b)), 100);
console.log(cache.getData()); // 1
console.log(cache.timeToLiveAsTime?.toStringWithUnit()); // ~100ms

await new Promise((resolve) => setTimeout(resolve, 200));
console.log(cache.isExpired); // true

cache.refresh(4, 2); // ok(2)
console.log(cache.getData()); // 2
console.log(cache.timeToLiveAsTime?.toStringWithUnit()); // ~100ms

await new Promise((resolve) => setTimeout(resolve, 200));
console.log(cache.isExpired); // true

cache.refresh(4, 0); // err("Division by zero")
console.log(cache.getData()); // null
console.log(cache.isExpired); // true
```

### Event Emission

```ts
import { ExpiryCache } from "@darco2903/expiry-cache";

const cache = new ExpiryCache(0, () => 10, 1000);
cache.on("expired", () => {
    console.log("Cache expired");
});

cache.on("refreshed", (value) => {
    console.log("Cache refreshed with value:", value);
});

cache.expire(); // trigger the expired event

cache.refresh(); // trigger the refreshed event
```

### Setting expiry time when refreshing

#### ExpiresIn

```ts
import { ExpiryCache, ReturnOptions } from "@darco2903/expiry-cache";

const cache = new ExpiryCache(0, () => ReturnOptions.ExpiresIn(0, 200), 1000);
console.log(cache.expirationTime); // 1000

cache.refresh();
console.log(cache.expirationTime); // 200
```

#### ExpiresAt

```ts
import { ExpiryCache, ReturnOptions } from "@darco2903/expiry-cache";

const cache = new ExpiryCache(0, () => ReturnOptions.ExpiresAt(0, Date.now() + 200), 1000);
console.log(cache.expiresAt - Date.now()); //  ~1000

cache.refresh();
console.log(cache.expiresAt - Date.now()); //  ~200
```

### SecondThought Integration

```ts
import { ExpiryCache } from "@darco2903/expiry-cache";
import { Millisecond, Second, Minute, Hour } from "@darco2903/secondthought";

const cache = new ExpiryCache("data", () => "data", new Minute(5)); // Cache expires in 5 minutes

cache.setExpiresIn(new Hour(1)); // Update the cache to expire in 1 hour
cache.setExpiresAt(Millisecond.now().add(new Second(2))); // Set the cache to expire in 2 seconds
```

### Full Example with Async Fetcher, Result and ReturnOptions

```ts
import { ExpiryCacheSafeAsync, ReturnOptions } from "@darco2903/expiry-cache";
import { Second } from "@darco2903/secondthought";
import { ResultAsync, okAsync } from "neverthrow";

type TokenData = {
    token: string;
    expiresIn: number;
};

function fetchApiToken(): ResultAsync<TokenData, string> {
    return ResultAsync.fromPromise(
        fetch("https://example.com/api/token").then((res) => res.json()),
        (err) => String(err),
    );
}

const cache = new ExpiryCacheSafeAsync("", () => {
    return fetchApiToken().andThen((res) => {
        return okAsync(ReturnOptions.ExpiresIn(res.token, new Second(res.expiresIn)));
    });
});
cache.expire(); // expire the cache immediately to force a refresh on the first call

await cache.refresh().match(
    (token) => {
        console.log("Fetched API token:", token);
    },
    (err) => {
        console.error("Error fetching API token:", err);
    },
);
```
