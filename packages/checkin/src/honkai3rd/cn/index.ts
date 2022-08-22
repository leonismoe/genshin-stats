import { RequestCookie, UserGameRole, getUserGameRolesByCookieToken, checkCookieToken } from '@mihoyo-kit/api';
import { sleep } from '../../common/utils';
import { Honkai3rdCheckinInfo, Honkai3rdCheckinAwardItem, Honkai3rdCheckinExtraAwardItem } from './types';
import { checkin, getAwards, getCheckinInfo, getExtraAwards } from './api';

export interface Honkai3rdCheckinPreparation {
  roles: readonly UserGameRole[];
}

export interface Honkai3rdCheckinResult extends Honkai3rdCheckinInfo {
  checkedIn: boolean;
  award: Honkai3rdCheckinAwardItem;
  extraAward: Honkai3rdCheckinExtraAwardItem | null;
}

export async function checkinHonkai3rdCN(
  cookie: RequestCookie,
  role: { game_uid: string; region: string; },
  awards?: readonly Honkai3rdCheckinAwardItem[],
): Promise<Honkai3rdCheckinResult> {
  if (!awards) {
    awards = await getAwards();
  }

  let checkedIn = false;
  const info = await getCheckinInfo(cookie, role.game_uid, role.region);
  if (!info.is_sign) {
    await sleep(500);
    await checkin(cookie, role.game_uid, role.region);
    info.is_sign = true;
    info.total_sign_day++;
    checkedIn = true;
  }

  const award = awards[info.total_sign_day - 1];
  const extraAwards = await getExtraAwards(cookie);
  const extraAward = extraAwards.awards[extraAwards.total_cnt - 1] || null;

  return {
    checkedIn,
    award,
    extraAward,
    ...info,
  };
}

interface Honkai3rdBatchCheckinBaseResult {
  index: number;
  total: number;
  role: UserGameRole;
}

export interface Honkai3rdBatchCheckinSuccessResult extends Honkai3rdBatchCheckinBaseResult, Honkai3rdCheckinResult {}

export interface Honkai3rdBatchCheckinFailureResult extends Honkai3rdBatchCheckinBaseResult {
  error: Error;
}

export type Honkai3rdBatchCheckinResult = Honkai3rdBatchCheckinSuccessResult | Honkai3rdBatchCheckinFailureResult;

export async function *batchCheckinHonkai3rdCN(cookie: RequestCookie): AsyncGenerator<Honkai3rdBatchCheckinResult | Honkai3rdCheckinPreparation, void> {
  const login = await checkCookieToken({ cookie }, true);
  if (login.status !== 1) {
    throw new Error(login.msg);
  }

  await sleep(200);
  const roles = await getUserGameRolesByCookieToken('bh3_cn', { cookie });
  if (!roles.length) {
    throw new Error('没有找到游戏角色');
  }

  yield { roles } as Honkai3rdCheckinPreparation;

  const awards = await getAwards();
  for (let i = 0; i < roles.length; ++i) {
    await sleep(500);

    const role = roles[i];
    try {
      const result = await checkinHonkai3rdCN(cookie, role, awards);

      yield {
        index: i,
        total: roles.length,
        error: null,
        role,
        ...result,
      } as Honkai3rdBatchCheckinSuccessResult;

    } catch (err) {
      yield {
        index: i,
        total: roles.length,
        role,
        error: err as Error,
      } as Honkai3rdBatchCheckinFailureResult;
    }
  }
}
