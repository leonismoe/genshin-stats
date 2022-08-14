export interface Honkai3rdCheckinHomeData {
  biz: 'bh3';
  month: number;
  resign: boolean;
  awards: Honkai3rdCheckinAwardItem[];
}

export interface Honkai3rdCheckinAwardItem {
  name: string;
  cnt: number;
  icon: string;
}

export interface Honkai3rdCheckinExtraAwards {
  awards: Honkai3rdCheckinExtraAwardItem[];
  has_short_act: boolean;
  short_act_info: {
    awards: unknown[];
    start_timestamp: string; // number
    end_timestamp: string; // number
    total_cnt: number;
  };
  total_cnt: number;
}

export interface Honkai3rdCheckinExtraAwardItem extends Honkai3rdCheckinAwardItem {
  id: number;
  sign_day: number;
}

export interface Honkai3rdCheckinInfo {
  is_sign: boolean;
  is_sub: boolean;
  region: string;
  sign_cnt_missed: number;
  today: string; // YYYY-MM-DD
  total_sign_day: number;
}
