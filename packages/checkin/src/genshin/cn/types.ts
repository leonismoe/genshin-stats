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

export interface GenshinCheckinExtraAwards {
  awards: GenshinCheckinExtraAwardItem[];
  has_short_act: boolean;
  start_timestamp: string; // number
  end_timestamp: string; // number
  total_cnt: number;
  login: boolean;
  mc: {
    has_month_card: boolean;
    start_time: string;
    open_time: string;
    end_time: string;
    status: string;
  };
}

export interface GenshinCheckinExtraAwardItem extends GenshinCheckinAwardItem {
  id: number;
  sign_day: number;
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

export interface GeetestChallenge {
  code: string; // empty
  risk_code: number;
  gt: string;
  challenge: string;
  success: number;
}

export type GeetestValidation =
  | {
      result: 'success';
      validate: string;
      score: number;
    }
  | {
      result: 'slide';
    }
  | {
      result: string;
      [name: string]: unknown;
    };
