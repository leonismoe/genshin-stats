export { APIClientType, DSServer } from './constants';
export { default as hasOwn } from './utils/has-own';
export { request } from '#request'; // will be replaced with `@mihoyo-kit/api/lib/request` in `post-build`
export { getDS, calculateDS, getDS2, calculateDS2, normalizeQuery, getHTTPRequestHeaders, getUserAgent } from './utils/get-ds';
export { getUserGameRolesByCookie, getUserGameRolesByLtoken, getUserGameRolesByCookie as getUserGameRoles } from './basic';
export { getGameRecordCard } from './game-record';

export type { RequestOptions, HTTPError, APIError, AbortError, UserCancelHandler, RequestCookie } from './utils/request-common';
export type { WrapWithKey, ValuesOfEnum, MixedValuesOfEnum, PromiseCookieJar, DSOptions } from './typings';
