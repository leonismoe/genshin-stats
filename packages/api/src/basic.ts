import { request, RequestOptions } from './request';
import { APIClientType } from './constants';

interface UserGameRole {
  game_biz: string;
  game_uid: string;
  is_chosen: boolean;
  is_official: boolean;
  level: number;
  nickname: string;
  region: string;
  region_name: string;
}

export function getUserGameRolesByCookie(game_biz: string, options?: RequestOptions): Promise<UserGameRole[]> {
  return request<{ list: UserGameRole[] }>(`https://api-takumi.mihoyo.com/binding/api/getUserGameRolesByCookie?game_biz=${game_biz}`, {
    ...options,
    client_type: APIClientType.WEBVIEW,
    responseType: 'json',
    resolveBodyOnly: true,
    ds2: true,
  }).then(res => res.list);
}

export function getUserGameRolesByLtoken(game_biz: string, options?: RequestOptions): Promise<UserGameRole[]> {
  return request<{ list: UserGameRole[] }>(`https://api-takumi.mihoyo.com/binding/api/getUserGameRolesByLtoken?game_biz=${game_biz}`, {
    ...options,
    responseType: 'json',
    resolveBodyOnly: true,
  }).then(res => res.list);
}
