import { APIClientType, request, RequestOptions } from '@mihoyo-kit/api';
import { getServerRegionByUid } from '@mihoyo-kit/genshin-data';
import { DailyNote } from './types';
import { MIHOYO_COMMUNITY_GAME_RECORDS_VERSION } from './constants';

/**
 * 获取实时便笺，包括原粹树脂、每日任务、探索派遣等统计，仅自己可见，需要在米油社打开模块数据展示开关
 * @param role_id UID
 */
export function getDailyNote(role_id: number | string, options?: RequestOptions): Promise<DailyNote> {
  const server = getServerRegionByUid(role_id);

  return request<DailyNote>(`https://api-takumi-record.mihoyo.com/game_record/app/genshin/api/dailyNote?role_id=${role_id}&server=${server}`, {
    ...options,
    client_type: APIClientType.WEBVIEW,
    responseType: 'json',
    resolveBodyOnly: true,
    ds2: true,
    headers: {
      'x-rpc-page': `${MIHOYO_COMMUNITY_GAME_RECORDS_VERSION}_#/ys`,
    },
  });
}
