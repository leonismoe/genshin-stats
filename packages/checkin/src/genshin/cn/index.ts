import { RequestCookie, UserGameRole, getUserGameRolesByCookie, getUserGameRolesByLtoken } from '@mihoyo-kit/api';
import { sleep } from '../../common/utils';
import { GenshinCheckinInfo, GenshinCheckinAwardItem } from './types';
import { checkin, getAwards, getCheckinInfo } from './api';

export interface GenshinCheckinResult extends GenshinCheckinInfo {
  checkedIn: boolean;
  role: UserGameRole;
  award: GenshinCheckinAwardItem;
}

export async function checkinGenshinCN(cookie: RequestCookie): Promise<GenshinCheckinResult> {
  const roles = await getUserGameRolesByCookie('hk4e_cn', { cookie });
  if (!roles.length) {
    throw new Error('没有找到用户角色');
  }

  await sleep(500);
  const role = roles[0];
  let status = await getCheckinInfo(cookie, role.game_uid, role.region);
  if (status.first_bind) {
    throw new Error('首次使用请进入米油社手动签到');
  }

  let checkedIn = false;
  if (!status.is_sign) {
    await sleep(500);
    status = await checkin(cookie, role.game_uid, role.region);
    checkedIn = true;
  }

  await sleep(500);
  const awards = await getAwards(cookie);
  const award = awards[status.total_sign_day];

  return {
    checkedIn,
    role,
    award,
    ...status,
  };
}
