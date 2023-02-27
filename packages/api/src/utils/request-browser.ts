import type { APIResponse, AccountAPIResponse, DSOptions } from '../typings';
import hasOwn from './has-own';
import { getDS, getDS2, getHTTPRequestHeaders } from './get-ds';
import { AbortError, APIError, buildQueryString, Cancelable, ExtensibleRequestFunction, extractUrlSearchParams, HTTPError, RequestOptions } from './request-common';
import sleep from './sleep';

export const fetch: typeof globalThis['fetch'] = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (!/\.(mihoyo|hoyolab)\.com|localhost$/.test(window.location.hostname) && window.fetch.toString().includes('native code')) {
    return sleep(1000).then(() => {
      if (window.fetch.toString().includes('native code')) {
        return Promise.reject(new TypeError('Failed to fetch'));
      } else {
        return window.fetch(input, init);
      }
    });
  }
  return window.fetch(input, init);
};
export const AbortController = window.AbortController;
export const AbortSignal = window.AbortSignal;
export const Headers = window.Headers;
export const FormData = window.FormData;
export const File = window.File;
export const Request = window.Request;
export const Response = window.Response;

export const request = function(url: string | URL, options?: RequestOptions): Cancelable<any> {
  if (options?.prefixUrl) {
    // implicit type conversion
    url = new URL(url as string, options.prefixUrl);
  }

  const miHoYo = '.mihoyo.com';
  const isMiHoYo = typeof url === 'string' ? url.includes(miHoYo) : url.hostname.endsWith(miHoYo);

  const controller = options && options.controller || new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const init: RequestInit = {
    signal: controller.signal,
  };

  if (options) {
    init.method = options.method || 'GET';

    if (options.searchParams) {
      if (typeof url === 'string') {
        url = new URL(url);
      }
      url.search = buildQueryString(options.searchParams);
    }

    if (options.followRedirect === false) {
      init.redirect = 'manual';
    }

    if (options.referrer) {
      init.referrer = options.referrer;
    }
    if (options.referrerPolicy) {
      init.referrerPolicy = options.referrerPolicy;
    }

    let content_type: string | undefined;
    if (options.body) {
      init.body = options.body;

    } else if (options.json) {
      init.body = JSON.stringify(options.json);
      content_type = 'application/json';

    } else if (options.form) {
      init.body = buildQueryString(options.form);
      content_type = 'application/x-www-form-urlencoded';
    }

    const headers = init.headers = new Headers(options.headers);
    if (content_type || options.ds || options.client_type) {
      if (content_type && !headers.has('Content-Type')) {
        headers.set('Content-Type', content_type);
      }

      let ds: string | undefined;
      if (options.ds) {
        ds = options.ds.ds2 || options.ds2
          ? getDS2(init.body as string, extractUrlSearchParams(url), options.ds)
          : getDS(options.ds);

      } else if (options.client_type) {
        ds = options.ds2
          ? getDS2(init.body as string, extractUrlSearchParams(url), options.client_type, options.app_version)
          : getDS(options.client_type, options.app_version);
      }

      if (ds) {
        if (!headers.has('DS')) {
          headers.set('DS', ds);
        }

        const extra_headers = getHTTPRequestHeaders(options.ds || options as DSOptions);
        for (const name in extra_headers) {
          if (!headers.has(name) && hasOwn(extra_headers, name)) {
            headers.set(name, extra_headers[name]);
          }
        }
      }
    }

    if (options.device) {
      init.headers.set('x-rpc-device_id', options.device.id);
      if (options.device.version) init.headers.set('x-rpc-sys_version', options.device.version);
      if (options.device.name)    init.headers.set('x-rpc-device_name', options.device.name);
      if (options.device.model)   init.headers.set('x-rpc-device_model', options.device.model);
    } else if (options.device_id) {
      init.headers.set('x-rpc-device_id', options.device_id);
    } else if (options.ds && options.ds.device_id) {
      init.headers.set('x-rpc-device_id', options.ds.device_id);
    }

    if (options.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }

    if (options.timeout) {
      timeout = setTimeout(() => controller.abort(), options.timeout);
    }

    if (options.resolveUrl) {
      url = options.resolveUrl(url, options);
    }
  }

  const cancelable = fetch(url as string, init)
    .then(response => {
      if (timeout) {
        clearInterval(timeout);
      }

      if (!response.ok && options?.throwHttpErrors !== false) {
        throw new HTTPError(response);
      }

      let body: Promise<unknown> | undefined;
      if (options) {
        switch (options.responseType) {
          case 'text': body = response.text(); break;
          case 'json':
            body = response.json();
            if (isMiHoYo) {
              body = (body as Promise<APIResponse<unknown> | AccountAPIResponse<unknown>>).then(data => {
                if ((data as APIResponse<unknown>).retcode != null || (data as AccountAPIResponse<unknown>).code != null) {
                  if (options.throwOnApiError !== false) {
                    if ((data as APIResponse<unknown>).retcode != null) {
                      if ((data as APIResponse<unknown>).retcode) {
                        throw new APIError(
                          (data as APIResponse<unknown>).message,
                          (data as APIResponse<unknown>).retcode,
                        );
                      }
                    } else if ((data as AccountAPIResponse<unknown>).code != null) {
                      if ((data as AccountAPIResponse<unknown>).code !== 200) {
                        throw new APIError(
                          (data as AccountAPIResponse<unknown>).data.msg,
                          (data as AccountAPIResponse<unknown>).data.status,
                        );
                      }
                    }
                  }

                  if (options.resolveApiBody !== false) {
                    return data.data;
                  }
                }
                return data;
              });
            }
            break;
          case 'buffer':
          case 'arraybuffer': body = response.arrayBuffer(); break;
          case 'formdata': body = response.formData(); break;
        }

        if (options.resolveBodyOnly && body) {
          return body;
        }
      }

      if (body) {
        return body.then(data => ({
          ok: response.ok,
          url: response.url,
          status: response.status,
          statusText: response.statusText,
          redirected: response.redirected,
          headers: response.headers,
          body: data,
        }));
      }

      return response;

    }, (reason: any) => {
      if (timeout) {
        clearInterval(timeout);
      }

      if (reason && reason.name === 'AbortError') {
        return Promise.reject(new AbortError(reason.message));
      }

      return Promise.reject(reason);
    }) as unknown as Cancelable<unknown>;

  Object.defineProperty(cancelable, 'isCanceled', {
    get: () => controller.signal.aborted,
  });

  cancelable.cancel = () => controller.abort();

  return cancelable;

} as ExtensibleRequestFunction;

request.extend = function(defaults: RequestOptions) {
  return (url: string | URL, options?: RequestOptions) => request(url, { ...defaults, ...options } as any) as any;
};

export default request;
export type { RequestOptions, HTTPError, APIError, AbortError, UserCancelHandler } from './request-common';
