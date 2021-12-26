import { request, RequestOptions } from './request';
import { APIClientType } from './constants';

interface UserGameRecordCard {
  background_image: string;
  data: Array<{ name: string, type: number, value: string }>;
  data_switches: Array<{ switch_id: number, is_public: boolean, switch_name: string }>;
  game_id: number;
  game_role_id: string;
  has_role: boolean;
  is_public: boolean;
  level: number;
  nickname: string;
  region: string;
  region_name: string;
  url: string;
}

export function getGameRecordCard(uid: number | string, options?: RequestOptions): Promise<UserGameRecordCard[]> {
  return request<{ list: UserGameRecordCard[] }>(`https://api-takumi-record.mihoyo.com/game_record/app/card/wapi/getGameRecordCard?uid=${uid}`, {
    ...options,
    client_type: APIClientType.WEBVIEW,
    responseType: 'json',
    resolveBodyOnly: true,
    ds2: true,
  }).then(res => res.list);
}
