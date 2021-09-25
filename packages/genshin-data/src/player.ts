export function isValidCnUid(uid: number | string): boolean {
  return /^[125]\d{8}$/.test(uid + '');
}

export function isValidOsUid(uid: number | string): boolean {
  return /^[6789]\d{8}$/.test(uid + '');
}

export function isValidUid(uid: number | string): boolean {
  return /^[1256789]\d{8}$/.test(uid + '');
}

export function getServerRegionByUid(uid: number | string): string {
  switch ((uid + '').charAt(0)) {
    case '1':
    case '2': return 'cn_gf01';
    case '5': return 'cn_qd01';
    case '6': return 'os_usa';
    case '7': return 'os_euro';
    case '8': return 'os_asia';
    case '9': return 'os_cht';
    default: return '';
  }
}
