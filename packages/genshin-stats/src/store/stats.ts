import { createMemo, createResource, createRoot } from 'solid-js';
import { createStore } from 'solid-js/store';
import { isPlayer, RoleItem } from '@mihoyo-kit/genshin-data';
import { getGenshinGameStats, getPlayerCharacterDetails, getSpiralAbyssData } from '@mihoyo-kit/genshin-api';
import { GameStats, Character as GenshinCharacter, CharacterDetail, SpiralAbyssData, SpiralAbyssScheduleType, CharacterRarity } from '@mihoyo-kit/genshin-api/typings';
import { show as showToast } from '../utils/toast';
import { store as globalStore, submitSignal } from './global';
import { store as roleStore, GENSHIN_ROLES, GENSHIN_ROLE_MAPPING, addRoleData, saveRoleDataDb } from './roles';
import { SORT, GroupableColumn, SortConfigItem } from './typings';

export interface GenshinGameStats extends GameStats {
  avatars: ExtendedGenshinRole[];
}
export interface ExtendedGenshinRole extends GenshinCharacter {
  release_date: string;
  special_rarity: number;
}

export interface RoleGroup {
  name: string;
  value: number | string;
  roles: ExtendedGenshinRole[];
}
interface RoleGroupListCache {
  roles: readonly ExtendedGenshinRole[];
  grouping: GroupableColumn;
  grouping_sort: SORT;
  serialized_sorting: string;
};
type RoleGroupListWithCache = Array<RoleGroup> & RoleGroupListCache;

