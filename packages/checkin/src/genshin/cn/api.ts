import { request, APIClientType, RequestCookie } from '@mihoyo-kit/api';
import { MixedValuesOfEnum } from '../../common/types';
import {
  GenshinCheckinAwardItem,
  GenshinCheckinAwards,
  GenshinCheckinInfo,
  GenshinServerRegion,
} from './types';

const API_PREFIX = 'https://api-takumi.mihoyo.com/event/bbs_sign_reward';

export const ACT_ID = 'e202009291139501';

export async function getAwards(cookie: RequestCookie): Promise<readonly GenshinCheckinAwardItem[]> {
  return request<GenshinCheckinAwards>(`${API_PREFIX}/home?act_id=${ACT_ID}`, {
    client_type: APIClientType.WEBVIEW,
    responseType: 'json',
    resolveBodyOnly: true,
    ds2: true,
    cookie,
  }).then(res => res.awards);
}

export function getCheckinInfo(cookie: RequestCookie, uid: number | string, region: MixedValuesOfEnum<GenshinServerRegion> | string = GenshinServerRegion.OFFICIAL): Promise<GenshinCheckinInfo> {
  return request<GenshinCheckinInfo>(`${API_PREFIX}/info?act_id=${ACT_ID}&region=${region}&uid=${uid}`, {
    client_type: APIClientType.WEBVIEW,
    responseType: 'json',
    resolveBodyOnly: true,
    ds2: true,
    cookie,
  });
}

export function checkin(cookie: RequestCookie, uid: number | string, region: MixedValuesOfEnum<GenshinServerRegion> | string = GenshinServerRegion.OFFICIAL): Promise<GenshinCheckinInfo> {
  return request<GenshinCheckinInfo>(`${API_PREFIX}/sign`, {
    method: 'POST',
    client_type: APIClientType.WEBVIEW,
    responseType: 'json',
    resolveBodyOnly: true,
    ds2: true,
    cookie,
    json: {
      act_id: ACT_ID,
      region: region,
      uid: '' + uid,
    },
  });
}
