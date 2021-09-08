export type Column = 'id' | 'level' | 'fetter' | 'rarity' | 'element' | 'release_date' | 'actived_constellation_num';
export type SortableColumn = Omit<Column, 'element'>;
export type GroupableColumn = Omit<Column, 'id'>;

export const COLUMN_NAME: Record<Column, string> = {
  id: 'ID',
  level: '等级',
  fetter: '好感',
  rarity: '星级品质',
  element: '元素',
  release_date: '发布日期',
  actived_constellation_num: '命座',
};

export const GROUPABLE_COLUMNS: readonly GroupableColumn[] = [
  'fetter',
  'level',
  'rarity',
  'element',
  'actived_constellation_num',
  'release_date',
];

export const SORTABLE_COLUMNS: readonly SortableColumn[] = [
  'fetter',
  'level',
  'id',
  'rarity',
  'actived_constellation_num',
  'release_date',
];
