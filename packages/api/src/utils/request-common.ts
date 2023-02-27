import type { DSOptions, Merge, PromiseCookieJar } from '../typings';
import hasOwn from './has-own';

export type RequestCookie =
  | string
  | string[]
  | Array<[name: string, value: string | number | boolean]>
  | Array<{ name: string; value: string | number | boolean }>
  | PromiseCookieJar
  | Record<string, string | number | boolean>;

export interface DeviceInfo {
  readonly id: string;
  readonly platform?: 'android' | 'ios';
  readonly name?: string;
  readonly version?: string;
  readonly brand?: string;
  readonly model?: string;
}

interface BasicRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  prefixUrl?: string;
  searchParams?: string | URLSearchParams | Record<string, string | number | boolean | null | undefined>;
  resolveUrl?: (url: string | URL, options?: RequestOptions) => string;
  /** shortcut for `headers.cookie` or `cookieJar` */
  cookie?: RequestCookie;
  cookieJar?: PromiseCookieJar;
  credentials?: RequestCredentials;
  body?: string | Buffer | Blob | BufferSource | FormData | URLSearchParams | ReadableStream<Uint8Array>;
  form?: Record<string, any>;
  json?: Record<string, any>;
  headers?: Headers | Record<string, string> | [string, string][];
  controller?: AbortController;
  signal?: AbortSignal;
  timeout?: number;
  followRedirect?: boolean;
  throwHttpErrors?: boolean;
  resolveBodyOnly?: boolean;
  /** default `true`, will directly return the `data` field of an API response, only available when `responseType` is `json` */
  resolveApiBody?: boolean;
  /** default `true`, will throw error when `retcode` is not zero or `code` is not `200`, only available when `responseType` is `json` */
  throwOnApiError?: boolean;
  responseType?: 'text' | 'json' | 'buffer' | 'arraybuffer' | 'formdata';
  referrer?: string;
  referrerPolicy?: ReferrerPolicy;
  ds?: DSOptions;
  device?: DeviceInfo;
}

export type RequestOptions = BasicRequestOptions & Partial<DSOptions>;

export type OptionsOfTextResponseBody = Merge<RequestOptions, { resolveBodyOnly?: false, responseType?: 'text' }>;
export type OptionsOfJSONResponseBody = Merge<RequestOptions, { resolveBodyOnly?: false, responseType?: 'json' }>;
export type OptionsOfBufferResponseBody = Merge<RequestOptions, { resolveBodyOnly?: false, responseType?: 'buffer' }>;
export type OptionsOfArrayBufferResponseBody = Merge<RequestOptions, { resolveBodyOnly?: false, responseType?: 'arraybuffer' }>;
export type OptionsOfFormDataResponseBody = Merge<RequestOptions, { resolveBodyOnly?: false, responseType?: 'formdata' }>;
export type OptionsOfUnknownResponseBody = Merge<RequestOptions, { resolveBodyOnly?: false }>;

export class HTTPError extends Error {
  readonly name = 'HTTPError';
  readonly status: number;
  readonly statusText: string;
  readonly response: Response | null;

  constructor(response: Response);
  constructor(status: number, statusText: string);
  constructor(response: Response | number, statusText?: string) {
    super(`HTTP Error ${typeof response === 'number' ? response : response.status}`);

    this.status = typeof response === 'number' ? response : response.status;
    this.statusText = statusText || (response as Response).statusText;
    this.response = typeof response === 'number' ? null : response;
  }
}

export class APIError extends Error {
  readonly name = 'APIError';
  readonly code: number;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

export class AbortError extends Error {
  readonly name = 'AbortError';
  readonly isCanceled = true;
}

export interface OnCancelFunction {
  (cancelHandler: () => void): void;
  shouldReject: boolean;
}

export interface UserCancelHandler {
  (reason?: unknown): void;
  shouldReject?: boolean;
}

export type CancelableExecutor<T> = (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: unknown) => void, onCancel: OnCancelFunction) => void;
export interface Cancelable<T> extends Promise<T> {
  readonly isCanceled: boolean;
  cancel: (reason?: string) => void;
}

export interface PlainResponse<T = unknown> {
  readonly headers: Headers;
  readonly ok: boolean;
  readonly redirected: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly body: T;
}

type ResponseBodyOnly = { resolveBodyOnly: true };

export interface RequestFunction {
  (url: string | URL, options?: OptionsOfTextResponseBody): Cancelable<PlainResponse<string>>;
  <T>(url: string | URL, options?: OptionsOfJSONResponseBody): Cancelable<PlainResponse<T>>;
  (url: string | URL, options?: OptionsOfBufferResponseBody): Cancelable<PlainResponse<Buffer>>;
  (url: string | URL, options?: OptionsOfArrayBufferResponseBody): Cancelable<PlainResponse<ArrayBuffer>>;
  (url: string | URL, options?: OptionsOfFormDataResponseBody): Cancelable<PlainResponse<FormData>>;
  (url: string | URL, options?: OptionsOfUnknownResponseBody): Cancelable<Response>;

