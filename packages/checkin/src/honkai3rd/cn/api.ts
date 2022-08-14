import { request, RequestCookie } from '@mihoyo-kit/api';
import {
  Honkai3rdCheckinAwardItem,
  Honkai3rdCheckinHomeData,
  Honkai3rdCheckinExtraAwards,
  Honkai3rdCheckinInfo,
} from './types';

const API_PREFIX = 'https://api-takumi.mihoyo.com/event/luna';

export const ACT_ID = 'e202207181446311';

export async function getAwards(): Promise<readonly Honkai3rdCheckinAwardItem[]> {
  return request<Honkai3rdCheckinHomeData>(`${API_PREFIX}/home?lang=zh-cn&act_id=${ACT_ID}`, {
    responseType: 'json',
    resolveBodyOnly: true,
  }).then(res => res.awards);
}

export async function getExtraAwards(cookie: RequestCookie): Promise<Honkai3rdCheckinExtraAwards> {
  return request<Honkai3rdCheckinExtraAwards>(`${API_PREFIX}/extra_award?act_id=${ACT_ID}&lang=zh-cn`, {
    responseType: 'json',
    resolveBodyOnly: true,
    cookie,
  });
}

export function getCheckinInfo(cookie: RequestCookie, uid: number | string, region: string): Promise<Honkai3rdCheckinInfo> {
  return request<Honkai3rdCheckinInfo>(`${API_PREFIX}/info?lang=zh-cn&act_id=${ACT_ID}&region=${region}&uid=${uid}`, {
    responseType: 'json',
    resolveBodyOnly: true,
    cookie,
  });
}

export function checkin(cookie: RequestCookie, uid: number | string, region: string): Promise<void> {
  return request(`${API_PREFIX}/sign`, {
    method: 'POST',
    responseType: 'json',
    resolveBodyOnly: true,
    cookie,
    json: {
      act_id: ACT_ID,
      lang: 'zh-cn',
      region: region,
      uid: '' + uid,
    },
  });
}
