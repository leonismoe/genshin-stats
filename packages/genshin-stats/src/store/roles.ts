import type { RoleItem } from '@mihoyo-kit/genshin-data';
import type { Character as GenshinCharacter } from '@mihoyo-kit/genshin-api/lib/typings';
import { createMemo, createRoot, createEffect } from 'solid-js';
import { createStore } from 'solid-js/store';
import GENSHIN_ROLES from '@mihoyo-kit/genshin-data/data/roles.json';
import { RolePageStore, SORT, SortConfigItem } from './typings';
import { GroupableColumn, GROUPABLE_COLUMNS } from './constants';
import * as Storage from '../utils/storage';

export { GENSHIN_ROLES }
export const GENSHIN_ROLE_MAPPING: Record<number | string, RoleItem> = Object.create(null);

export function remapRoleData() {
  for (const role of GENSHIN_ROLES) {
    if (role.id) {
      GENSHIN_ROLE_MAPPING[role.id] = role;
    }
  }
}
remapRoleData();

Storage.get('roledata-db').then(data => {
  if (data) {
    const db = JSON.parse(data) as RoleItem[];
    for (let i = 0; i < db.length;) {
      const item = db[i];
      if (item && item.id && !GENSHIN_ROLE_MAPPING[item.id]) {
        const data = GENSHIN_ROLES.find(role => {
          return role.name === item.name || role.name.chs === item.name.chs;
        });

        if (data) {
          data.id = item.id;
          data.vision = item.vision;
          data.rarity = item.rarity;
          data.codename = item.codename;
          data.name = item.name;
        } else {
          (GENSHIN_ROLES as RoleItem[]).push(item);
        }

        i++;

      } else {
        db.splice(i, 1);
      }
    }

    if (db.length) {
      Storage.set('roledata-db', JSON.stringify(db));
    } else {
      Storage.remove('roledata-db');
    }
  }
});

export function addRoleData(role: GenshinCharacter): RoleItem {
  // https://upload-bbs.mihoyo.com/game_record/genshin/character_icon/UI_AvatarIcon_CODENAME.png
  const codename = role.image.slice(79, -4);
  let data = GENSHIN_ROLES.find(item => {
    return item.codename === codename || item.name.chs === role.name;
  });

  if (data) {
    data.id = role.id;
    data.vision = role.element;
    data.rarity = role.rarity;
    data.codename = codename;
    data.name = { chs: role.name, en: codename } as any;

  } else {
    data = {
      id: role.id,
      codename: codename,
      vision: role.element as any,
      weapon: '' as any,
      rarity: role.rarity,
      name: { chs: role.name, en: codename } as any,
      assoc: '',
      birthday: '',
      release_date: '',
    };

    (GENSHIN_ROLES as RoleItem[]).push(data);
  }

  remapRoleData();

  return data;
}

export async function saveRoleDataDb(roles: RoleItem[]): Promise<void> {
  let data = roles;
  const old = await Storage.get('roledata-db');
  if (old) {
    try {
      data = JSON.parse(old) as RoleItem[];
      for (const role of roles) {
        if (!data.find(v => v.id === role.id)) {
          data.push(role);
        }
      }
    } catch (e) {
      // DO NOTHING
    }
  }
  return Storage.set('roledata-db', JSON.stringify(data));
}

const DEFAULT_SORTING = [
  { column: 'fetter', sort: SORT.DESC },
  { column: 'level', sort: SORT.DESC },
  { column: 'id', sort: SORT.ASC },
  { column: 'rarity', sort: SORT.DESC },
  { column: 'actived_constellation_num', sort: SORT.DESC },
  { column: 'release_date', sort: SORT.DESC },
];

function createRolePageStore() {
  let serialized_sorting: () => string = () => '';
  const data: RolePageStore = {
    show_not_owned: false,
    grouping: '',
    grouping_sort: SORT.ASC,
    sorting: DEFAULT_SORTING,
    get serialized_sorting() {
      return serialized_sorting();
    },
  };

  const [store, setState] = createStore<RolePageStore>(data);

  serialized_sorting = createMemo(() => {
    const fragments = [];
    for (const item of store.sorting) {
      fragments.push(`${item.column},${item.sort}`);
    }
    return fragments.join('|');
  });

  autoSyncCache(store);
  getUserConfig().then(config => config && setState(config));

  return [store, setState] as [typeof store, typeof setState];
}

export const [store, setState] = createRoot(createRolePageStore);
export default store;


function autoSyncCache(store: RolePageStore) {
  createEffect(() => {
    const value = `${store.grouping},${store.grouping_sort}`;
    Storage.set('grouping', value);
  });

  createEffect(() => {
    const value = '' + store.show_not_owned;
    Storage.set('show_not_owned', value);
  });

  createEffect(() => {
    const value = store.serialized_sorting;
    Storage.set('sorting', value);
  });
}

async function getUserConfig() {
  const config = await Storage.get(['show_not_owned', 'grouping', 'sorting']);
  if (!config) {
    return;
  }

  let grouping_column: GroupableColumn = '';
  let grouping_sort = SORT.ASC;
  if (config.grouping) {
    const [column, sort] = config.grouping.split(',');
    if (GROUPABLE_COLUMNS.includes(column) && (sort == SORT.ASC || sort == SORT.DESC)) {
      grouping_column = column;
      grouping_sort = sort;
    }
  }

  return {
    show_not_owned: config.show_not_owned === 'true',
    grouping: grouping_column,
    grouping_sort: grouping_sort,
    sorting: deserializeSorting(config.sorting) || JSON.parse(JSON.stringify(DEFAULT_SORTING)) as SortConfigItem[],
  };
}

function deserializeSorting(config: string | null | undefined): SortConfigItem[] | undefined {
  if (!config) {
    return;
  }

  const sorting: SortConfigItem[] = [];
  const visited: Record<string, boolean> = {};
  for (const item of config.split('|')) {
    const [column, sort] = item.split(',');
    if (sort === 'asc' || sort === 'desc') {
      visited[column] = true;
      sorting.push({ column, sort } as SortConfigItem);
    } else {
      return;
    }
  }

  for (const item of DEFAULT_SORTING) {
    if (!visited[item.column]) {
      return;
    }
  }

  return sorting;
}
