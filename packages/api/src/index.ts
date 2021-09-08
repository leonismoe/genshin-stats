export { default as hasOwn } from './utils/has-own';
export { request } from '@mihoyo-kit/api/src/request'; // will be corrected in `post-build`
export { RequestOptions, HTTPError, APIError, AbortError, UserCancelHandler } from './utils/request-common';
export { getDS, calculateDS, getDS2, calculateDS2, normalizeQuery, getHTTPRequestHeaders, getUserAgent } from './utils/get-ds';
export { APIClientType, WrapWithKey, ValuesOfEnum, MixedValuesOfEnum, PromiseCookieJar, DSOptions } from '../typings';
export { getUserGameRoles } from './basic';
export { getGameRecordCard } from './game-record';