  (url: string | URL, options?: (Merge<OptionsOfTextResponseBody, ResponseBodyOnly>)): Cancelable<string>;
  <T>(url: string | URL, options?: (Merge<OptionsOfJSONResponseBody, ResponseBodyOnly>)): Cancelable<T>;
  (url: string | URL, options?: (Merge<OptionsOfBufferResponseBody, ResponseBodyOnly>)): Cancelable<Buffer>;
  (url: string | URL, options?: (Merge<OptionsOfArrayBufferResponseBody, ResponseBodyOnly>)): Cancelable<ArrayBuffer>;
  (url: string | URL, options?: (Merge<OptionsOfFormDataResponseBody, ResponseBodyOnly>)): Cancelable<FormData>;

  (url: string | URL, options?: RequestOptions): Cancelable<Response>;
}

export interface ExtensibleRequestFunction extends RequestFunction {
  extend(defaults: RequestOptions): RequestFunction;
}

export function buildQueryString(searchParams: string | number | URLSearchParams | Record<string, string | number | boolean | null | undefined>): string {
  if (typeof searchParams === 'string' || typeof searchParams === 'number' || searchParams instanceof URLSearchParams) {
    return searchParams + '';
  }

  const fragments: string[] = [];
  for (const key in searchParams) {
    if (hasOwn(searchParams, key)) {
      const value = searchParams[key];
      if (value == null) {
        continue;
      }

      fragments.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }

  return fragments.length ? '?' + fragments.join('&') : '';
}

export function createCancelable<T>(executor: CancelableExecutor<T>): Cancelable<T>;
export function createCancelable<T>(promise: PromiseLike<T>, onCancel?: UserCancelHandler): Cancelable<T>;
export function createCancelable<T>(promise: CancelableExecutor<T> | PromiseLike<T>, onCancel?: UserCancelHandler): Cancelable<T> {
  let canceled = false;
  let cancelablePromise: Cancelable<T>;
  let abort: (reason?: any) => void;

  if (typeof promise === 'function') {
    cancelablePromise = new Promise<T>((resolve, reject) => {
      const callbacksOnCancel: Array<() => void> = [];
      onCancel = () => {
        for (const fn of callbacksOnCancel) {
          fn();
        }
      };

      const onCancelFn = ((handler: () => void) => {
        callbacksOnCancel.push(handler);
      }) as unknown as OnCancelFunction;

      onCancelFn.shouldReject = true;

      /* executor */
      promise(resolve, reject, onCancelFn);

      abort = onCancelFn.shouldReject ? reject : resolve;
    }) as unknown as Cancelable<T>;

  } else {
    cancelablePromise = Promise.race([
      promise,
      new Promise<void>((resolve, reject) => {
        abort = onCancel?.shouldReject === false ? resolve : reject;
      }),
    ]) as unknown as Cancelable<T>;
  }

  Object.defineProperty(cancelablePromise, 'isCanceled', {
    get: () => canceled,
  });

  Object.defineProperty(cancelablePromise, 'cancel', {
    value: (reason?: unknown) => {
      canceled = true;

      if (onCancel) {
        try {
          onCancel(reason);
        } catch (e) {
          // DO NOTHING
        }
      }

      if (typeof reason === 'string') {
        reason = new AbortError(reason);
      }

      abort(reason);
    },
  });

  return cancelablePromise;
}

export function getCookie(cookie: RequestCookie, name: string): string | undefined {
  if (typeof cookie === 'string') {
    const match = cookie.match(new RegExp(`\\b${name}=([^;]+)`));
    if (match) return match[1];
  }
  else if (Array.isArray(cookie)) {
    if (typeof cookie[0] === 'string') {
      for (let i = 0; i < cookie.length; ++i) {
        if ((cookie[i] as string).startsWith(`${name}=`)) {
          return (cookie[i] as string).slice(name.length + 1);
        }
      }
    }
    else if (Array.isArray(cookie[0])) {
      for (let i = 0; i < cookie.length; ++i) {
        if ((cookie[i] as [string, string])[0] === name) {
          return (cookie[i] as [string, string])[1];
        }
      }
    }
    else {
      for (let i = 0; i < cookie.length; ++i) {
        if ((cookie[i] as { name: string, value: string }).name === name) {
          return (cookie[i] as { name: string, value: string }).value;
        }
      }
    }
  }
  else {
    return cookie[name as unknown as keyof typeof cookie] as string;
  }
}

export function extractUrlSearchParams(url: string | URL, base?: string | URL) {
  if (typeof url === 'string') {
    if (!base && typeof location !== 'undefined') {
      base = location.href;
    }
    url = new URL(url, base);
  }

  return url.searchParams;
}
