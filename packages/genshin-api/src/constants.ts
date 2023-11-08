/**
 * 元素
 */
export enum Element {
  /** 无 */ None    = 'None',
  /** 火 */ Pyro    = 'Pyro',
  /** 水 */ Hydro   = 'Hydro',
  /** 风 */ Anemo   = 'Anemo',
  /** 雷 */ Electro = 'Electro',
  /** 草 */ Dendro  = 'Dendro',
  /** 冰 */ Cryo    = 'Cryo',
  /** 岩 */ Geo     = 'Geo',
}

export enum ElementAttr {
  /** 火 */ Pyro    = 1,
  /** 风 */ Anemo   = 2,
  /** 岩 */ Geo     = 3,
  /** 雷 */ Electro = 5,
  /** 水 */ Hydro   = 6,
  /** 冰 */ Cryo    = 7,
}

/**
 * 武器类型
 */
export enum WeaponType {
  /** 单手剑 */   Sword = 1,
  /** 法器 */     Catalyst = 10,
  /** 双手剑 */   Claymore = 11,
  /** 弓 */       Bow = 12,
  /** 长柄武器 */ Polearm = 13,
}

/**
 * 圣遗物位置
 */
export enum ReliquaryPosition {
  /** 生之花 */ Flower = 1,
  /** 死之羽 */ Plume = 2,
  /** 时之沙 */ Sands = 3,
  /** 空之杯 */ Goblet = 4,
  /** 理之冠 */ Circlet = 5,
}

/**
 * 探索类型
 */
export enum ExplorationType {
  /** 声望 */ Reputation = 'Reputation',
  /** 供奉 */ Offering   = 'Offering',
}

/**
 * 深境螺旋
 */
export enum SpiralAbyssScheduleType {
  /** 本期 */ CURRENT = 1,
  /** 上期 */ PREVIOUS = 2,
}

export const MIHOYO_COMMUNITY_GAME_RECORDS_VERSION = 'v4.1.2-ys';
