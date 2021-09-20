declare module '#request' {
  export const request: import('./request-common').ExtensibleRequestFunction;
  export { RequestOptions, HTTPError, APIError, AbortError, UserCancelHandler } from './request-common';
  export default request;
}
