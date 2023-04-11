import { APIClientType } from './constants';
import { request } from './request';
import { DSOptions } from './typings';

interface HoYoLabRelease {
  game_biz: string;
  game_uid: string;
  is_chosen: boolean;
  is_official: boolean;
  level: number;
  nickname: string;
  region: string;
  region_name: string;
}

export function getLatestReleaseCN(client_type: APIClientType.ANDROID | APIClientType.IOS, app_version?: string): Promise<HoYoLabRelease>;
export function getLatestReleaseCN(ds_options: DSOptions): Promise<HoYoLabRelease>;
export function getLatestReleaseCN(options: APIClientType.ANDROID | APIClientType.IOS | DSOptions, app_version?: string): Promise<HoYoLabRelease> {
  return request<HoYoLabRelease>('https://api-takumi.miyoushe.com/ptolemaios/api/getLatestRelease', {
    resolveBodyOnly: true,
    responseType: 'json',
    ds: typeof options === 'object' ? options : undefined,
    client_type: typeof options !== 'object' ? options : undefined,
    app_version,
  });
}
