export type GenshinElementType = 'Pyro' | 'Hydro' | 'Anemo' | 'Electro' | 'Dendro' | 'Cryo' | 'Geo' | 'None';
export type GenshinWeaponType = 'Bow' | 'Catalyst' | 'Claymore' | 'Polearm' | 'Sword';

export interface I18nText {
  chs: string;
  cht: string;
  de: string;
  en: string;
  es: string;
  fr: string;
  id: string;
  jp: string;
  kr: string;
  pt: string;
  ru: string;
  th: string;
  vi: string;
}

export interface RoleItem {
  id: number;
  codename: string;
  name: I18nText;
  rarity: 4 | 5 | 105;
  vision: GenshinElementType;
  assoc: string;
  weapon: GenshinWeaponType;
  birthday: string;
  release_date: string;
  avatar: string;
}
