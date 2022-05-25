import type { Element, ExplorationType, ReliquaryPosition, SpiralAbyssScheduleType, WeaponType } from '../constants';

export type CharacterRarity = 4 | 5 | 105;
export interface Character {
  /**  */         id: number;
  /** 头像 */     image: string;
  /** 姓名 */     name: string;
  /** 元素 */     element: `${Element}`;
  /** 好感 */     fetter: number;
  /** 等级 */     level: number;
  /** 星级 */     rarity: CharacterRarity;
  /** 命座 */     actived_constellation_num: number;
  /** 预览图 */   card_image: string;
  /** 公开展示 */ is_chosen: boolean;
}

export interface ExplorationData {
  exploration_percentage: number; // 千分数
  icon: string;
  id: number;
  level: number;
  name: string;
}

export interface CityExploration extends ExplorationData {}

export interface WorldExploration extends ExplorationData {
  type: `${ExplorationType}`;
  offerings: Array<{ name: string, level: number, icon: string }>;
  background_image: string;
  cover: string;
  inner_icon: string;
  map_url: string;
  parent_id: number;
  strategy_url: string;
}

export interface Home {
  /** 洞天仙力图标 */ comfort_level_icon: string;
  /** 洞天仙力等阶 */ comfort_level_name: string;
  /** 最高洞天仙力 */ comfort_num: number;
  /** 洞天背景图 */   icon: string;
  /** 获得摆设数 */   item_num: number;
  /** 信任等阶 */     level: number;
  /** 洞天形态 */     name: string;
  /** 历史访客数 */   visit_num: number;
}

export interface Statistics {
  /** 活跃天数 */          active_day_number: number;
  /** 成就达成数 */        achievement_number: number;
  /**  */                  win_rate: number;
  /** 风神瞳 */            anemoculus_number: number;
  /** 岩神瞳 */            geoculus_number: number;
  /** 获得角色数 */        avatar_number: number;
  /** 解锁传送点 */        way_point_number: number;
  /** 解锁秘境 */          domain_number: number;
  /** 深境螺旋 最深到达 */ spiral_abyss: string;
  /** 珍贵宝箱数 */        precious_chest_number: number;
  /** 华丽宝箱数 */        luxurious_chest_number: number;
  /** 精致宝箱数 */        exquisite_chest_number: number;
  /** 普通宝箱数 */        common_chest_number: number;
  /** 雷神瞳 */            electroculus_number: number;
  /** 奇馈宝箱数 */        magic_chest_number: number;
}

/**
 * 原神游戏数据总览
 */
export interface GameStats {
  /**  */         role: unknown;
  /** 角色列表 */ avatars: Character[];
  /** 游戏统计 */ stats: Statistics;
  /** 主城探索 */ city_explorations: CityExploration[];
  /** 世界探索 */ world_explorations: WorldExploration[];
  /** 壶中洞天 */ homes: Home[];
}

/**
 * 深境螺旋战绩
 */
export interface SpiralAbyssData {
  /** 最强一击 */         damage_rank: SpiralAbyssRankItem[];
  /** 击破数 */           defeat_rank: SpiralAbyssRankItem[];
  /** 深渊结束时间 */     end_time: string; // 单位秒
  /** 元素爆发次数 */     energy_skill_rank: SpiralAbyssRankItem[];
  /** 挑战数据 */         floors: SpiralAbyssFloorData[];
  /** 是否解锁 */         is_unlock: boolean;
  /** 最深抵达 */         max_floor: string;
  /** 元素战技释放次数 */ normal_skill_rank: SpiralAbyssRankItem[];
  /** 角色出战次数 */     reveal_rank: SpiralAbyssRankItem[];
  /** 期数 */             schedule_id: number;
  /** 深渊开始时间 */     start_time: string; // 单位秒
  /** 最多承受伤害 */     take_damage_rank: SpiralAbyssRankItem[];
  /** 战斗次数 */         total_battle_times: number;
  /** 所得总星数 */       total_star: number;
  /** 通关次数 */         total_win_times: number;
}

