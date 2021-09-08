import { invoke } from '@tauri-apps/api/tauri';
import { buildQueryString, Cancelable, createCancelable, ExtensibleRequestFunction, RequestFunction, RequestOptions } from './request-common';

export const request = function(url: string | URL, options?: RequestOptions): Cancelable<any> {
  if (options) {
    if (options.prefixUrl) {
      // implicit type conversion
      url = new URL(url as string, options.prefixUrl);
    }

    if (options.searchParams) {
      if (typeof url === 'string') {
        url = new URL(url);
      }
      url.search = buildQueryString(options.searchParams);
    }
  }

  let timeout: ReturnType<typeof setTimeout> | undefined;
  const cleanup = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
  };

  const cancelable = createCancelable(invoke('proxy', {
    url: url + '',
    ...options,
  }), cleanup);

  if (options?.timeout) {
    timeout = setTimeout(() => cancelable.cancel('timeout'), options.timeout);
  }

  return cancelable;
} as ExtensibleRequestFunction;

request.extend = (defaults: RequestOptions) => {
  return (url: string | URL, options?: RequestOptions) => request(url, { ...defaults, ...options } as any) as any;
};

export default request;
export { RequestOptions, HTTPError, APIError, AbortError, UserCancelHandler } from './request-common';
