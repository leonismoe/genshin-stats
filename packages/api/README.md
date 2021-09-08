@mihoyo-kit/api
===============
This package provides the common request method for miHoYo API and utility methods like `getDS` and `getDS2`.

### DS
``` ts
const enum APIClientType {
  IOS = 1,
  ANDROID = 2,
  WEB = 4,     // pc
  WEBVIEW = 5, // webview in android / ios app
}

interface DSOptions {
  client_type: MixedValuesOfEnum<APIClientType>; // client type in HTTP request header
  app_version: string; // HoYoLab's version, miHoYo uses it and `client_type` to decide the actual salt
  channel?: string;    // for HoYoLab's native requests in CN, it'll be `miyousheluodi`
  device_id?: string;  // some miHoYo API needs the device id, which usually in UUID format or a hexed md5 result
  salt?: string;       // custom salt, skipping the internal salt resolve procedure
  ds2?: boolean;       // whether to use the `getDS2` algorithm or not, default false
}

function getDS(): string;
function getDS(options: DSOptions): string;
function getDS(client_type: MixedValuesOfEnum<APIClientType>, app_version?: string): string;
function calculateDS(salt: string): string;

type DS2Param = string | Record<string, string | number | boolean | null | undefined>;
function getDS2(body: DS2Param, query: DS2Param | URLSearchParams, options?: DSOptions): string;
function getDS2(body: DS2Param, query: DS2Param | URLSearchParams, client_type: MixedValuesOfEnum<APIClientType>, app_version?: string): string;
function calculateDS2(salt: string, body: string, query: string): string;
```

The `getDS` and `getDS2` utility function automatically resolve the proper salt, but you need to provide the correct `client_type` and `app_version` (defaults to the latest recorded version of HoYoLab).


### Request Utility
``` ts
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; // default: GET
  prefixUrl?: string;
  searchParams?: string | URLSearchParams | Record<string, string | number | boolean | null | undefined>; // Query string that will be added to the request URL, this will override the query string in url
  resolveUrl?: (url: string, options?: RequestOptions) => string; // custom url translator, runs after getDS/getDS2 and before actual HTTP request
  cookieJar?: PromiseCookieJar; // tough-cookie's CookieJar instance, `options.headers.cookie` will be overridden if provided
  body?: string | Buffer | Blob | BufferSource | FormData | URLSearchParams | ReadableStream<Uint8Array>; // raw HTTP request body
  form?: Record<string, any>; // will be converted to a query string and set `Content-Type` to `application/x-www-form-urlencoded`
  json?: Record<string, any>; // will be stringified using `JSON.stringify` and set `Content-Type` to `application/json`
  headers?: Headers;
  signal?: AbortSignal;
  timeout?: number;          // in milliseconds, default 0, which means no timeout
  followRedirect?: boolean;  // default: true
  throwHttpErrors?: boolean; // default: true
  resolveBodyOnly?: boolean; // default false, when set to true the promise will return the Response body instead of the Response object
  responseType?: 'text' | 'json' | 'buffer' | 'arraybuffer' | 'formdata'; // no default, which will leave the response body unread

  // DSOptions
  ds?: DSOptions;

  // flattened DSOptions
  client_type?: MixedValuesOfEnum<APIClientType>;
  app_version?: string;
  channel?: string;
  device_id?: string;
  salt?: string;
  ds2?: boolean;
}

function request<T = unknown>(url: string | URL, options?: RequestOptions): Promise<Response | T>;
```

This package currently provides 2 implementations of `request` function:
* `@mihoyo-kit/api/lib/request-browser`

  Uses browser's Fetch API. If you want to support old browsers, please import the polyfill (eg. `whatwg-fetch`) by yourself.

  Due to the limitation of browser, `options.headers.cookie` and `options.cookieJar` will be silently ignored.

  If the function runs on the normal web page, or the browser extension without host permission,
  you may need to set up a proxy server, set `document.cookie` in client side,
  and request with option `credentials: 'same-origin'` or `credentials: 'include'`.

* `@mihoyo-kit/api/lib/request-node`

  Uses `undici` module to make HTTP requests, and `abort-controller` to make it cancelable.

  If you're using npm below `7.0.0` or Yarn and other package managers, you may need to add `undici`, `abort-controller` as your project's dependencies explicitly.


> **IMPORTANT**
>
> This package uses Conditional Exports to decide which implementation to use, your JS runtime or bundler should support the following features:
> * [Conditional Exports](https://nodejs.org/api/packages.html#packages_conditional_exports)
> * [Subpath Exports](https://nodejs.org/api/packages.html#packages_subpath_exports)
> * [Subpath Imports](https://nodejs.org/api/packages.html#packages_subpath_imports)
>
> If you're using Rollup or Vite to bundle your App, be sure to import `@rollup/plugin-node-resolve` in bundler's configuration,
> and its version should at least `13.0.0`.

Example usage:
``` ts
import { request, APIClientType } from '@mihoyo-kit/api';

interface PCBannerResult {
  banners: Array<{ image: string, path: string }>;
}

const res = await request<PCBannerResult>('https://bbs-api.mihoyo.com/misc/wapi/getPCBanner?gids=2', {
  client_type: APIClientType.WEB,
  app_version: '2.11.0',
  responseType: 'json',
  resolveBodyOnly: true,
});

console.log(res); // { banners: [...] }
```

