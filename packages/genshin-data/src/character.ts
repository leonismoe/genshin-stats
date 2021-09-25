import type { RoleItem } from './typings';

export function isPlayer(id: number | string): boolean;
export function isPlayer(role: RoleItem): boolean;
export function isPlayer(role: RoleItem | number | string): boolean {
  const type = typeof role;
  if (type == 'number' || type == 'string') {
    return role == 10000005 || role == 10000007;
  }

  return isPlayer((role as RoleItem).id);
}
