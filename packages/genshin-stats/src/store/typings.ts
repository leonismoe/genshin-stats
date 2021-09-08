import type { Resource } from 'solid-js';
import type { Column, GroupableColumn, SortableColumn } from './constants';

export const enum PAGE_TYPE {
  SUMMARY = 'summary',
  ROLES = 'roles',
  ABYSS = 'abyss',
}

export interface GlobalState {
  uid: string;
  uids: string[];
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
  // stats: Resource<any>;
  // characters: Resource<any>;
  // spiral_abyss: Resource<any>;
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
