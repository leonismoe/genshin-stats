import type { Column, GroupableColumn, SortableColumn } from './constants';

export const enum PAGE_TYPE {
  SUMMARY = 'summary',
  ROLES = 'roles',
  ABYSS = 'abyss',
}

export type UidItem = [uid: string, name: string];

export interface GlobalState {
  uid: string;
  uids: UidItem[];
  page: PAGE_TYPE;
  stick_header: boolean;
  stick_group_banner: boolean;
}

export interface RolePageStore {
  show_not_owned: boolean;
  grouping: '' | GroupableColumn;
  grouping_sort: SORT;
  sorting: SortConfigItem[];
  serialized_sorting: string;
}

export const enum SORT {
  NONE = '',
  ASC = 'asc',
  DESC = 'desc',
}

export interface SortConfigItem {
  column: SortableColumn;
  sort: SORT;
}

export { Column, GroupableColumn, SortableColumn }
