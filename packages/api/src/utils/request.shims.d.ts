declare module '#request' {
  export const fetch: typeof globalThis.fetch;
  export const AbortSignal: typeof globalThis.AbortSignal;
  export const AbortController: typeof globalThis.AbortController;
  export const Headers: typeof globalThis.Headers;
  export const FormData: typeof globalThis.FormData;
  export const File: typeof globalThis.File;
  export const Request: typeof globalThis.Request;
  export const Response: typeof globalThis.Response;

  export const request: import('./request-common').ExtensibleRequestFunction;
  export type { RequestOptions, HTTPError, APIError, AbortError, UserCancelHandler } from './request-common';
  export default request;
}
