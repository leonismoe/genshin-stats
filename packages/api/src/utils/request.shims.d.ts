declare module '#request' {
  export const request: import('./request-common').ExtensibleRequestFunction;
  export type { RequestOptions, HTTPError, APIError, AbortError, UserCancelHandler } from './request-common';
  export default request;
}
