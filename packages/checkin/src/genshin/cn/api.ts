import { request, uuid, APIClientType, RequestCookie } from '@mihoyo-kit/api';
import { MixedValuesOfEnum } from '../../common/types';
import {
  GeeTestResponse as GeetestResponse,
  GenshinCheckinAwardItem,
  GenshinCheckinAwards,
  GenshinCheckinExtraAwards,
  GenshinCheckinInfo,
  GenshinServerRegion,
} from './types';

const API_PREFIX = 'https://api-takumi.mihoyo.com/event/bbs_sign_reward';

export const ACT_ID = 'e202009291139501';

export async function getAwards(): Promise<readonly GenshinCheckinAwardItem[]> {
  return request<GenshinCheckinAwards>(`${API_PREFIX}/home?act_id=${ACT_ID}`, {
    responseType: 'json',
    resolveBodyOnly: true,
  }).then(res => res.awards);
}

export async function getExtraAwards(): Promise<GenshinCheckinExtraAwards>;
export async function getExtraAwards(cookie: RequestCookie, uid: number | string, region?: MixedValuesOfEnum<GenshinServerRegion> | string): Promise<GenshinCheckinExtraAwards>;
export async function getExtraAwards(cookie?: RequestCookie, uid?: number | string, region: string = GenshinServerRegion.OFFICIAL): Promise<GenshinCheckinExtraAwards> {
  let url = `${API_PREFIX}/extra_award?act_id=${ACT_ID}`;
  if (cookie && uid) {
    url += `&region=${region}&uid=${uid}`;
  }

  return request<GenshinCheckinExtraAwards>(url, {
    responseType: 'json',
    resolveBodyOnly: true,
    cookie,
  });
}

export function getCheckinInfo(cookie: RequestCookie, uid: number | string, region: MixedValuesOfEnum<GenshinServerRegion> | string = GenshinServerRegion.OFFICIAL): Promise<GenshinCheckinInfo> {
  return request<GenshinCheckinInfo>(`${API_PREFIX}/info?act_id=${ACT_ID}&region=${region}&uid=${uid}`, {
    responseType: 'json',
    resolveBodyOnly: true,
    cookie,
  });
}

export async function checkin(cookie: RequestCookie, uid: number | string, region: MixedValuesOfEnum<GenshinServerRegion> | string = GenshinServerRegion.OFFICIAL): Promise<GenshinCheckinInfo> {
  let mhyUuid: string;
  if (typeof cookie === 'string') {
    const match = cookie.match(/_MHYUUID=([^;]+);/);
    mhyUuid = match ? match[1] : uuid();
  } else {
    mhyUuid = uuid();
  }

  const result = await request<GenshinCheckinInfo>(`${API_PREFIX}/sign`, {
    method: 'POST',
    client_type: APIClientType.WEBVIEW,
    responseType: 'json',
    resolveBodyOnly: true,
    cookie,
    headers: {
      Origin: 'https://webstatic.mihoyo.com',
      Referer: 'https://webstatic.mihoyo.com/',
      'x-rpc-channel': 'miyousheluodi',
    },
    device: {
      id: mhyUuid,
      platform: 'android',
    },
    json: {
      act_id: ACT_ID,
      region: region,
      uid: '' + uid,
    },
  });

  if ((result as unknown as GeetestResponse).risk_code != null) {
    throw new Error('账号被风控');
  }

  return result;
}