export interface SpiralAbyssRankItem {
  /** 头像 */ avatar_icon: string;
  /** 角色 */ avatar_id: number;
  /** 星级 */ rarity: number;
  /** 数值 */ value: number;
}

/**
 * 深境螺旋单层数据
 */
export interface SpiralAbyssFloorData {
  /**  */         icon: string;
  /** 层数 */     index: number;
  /** 是否解锁 */ is_unlock: boolean;
  /** 挑战数据 */ levels: SpiralAbyssFloorLevelData[];
  /** 最大星数 */ max_star: number;
  /** 结算时间 */ settle_time: string;
  /** 实际星数 */ star: number;
}

/**
 * 深境螺旋单层单间数据
 */
export interface SpiralAbyssFloorLevelData {
  /** 战斗 */   battles: SpiralAbyssBattle[];
  /** 第几间 */ index: number;
  /** 满星数 */ max_star: number;
  /** 星数 */   star: number;
}

export interface SpiralAbyssBattle {
  /** 角色 */ avatars: SpiralAbyssCharacter[];
  /** 编队 */ index: number;
  /** 时间 */ timestamp: string; // 单位秒
}

export interface SpiralAbyssCharacter {
  /** 头像 */ icon: string;
  /**  */     id: number;
  /** 等级 */ level: number;
  /** 星级 */ rarity: number;
}

/**
 * 原神角色详情
 */
export interface CharacterDetail {
  /**  */           id: number;
  /** 立绘 */       image: string;
  /** 头像 */       icon: string;
  /** 姓名 */       name: string;
  /** 元素 */       element: `${Element}`;
  /** 好感 */       fetter: number;
  /** 等级 */       level: number;
  /** 星级 */       rarity: CharacterRarity;
  /** 武器 */       weapon: Weapon;
  /** 圣遗物 */     reliquaries: Reliquary[];
  /** 命座详情 */   constellations: Constellation[];
  /** 已激活命座 */ actived_constellation_num: number;
  /** 衣装 */       costumes: Costume[];
}

export interface Costume {
  /** */      id: number;
  /** 名称 */ name: string;
  /** 立绘 */ icon: string;
}

/**
 * 原神武器
 */
export type WeaponRarity = 3 | 4 | 5;
export interface Weapon {
  /**  */         id: number;
  /** 名称 */     name: string;
  /** 图标 */     icon: string;
  /** 武器类型 */ type: number;
  /** 星级 */     rarity: WeaponRarity;
  /** 等级 */     level: number;
  /** 突破等级 */ promote_level: number;
  /** 武器类型 */ type_name: string;
  /** 武器描述 */ desc: string;
  /** 精炼等级 */ affix_level: number;
}

/**
 * 原神圣遗物属性
 */
export type ReliquaryRarity = 1 | 2 | 3 | 4 | 5;
export interface Reliquary {
  /**  */     id: number;
  /** 名称 */ name: string;
  /** 图标 */ icon: string;
  /** 位置 */ pos: number;
  /** 星级 */ rarity: ReliquaryRarity;
  /** 等级 */ level: number;
  /** 套装 */ set: ReliquarySet;
  /** 位置 */ pos_name: string;
}

/**
 * 原神圣遗物套装
 */
export interface ReliquarySet {
  /**  */         id: number;
  /** 套装名称 */ name: string;
  /** 套装效果 */ affixes: ReliquarySetEffect[];
}

export interface ReliquarySetEffect {
  /** 激活件数 */ activation_number: number;
  /** 效果描述 */ effect: string;
}

/**
 * 原神命座
 */
export interface Constellation {
  /**  */           id: number;
  /** 名称 */       name: string;
  /** 图标 */       icon: string;
  /** 命座效果 */   effect: string;
  /** 是否已激活 */ is_actived: boolean;
  /** 第几层命座 */ pos: number;
}
