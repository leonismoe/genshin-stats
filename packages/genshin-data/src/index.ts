import type {
  RoleItem,
  GenshinElementType,
  GenshinWeaponType,
} from '../typings';

export type {
  RoleItem,
  GenshinElementType,
  GenshinWeaponType,
}

export function isPlayer(id: number | string): boolean;
export function isPlayer(role: RoleItem): boolean;
export function isPlayer(role: RoleItem | number | string): boolean {
  const type = typeof role;
  if (type == 'number' || type == 'string') {
    return role == 10000005 || role == 10000007;
  }

  return isPlayer((role as RoleItem).id);
}


export function isValidCnUid(uid: number | string): boolean {
  return /^[15]\d{8}$/.test(uid + '');
}

export function isValidOsUid(uid: number | string): boolean {
  return /^[6789]\d{8}$/.test(uid + '');
}

export function isValidUid(uid: number | string): boolean {
  return /^[156789]\d{8}$/.test(uid + '');
}


export function getServerRegionByUid(uid: number | string): string {
  switch ((uid + '').charAt(0)) {
    case '1': return 'cn_gf01';
    case '5': return 'cn_qd01';
    case '6': return 'os_usa';
    case '7': return 'os_euro';
    case '8': return 'os_asia';
    case '9': return 'os_cht';
    default: return '';
  }
}
