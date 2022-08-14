import { request, RequestOptions } from './request';

type AccountAPIResponse<T> = T & {
  status: number;
  msg: string;
};

export type AccountInfoResponse = AccountAPIResponse<{
  account_info: AccountInfo;
  game_ctrl_info: null;
  notice_info: Record<string, unknown>;
}>;
export interface AccountInfo {
  account_id: number;
  create_time: number; // timestamp in seconds
  email: string;
  identity_code: string;
  is_adult: 0 | 1;
  is_email_verify: 0 | 1;
  real_name: string;
  safe_area_code: string; // eg. "+86"
  safe_level: number;
  safe_mobile: string;
  weblogin_token: string;
}
export function checkLoginTicket(options?: RequestOptions | null): Promise<boolean>;
export function checkLoginTicket(options: RequestOptions | null | undefined, detail: true): Promise<AccountInfoResponse>;
export function checkLoginTicket(options?: RequestOptions | null, detail?: boolean) {
  return request<AccountInfoResponse>('https://webapi.account.mihoyo.com/Api/login_by_cookie', {
    ...options,
    responseType: 'json',
    resolveBodyOnly: true,
    throwOnApiError: false,
  }).then(res => {
    if (res.status === 1) {
      return detail ? res : true;
    } else {
      return false;
    }
  });
}

export type CookieInfoResponse = AccountAPIResponse<{
  cookie_info: AccountCookieInfo;
}>;
export interface AccountCookieInfo {
  account_id: number;
  cookie_token: string;
  create_time: number; // timestamp in seconds
  cur_time: number; // timestamp in seconds
  email: string;
  iconid: number;
  is_adult: 0 | 1;
  is_realname: 0 | 1;
  mobile: string;
  safe_mobile: string;
}
export function checkCookieToken(options?: RequestOptions | null): Promise<boolean>;
export function checkCookieToken(options: RequestOptions | null | undefined, detail: true): Promise<CookieInfoResponse>;
export function checkCookieToken(options?: RequestOptions | null, detail?: boolean) {
  return request<CookieInfoResponse>('https://webapi.account.mihoyo.com/Api/fetch_cookie_accountinfo', {
    ...options,
    responseType: 'json',
    resolveBodyOnly: true,
    throwOnApiError: false,
  }).then(res => {
    if (res.status === 1) {
      return detail ? res : true;
    } else {
      return false;
    }
  });
}

export interface AccountInfoByLToken {
  is_realname: boolean;
  mobile: string;
  safe_mobile: string;
  account_id: string; // number
  account_name: string;
  email: string;
  is_email_verify: boolean;
  area_code: string;
  safe_area_code: string;
  real_name: string;
  identity_code: string;
  create_time: string; // number
  create_ip: string;
  change_pwd_time: string; // number
  nickname: string;
  user_icon_id: number;
  safe_level: number;
  black_endtime: string; // number
  black_note: string;
  gender: number;
  real_stat: number;
  apple_name: string;
  sony_name: string;
  tap_name: string;
  reactivate_ticket: string;
}
export function checkLToken(options?: RequestOptions | null): Promise<boolean>;
export function checkLToken(options: RequestOptions | null | undefined, detail: true): Promise<AccountInfoByLToken>;
export function checkLToken(options?: RequestOptions | null, detail?: boolean) {
  const deferred = request<AccountInfoByLToken>('https://api-takumi.mihoyo.com/auth/api/getUserAccountInfoByLToken', {
    ...options,
    responseType: 'json',
    resolveBodyOnly: true,
  }).then(res => detail ? res : true);
  return detail ? deferred : deferred.catch(() => false);
}
