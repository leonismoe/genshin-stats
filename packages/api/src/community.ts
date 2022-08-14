/**
 * @module
 * BBS API
 */

import { uuid } from './utils/uuid';
import { checkLToken } from './account';
import { request, RequestOptions } from './request';

function getMihoyoUuid() {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/_MHYUUID=([^;]+)/);
    if (match) {
      return match[1];
    }
  }
  return uuid();
}

export function communityLogin(options?: RequestOptions): Promise<void> {
  return request('https://bbs-api.mihoyo.com/user/wapi/login', {
    device_id: getMihoyoUuid(),
    ...options,
    method: 'POST',
    responseType: 'json',
    resolveBodyOnly: true,
  });
}

export interface CommunityUserInfo {
  user_info: {
    uid: string; // number
    nickname: string;
    introduce: string;
    avatar: string; // number
    gender: number;
    certification: {
      type: number;
      label: string;
    };
    level_exps: Array<{
      game_id: number;
      level: number;
      exp: number;
    }>;
    achieve: {
      like_num: string; // number
      post_num: string; // number
      replypost_num: string; // number
      follow_cnt: string; // number
      followed_cnt: string; // number
      topic_cnt: string; // number
      new_follower_num: string; // number
      good_post_num: string; // number
      follow_collection_cnt: string; // number
    };
    community_info: {
      is_realname: boolean;
      agree_status: boolean;
      silent_end_time: number;
      forbid_end_time: number;
      info_upd_time: number;
      privacy_invisible: {
        post: boolean;
        collect: boolean;
        watermark: boolean;
        reply: boolean;
        post_and_instant: boolean;
      };
      notify_disable: {
        reply: boolean;
        upvote: boolean;
        follow: boolean;
        system: boolean;
        chat: boolean;
      };
      has_initialized: boolean;
      user_func_status: {
        enable_history_view: boolean;
        enable_recommend: boolean;
        enable_mention: boolean;
        user_center_view: number;
      };
      forum_silent_info: unknown[];
      last_login_ip: string;
      last_login_time: number;
      created_at: number;
    };
    avatar_url: string;
    certifications: unknown[];
    level_exp: unknown;
    pendant: string;
    is_logoff: boolean;
    ip_region: string;
  };
  follow_relation: unknown;
  auth_relations: unknown[];
  is_in_blacklist: boolean;
  is_has_collection: boolean;
  is_creator: boolean;
  customer_service: {
    is_customer_service_staff: boolean;
    game_id: number;
  };
  audit_info: {
    is_nickname_in_audit: boolean;
    nickname: string;
    is_introduce_in_audit: boolean;
    introduce: string;
    nickname_status: number;
  };
}
export function getCommunityUserInfo(options?: RequestOptions | null): Promise<CommunityUserInfo> {
  return request<CommunityUserInfo>('https://bbs-api.mihoyo.com/user/wapi/getUserFullInfo', {
    ...options,
    responseType: 'json',
    resolveBodyOnly: true,
  });
}

export function checkCommunityLogin(options?: RequestOptions | null): Promise<boolean>;
export function checkCommunityLogin(options: RequestOptions | null | undefined, detail: true): Promise<CommunityUserInfo>;
export async function checkCommunityLogin(options?: RequestOptions | null, detail?: boolean) {
  try {
    if (await checkLToken(options)) {
      const userInfo = await getCommunityUserInfo(options);
      const community_info = (userInfo.user_info || {}).community_info || {};
      if (community_info.has_initialized) {
        return detail ? userInfo : true;
      }
    }
  } catch (e) {
    if (detail) {
      throw e;
    }
  }
  return false;
}