function createStatStore() {
  const [stats] = createResource<GenshinGameStats | void, typeof submitSignal>(submitSignal, (args, prev) => {
    return getGenshinGameStats(globalStore.uid).then(data => {
      const unknown_roles: RoleItem[] = [];

      for (const role of (data.avatars as ExtendedGenshinRole[])) {
        let data = GENSHIN_ROLE_MAPPING[role.id];
        if (data) {
          role.release_date = data.release_date;

        } else if (isPlayer(role.id)) {
          role.fetter = NaN;
          role.release_date = '20200915';

        } else {
          const data = addRoleData({ ...role });
          unknown_roles.push(data);
          role.release_date = data.release_date;
        }

        role.special_rarity = 0;
        if (role.rarity > 10) {
          role.special_rarity = role.rarity;
          role.rarity %= 10;
        }
      }

      if (unknown_roles.length) {
        saveRoleDataDb(unknown_roles);
      }

      return data as GenshinGameStats;

    }, error => {
      showToast(error.message, { type: 'error' });
    });
  });

  const [details] = createResource<readonly CharacterDetail[] | void | undefined, any>(() => [stats.loading, stats()], ([loading, stats]: [boolean, GenshinGameStats], prev) => {
    if (!loading && stats) {
      return getPlayerCharacterDetails(globalStore.uid, stats.avatars).catch(e => {
        console.error(e);
      });

    } else {
      return Promise.resolve();
    }
  });

  const [abyss] = createResource<[SpiralAbyssData, SpiralAbyssData] | void | undefined, any>(() => [stats.loading, stats()], ([loading, stats]: [boolean, GenshinGameStats], prev) => {
    if (!loading && stats) {
      return Promise.all([
        getSpiralAbyssData(globalStore.uid, SpiralAbyssScheduleType.CURRENT),
        getSpiralAbyssData(globalStore.uid, SpiralAbyssScheduleType.PREVIOUS),
      ]);

    } else {
      return Promise.resolve();
    }
  });

  let roles: () => readonly ExtendedGenshinRole[] = () => [];
  let groups = (() => []) as unknown as () => RoleGroupListWithCache;
  let detailMap: () => Record<string | number, CharacterDetail | undefined> = () => ({});
  let activeAbyss: () => SpiralAbyssData | void = () => {};
  const [state, setState] = createStore({
    get loading() {
      return stats.loading;
    },
    get stats() {
      return stats();
    },
    get roles() {
      return roles();
    },
    get groups() {
      return groups();
    },
    get details() {
      return details();
    },
    get detailMap() {
      return detailMap();
    },
    get abysses() {
      return abyss();
    },
    get isAbyssLoading() {
      return abyss.loading;
    },
    get activeAbyss() {
      return activeAbyss();
    },
    abyssIndex: 0,
  });

  roles = createMemo(() => {
    const stats = state.stats;
    const roles = stats ? stats.avatars.slice() : [];

    if (roleStore.show_not_owned) {
      const owned = Object.create(null);
      for (const role of roles) {
        owned[role.id] = role;
      }

      const today = (new Date()).toISOString().slice(0, 10).replace(/-/g, '');
      for (const role of GENSHIN_ROLES) {
        if (role.id && !isPlayer(role.id) && !owned[role.id] && role.release_date && role.release_date <= today) {
          roles.push({
            id: role.id,
            name: role.name.chs,
            element: role.vision,
            rarity: role.rarity % 10 as CharacterRarity,
            special_rarity: role.rarity > 10 ? role.rarity : 0,
            level: NaN,
            fetter: NaN,
            actived_constellation_num: NaN,
            release_date: role.release_date,
            image: `https://upload-bbs.mihoyo.com/game_record/genshin/character_icon/UI_AvatarIcon_${role.codename}.png`,
          });
        }
      }
    }

    return roles;
  });

  detailMap = createMemo(() => {
    const map: Record<string | number, CharacterDetail> = Object.create(null);
    const roles = state.details;
    if (roles) {
      for (const role of roles) {
        map[role.id] = role;
      }
    }
    return map;
  });

  groups = createMemo<RoleGroupListWithCache>(prev => {
    const roles = state.roles;
    if (!roles.length) {
      return [] as unknown as RoleGroupListWithCache;
    }

    let groups: RoleGroupListWithCache | undefined;
    if (prev) {
      let force_resort_roles = false;
      if (prev.roles != roles || prev.grouping != roleStore.grouping) {
        groups = groupRoles(roles, roleStore.grouping, roleStore.grouping_sort) as unknown as RoleGroupListWithCache;
        force_resort_roles = true;

      } else if (prev.grouping_sort != roleStore.grouping_sort) {
        groups = sortGroups(prev.slice(), roleStore.grouping_sort) as RoleGroupListWithCache;
      }

      if (force_resort_roles || prev.serialized_sorting != roleStore.serialized_sorting) {
        groups = groups || prev.slice() as unknown as RoleGroupListWithCache;
        for (let i = 0; i < groups.length; ++i) {
          const { name, value, roles } = groups[i];
          groups[i] = { name, value, roles: sortRoles(roles, roleStore.sorting) };
        }
      }
    }

    if (groups) {
      groups.roles = roles;
      groups.grouping = roleStore.grouping;
      groups.grouping_sort = roleStore.grouping_sort;
      groups.serialized_sorting = roleStore.serialized_sorting;
      return groups;
    }

    return prev;
  }, [] as unknown as RoleGroupListWithCache);

  activeAbyss = createMemo(() => {
    return state.abysses?.[state.abyssIndex];
  });

  return [state, setState] as [typeof state, typeof setState];
}

export const [store, setState] = createRoot(createStatStore);
export default store;

