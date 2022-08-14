export enum GenshinServerRegion {
  OFFICIAL = 'cn_gf01',
  BILIBILI = 'cn_qd01',
}

export interface GenshinCheckinAwards {
  awards: readonly GenshinCheckinAwardItem[];
  month: number;
}

export interface GenshinCheckinAwardItem {
  readonly cnt: number;
  readonly icon: string;
  readonly name: string;
}

export interface GenshinCheckinInfo {
  readonly first_bind: boolean;
  readonly is_sign: boolean;
  readonly is_sub: boolean;
  readonly month_first: boolean;
  readonly sign_cnt_missed: number;
  readonly today: string;
  readonly total_sign_day: number;
}

export interface GeeTestResponse {
  code: string; // empty
  risk_code: number;
  gt: string;
  challenge: string;
  success: number;
}
