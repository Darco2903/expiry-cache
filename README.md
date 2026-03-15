# Expiry Cache

## Description

A simple in-memory cache with expiry functionality. It allows you to store data that automatically expires after a specified duration, with support for synchronous and asynchronous data fetching.

> Note: This package utilizes the [**@darco2903/secondthought**](https://www.npmjs.com/package/@darco2903/secondthought) package for time-related operations, providing enhanced capabilities for handling and manipulating time-related data. While its use is not mandatory, it is recommended for optimal safety and reliability when working with time values.

## Features

- **Type Safety**: Strongly typed cache entries and fetcher functions.
- **Automatic Expiry**: Cache entries automatically expire after a specified duration.
- **Manual Expiry**: Manually expire cache entries when needed.
- **Synchronous and Asynchronous Fetching**: Support for both synchronous and asynchronous data fetching.
- **Raw Data Access**: Access the raw cached data even if it has expired.
- **Parameterized Fetching**: Support for fetcher functions that require parameters.

## Installation

```bash
npm install @darco2903/expiry-cache
```

## Example Usage

### Basic Example

```ts
import { ExpiryCache } from "@darco2903/expiry-cache";

const cache = new ExpiryCache("initial", () => "refreshed", 1000); // inferring to ExpiryCache<string, () => string>
console.log(cache.getData()); // Outputs: initial

await new Promise((resolve) => setTimeout(resolve, 1100)); // wait for cache to expire
console.log(cache.isExpired); // Outputs: true
console.log(cache.getData()); // Outputs: null
console.log(cache.getRawData()); // Outputs: initial (returns the raw data even if expired)

cache.refresh();
console.log(cache.getData()); // Outputs: refreshed

await new Promise((resolve) => setTimeout(resolve, 1100)); // wait for cache to expire
console.log(cache.isExpired); // Outputs: true
console.log(cache.getDataOrRefresh()); // Outputs: refreshed (refreshes the cache and returns the new value)

console.log(cache.expirationTime); // Outputs: 1000
console.log(cache.expiresAt); // Outputs: current timestamp + 1000 milliseconds
console.log(cache.timeToLive); // Outputs: time remaining until expiration in milliseconds

console.log(cache.expire()); // Manually expire the cache
console.log(cache.isExpired); // Outputs: true
```

### With Async Fetcher

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

const cache = new ExpiryCache(0, () => 0); // Cache with no expiry by default

cache.refresh();
cache.refreshExpiresAt(Date.now());
cache.refreshExpiresIn(1000);
```

### SecondThought Integration

```ts
import { ExpiryCache } from "@darco2903/expiry-cache";
import { Minute } from "@darco2903/secondthought";

const cache = new ExpiryCache("data", () => "data", new Minute(5)); // Cache expires in 5 minutes
```
