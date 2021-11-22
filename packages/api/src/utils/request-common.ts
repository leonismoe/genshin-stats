import type { DSOptions, Merge, PromiseCookieJar } from '../typings';
import hasOwn from './has-own';

interface BasicRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  prefixUrl?: string;
  searchParams?: string | URLSearchParams | Record<string, string | number | boolean | null | undefined>;
  resolveUrl?: (url: string | URL, options?: RequestOptions) => string;
  cookieJar?: PromiseCookieJar;
  body?: string | Buffer | Blob | BufferSource | FormData | URLSearchParams | ReadableStream<Uint8Array>;
  form?: Record<string, any>;
  json?: Record<string, any>;
  headers?: Headers | Record<string, string> | [string, string][];
  signal?: AbortSignal;
  timeout?: number;
  followRedirect?: boolean;
  throwHttpErrors?: boolean;
  resolveBodyOnly?: boolean;
  responseType?: 'text' | 'json' | 'buffer' | 'arraybuffer' | 'formdata';
  ds?: DSOptions;
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
    const status = typeof response === 'number' ? response : response.status;
    super(`HTTP Error ${status}`);

    this.status = status;
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


export function extractUrlSearchParams(url: string | URL, base?: string | URL) {
  if (typeof url === 'string') {
    if (!base && typeof location !== 'undefined') {
      base = location.href;
    }
    url = new URL(url, base);
  }

  return url.searchParams;
}
