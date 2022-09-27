import { RequestCookie, UserGameRole, getUserGameRolesByLtoken } from '@mihoyo-kit/api';
import { sleep } from '../../common/utils';
import { GenshinCheckinInfo, GenshinCheckinAwardItem, GenshinCheckinExtraAwardItem, GenshinCheckinExtraAwards } from './types';
import { checkin, getAwards, getCheckinInfo, getExtraAwards } from './api';

export interface GenshinCheckinResult extends GenshinCheckinInfo {
  checkedIn: boolean;
  role: UserGameRole;
  award: GenshinCheckinAwardItem;
  extraAward: GenshinCheckinExtraAwardItem | null;
  monthCard: GenshinCheckinExtraAwards['mc'] | null;
}

export async function checkinGenshinCN(cookie: RequestCookie, awards?: readonly GenshinCheckinAwardItem[]): Promise<GenshinCheckinResult> {
  const roles = await getUserGameRolesByLtoken('hk4e_cn', { cookie });
  if (!roles.length) {
    throw new Error('没有找到用户角色');
  }

  await sleep(200);
  const role = roles[0];
  let status = await getCheckinInfo(cookie, role.game_uid, role.region);
  if (status.first_bind) {
    throw new Error('首次使用请进入米油社手动签到');
  }

  let checkedIn = false;
  if (!status.is_sign) {
    await sleep(500);
    try {
      status = await checkin(cookie, role.game_uid, role.region);
    } catch (e: unknown) {
      if (e && (e as Error).message === '账号被风控') {
        await sleep(500);
        status = await getCheckinInfo(cookie, role.game_uid, role.region);
        if (!status.is_sign) {
          throw e;
        }
      } else {
        throw e;
      }
    }
    checkedIn = true;
  }

  if (!awards) {
    await sleep(500);
    awards = await getAwards();
  }

  let extraAward: GenshinCheckinExtraAwardItem | null = null;
  let monthCard: GenshinCheckinExtraAwards['mc'] | null = null;
  const extraAwards = await getExtraAwards(cookie, role.game_uid, role.region);
  if (extraAwards.login && extraAwards.has_short_act) {
    extraAward = extraAwards.awards[extraAwards.total_cnt - 1] || null;
    monthCard = extraAwards.mc;
  }

  const award = awards[status.total_sign_day - 1];

  return {
    checkedIn,
    role,
    award,
    extraAward,
    monthCard,
    ...status,
  };
}
