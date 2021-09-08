declare module '#request' {
  declare const request: import('./request-common').ExtensibleRequestFunction;
  export default request;
}
