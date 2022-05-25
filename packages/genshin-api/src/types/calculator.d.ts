import { ElementAttr, ReliquaryPosition, WeaponType } from '../constants';

export namespace Calculator {
  /** 角色 */
  export interface Avatar {
    id: number;
    name: string;
    icon: string;
    weapon_cat_id: WeaponType;
    avatar_level: number;
    element_attr_id: ElementAttr;
    max_level: number;
  }
  export interface AvatarWithLevel extends Avatar {
    level_current: number;
  }

  /** 角色详情 */
  export interface AvatarDetail {
    skill_list: SkillWithLevel[];
    weapon: WeaponWithLevel;
    reliquary_list: ReliquaryWithLevel[];
  }

  /** 角色技能 */
  export interface Skill {
    id: number;
    group_id: number;
    name: string;
    icon: string;
    max_level: number;
  }
  export interface SkillWithLevel extends Skill {
    level_current: number;
  }

  /** 武器 */
  export interface Weapon {
    id: number;
    name: string;
    icon: string;
    weapon_cat_id: WeaponType;
    weapon_level: number;
    max_level: number;
  }
  export interface WeaponWithLevel extends Weapon {
    level_current: number;
  }

  /** 圣遗物 */
  export interface Reliquary {
    id: number;
    name: string;
    icon: string;
    reliquary_cat_id: ReliquaryPosition;
    reliquary_level: number;
    max_level: number;
  }
  export interface ReliquaryWithLevel extends Reliquary {
    level_current: number;
  }
}
