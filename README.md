# Expiry Cache

## Description

A simple in-memory cache with expiry functionality. It allows you to store data that automatically expires after a specified duration, with support for synchronous and asynchronous data fetching.

## Installation

You can found the package here: [**@darco2903/expiry-cache**](https://github.com/users/Darco2903/packages/npm/package/expiry-cache)

## Example Usage

### Basic Example

```ts
import { ExpiryCache } from "@darco2903/expiry-cache";

const cache = new ExpiryCache("initial", () => "string", 1000); // infering to ExpiryCache<string, () => string>
console.log(cache.getData()); // Outputs: initial

await new Promise((resolve) => setTimeout(resolve, 1100)); // wait for cache to expire
console.log(cache.isExpired); // Outputs: true
console.log(cache.getData()); // Outputs: null

cache.refresh();
console.log(cache.getData()); // Outputs: string
```

### With Async Fetcher

```ts
import { ExpiryCache } from "@darco2903/expiry-cache";

async function getApiData(): Promise<string> {
    // Simulating an API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("fetched data from API");
        }, 500);
    });
}

const cache = new ExpiryCache("initial data", getApiData, 5000);

await cache.refresh();
console.log(cache.getData()); // Outputs: fetched data from API
```

### With Parameters

```ts
import { ExpiryCache } from "@darco2903/expiry-cache";

const cache = new ExpiryCache(10, (a: number, b: number) => a + b, 200);

cache.refresh(5, 7); // typed: refresh(a: number, b: number)
console.log(cache.getData()); // Outputs: 12
```

### Setting Expiry Manually

```ts
import { ExpiryCache } from "@darco2903/expiry-cache";

const cache = new ExpiryCache(0, () => 0);

cache.refresh();
cache.refreshExpiresAt(Date.now());
cache.refreshExpiresIn(1000);
```