function groupRoles(roles: readonly ExtendedGenshinRole[], type: GroupableColumn, order: SORT) {
  const groups: RoleGroup[] = [];

  switch (type) {
    case 'fetter':
    case 'rarity':
    case 'actived_constellation_num':
    {
      const map: Record<number | 'NaN', RoleGroup> = Object.create(null);
      for (const role of roles) {
        const value = +role[type as keyof ExtendedGenshinRole];
        if (!map[value]) {
          map[value] = { name: '' + value, value, roles: [] };
          groups.push(map[value]);
        }
        map[value].roles.push(role);
      }

      if (map.NaN) {
        map.NaN.name = roleStore.show_not_owned ? '规格外或未拥有' : '规格外';
        map.NaN.value = NaN;

        groups.splice(groups.indexOf(map.NaN), 1);
        groups.push(map.NaN);
      }
      break;
    }

    case 'level':
    {
      const map: Record<number | 'NaN', RoleGroup> = {
        0: { name: '1-10',  value: 0, roles: [] },
        1: { name: '11-20', value: 1, roles: [] },
        2: { name: '21-30', value: 2, roles: [] },
        3: { name: '31-40', value: 3, roles: [] },
        4: { name: '41-50', value: 4, roles: [] },
        5: { name: '51-60', value: 5, roles: [] },
        6: { name: '61-70', value: 6, roles: [] },
        7: { name: '71-80', value: 7, roles: [] },
        8: { name: '81-90', value: 8, roles: [] },
        NaN: { name: '未拥有', value: NaN, roles: [] },
      };

      groups.push(map[0], map[1], map[2], map[3], map[4], map[5], map[6], map[7], map[8], map.NaN);
      for (const role of roles) {
        map[Math.floor((+role.level - 1) / 10)].roles.push(role);
      }

      for (let i = 0; i < groups.length;) {
        if (groups[i].roles.length === 0) {
          groups.splice(i, 1);
        } else {
          ++i;
        }
      }
      break;
    }

    case 'element':
    {
      const map: Record<string, RoleGroup> = {
        Pyro:    { name: '火', roles: [], value: 'pyro' },
        Hydro:   { name: '水', roles: [], value: 'hydro' },
        Anemo:   { name: '风', roles: [], value: 'anemo' },
        Electro: { name: '雷', roles: [], value: 'electro' },
        Dendro:  { name: '草', roles: [], value: 'dendro' },
        Cryo:    { name: '冰', roles: [], value: 'cryo' },
        Geo:     { name: '岩', roles: [], value: 'geo' },
        None:    { name: '无', roles: [], value: 'none' },
      };

      groups.push(map.Pyro, map.Hydro, map.Anemo, map.Electro, map.Dendro, map.Cryo, map.Geo, map.None);

      for (const role of roles) {
        map[role.element].roles.push(role);
      }

      if (map.None.roles.length === 0) {
        groups.pop();
      }

      break;
    }

    case 'release_date':
    {
      const map: Record<string, RoleGroup> = Object.create(null);
      for (const role of roles) {
        const date = role.release_date;
        if (!map[date]) {
          const name = date ? `${date.substr(0, 4)}-${date.substr(4, 2)}-${date.substr(6, 2)}` : '未知';
          map[date] = { name, value: date, roles: [] };
          groups.push(map[date]);
        }
        map[date].roles.push(role);
      }
      break;
    }

    default:
    {
      groups.push({ name: '', value: '', roles: roles.slice() });
      break;
    }
  }

  if (type && type !== 'element') {
    sortGroups(groups, order);
  }
  return groups;
}

function sortGroups(groups: RoleGroup[], order: SORT) {
  if (groups.length > 1 && groups[0].value != null) {
    if (order === SORT.ASC) {
      groups.sort((a, b) => typeof a.value === 'string' ? a.value.localeCompare(b.value as string) : (a.value - (b.value as number)));
    } else if (order === SORT.DESC) {
      groups.sort((a, b) => typeof b.value === 'string' ? b.value.localeCompare(a.value as string) : (b.value - (a.value as number)));
    }
  }
  return groups;
}

function sortRoles(roles: ExtendedGenshinRole[], sorting: readonly SortConfigItem[]) {
  roles.sort((a, b) => {
    for (const item of sorting) {
      const colA = a[item.column as keyof ExtendedGenshinRole];
      const colB = b[item.column as keyof ExtendedGenshinRole];

      if (colA !== colB) {
        if (item.sort === SORT.ASC) {
          return typeof colA === 'string' ? colA.localeCompare(colB as string) : (colA - (colB as number));
        } else if (item.sort === SORT.DESC) {
          return typeof colB === 'string' ? colB.localeCompare(colA as string) : (colB - (colA as number));
        }
      }
    }
    return 0;
  });

  return roles;
}
