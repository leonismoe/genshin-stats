import { request, uuid, APIClientType, RequestCookie } from '@mihoyo-kit/api';
import { sleep } from '../../common/utils/sleep';
import { MixedValuesOfEnum } from '../../common/types';
import {
  GeetestChallenge,
  GeetestValidation,
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

export async function checkin(cookie: RequestCookie, uid: number | string, region: MixedValuesOfEnum<GenshinServerRegion> | string = GenshinServerRegion.OFFICIAL): Promise<void> {
  let mhyUuid: string;
  if (typeof cookie === 'string') {
    const match = cookie.match(/_MHYUUID=([^;]+);/);
    mhyUuid = match ? match[1] : uuid();
  } else {
    mhyUuid = uuid();
  }

  const reqOptions = {
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
      uid: `${uid}`,
    },
  } as const;

  let result = await request<GenshinCheckinInfo>(`${API_PREFIX}/sign`, reqOptions);

  if ((result as unknown as GeetestChallenge).risk_code) {
    const challenge = result as unknown as GeetestChallenge;
    if (challenge.risk_code === 375) {
      const callback = `geetest_${Date.now()}`;

      let geetest: GeetestValidation | null = null;
      try {
        const response = await request('https://api.geetest.com/ajax.php', {
          resolveBodyOnly: true,
          responseType: 'text',
          searchParams: {
            gt: challenge.gt,
            challenge: challenge.challenge,
            lang: 'zh-cn',
            pt: 3,
            client_type: 'web_mobile',
            callback,
          },
          headers: {
            Origin: 'https://webstatic.mihoyo.com',
            Referer: 'https://webstatic.mihoyo.com/',
          },
        });

        const data = JSON.parse(response.slice(callback.length + 1, -1)) as { status: string; data: GeetestValidation };
        if (data.status === 'success') {
          geetest = data.data;
        }
      } catch (e) {
        // DO NOTHING
      }

      if (geetest && geetest.result === 'success') {
        reqOptions.headers['x-rpc-challenge'] = challenge.challenge;
        reqOptions.headers['x-rpc-validate'] = geetest.validate;
        reqOptions.headers['x-rpc-seccode'] = `${geetest.validate}|jordan`;

        await sleep(2000);
        result = await request<GenshinCheckinInfo>(`${API_PREFIX}/sign`, reqOptions);

        if (!(result as unknown as GeetestChallenge).risk_code) {
          return;
        }
      }
    }

    throw new Error('本次签到操作被风控');
  }
}
