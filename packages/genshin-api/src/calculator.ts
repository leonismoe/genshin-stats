import { request, RequestOptions, WrapWithKey } from '@mihoyo-kit/api';
import { getServerRegionByUid } from '@mihoyo-kit/genshin-data';
import { Calculator } from './types';

const BASE_URL = 'https://api-takumi.mihoyo.com/event/e20200928calculate/v1';

export function getAvatarsFromCalculator(options?: RequestOptions): Promise<Calculator.Avatar[]>;
export function getAvatarsFromCalculator(uid: number | string, options?: RequestOptions): Promise<Calculator.AvatarWithLevel[]>;
export function getAvatarsFromCalculator(uid?: number | string | RequestOptions, options?: RequestOptions): Promise<Calculator.Avatar[] | Calculator.AvatarWithLevel[]> {
  const payload: Record<string, unknown> = {
    element_attr_ids: [],
    weapon_cat_ids: [],
  };

  if (!uid || typeof uid === 'object') {
    options = uid as RequestOptions;
    payload.is_all = true;
    return getList<Calculator.Avatar>(`${BASE_URL}/avatar/list`, payload, options);

  } else {
    payload.uid = `${uid}`;
    payload.region = getServerRegionByUid(uid);
    return getList<Calculator.AvatarWithLevel>(`${BASE_URL}/sync/avatar/list`, payload, options);
  }
}

export function getAvatarDetailFromCalculator(uid: number | string, avatar_id: number | string, options?: RequestOptions): Promise<Calculator.AvatarDetail> {
  return request<Calculator.AvatarDetail>(`${BASE_URL}/sync/avatar/detail`, {
    ...options,
    searchParams: {
      avatar_id,
      uid,
      region: getServerRegionByUid(uid),
    },
    headers: {
      Origin: 'https://webstatic.mihoyo.com',
      Referer: 'https://webstatic.mihoyo.com/',
    },
    referrer: 'https://webstatic.mihoyo.com/',
    credentials: 'same-origin',
    responseType: 'json',
    resolveBodyOnly: true,
  });
}

export function getAvatarSkills(avatar_id: number | string, options?: RequestOptions): Promise<Calculator.Skill[]>;
export function getAvatarSkills(avatar_id: number | string, uid: number | string, options?: RequestOptions): Promise<Calculator.SkillWithLevel[]>;
export function getAvatarSkills(avatar_id: number | string, uid?: number | string | RequestOptions, options?: RequestOptions): Promise<Calculator.Skill[] | Calculator.SkillWithLevel[]> {
  if (uid && typeof uid !== 'object') {
    return getAvatarDetailFromCalculator(uid, avatar_id, options).then(res => res.skill_list);
  }

  return request<WrapWithKey<Calculator.Skill[], 'list'>>(`${BASE_URL}/avatarSkill/list`, {
    ...options,
    searchParams: {
      avatar_id,
    },
    headers: {
      Origin: 'https://webstatic.mihoyo.com',
      Referer: 'https://webstatic.mihoyo.com/',
    },
    referrer: 'https://webstatic.mihoyo.com/',
    credentials: 'same-origin',
    responseType: 'json',
    resolveBodyOnly: true,
  }).then((res: WrapWithKey<Calculator.Skill[], 'list'>) => res.list);
}

async function getList<T>(url: string, payload: object, options?: RequestOptions): Promise<T[]> {
  const list: T[] = [];

  const pageSize = 20;
  let page = 0;
  let res: T[];
  do {
    res = (await request<WrapWithKey<T[], 'list'>>(url, {
      ...options,
      method: 'POST',
      credentials: 'same-origin',
      responseType: 'json',
      resolveBodyOnly: true,
      referrer: 'https://webstatic.mihoyo.com/',
      headers: {
        Origin: 'https://webstatic.mihoyo.com',
        Referer: 'https://webstatic.mihoyo.com/',
      },
      json: {
        ...payload,
        page: ++page,
        size: pageSize,
      },
    })).list;

    list.push(...res);
  } while (res.length === pageSize);

  return list;
}
