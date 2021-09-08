import { For, PropsWithChildren } from 'solid-js';
import { COLUMN_NAME, GROUPABLE_COLUMNS, SORTABLE_COLUMNS } from '../store/constants';
import { store, setState } from '../store/roles';
import { Column, SortableColumn, GroupableColumn, SORT, SortConfigItem } from '../store/typings';
import '../styles/role-options.scss';

export default (props: PropsWithChildren) => {
  const handleGroupingChange = (e: Event) => {
    setState({ grouping: (e.target as HTMLSelectElement).value as ('' | GroupableColumn) });
  };

  const toggleGroupingSort = () => {
    setState({ grouping_sort: invertSort(store.grouping_sort) });
  };

  const handleColumnSorting = (e: MouseEvent) => {
    const column = (e.target as HTMLElement).dataset.column;
    for (let i = 0, l = store.sorting.length; i < l; ++i) {
      const item = store.sorting[i] as SortConfigItem;
      if (item.column === column) {
        setState('sorting', i, 'sort', invertSort(item.sort));
        break;
      }
    }
  };

  let dragEl: HTMLElement | null;
  let startX: number;
  const handleDragStart = (e: DragEvent) => {
    const column = (e.target as HTMLElement).dataset.column;
    if (column) {
      dragEl = e.target as HTMLElement;
      startX = e.clientX;
      e.dataTransfer!.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (dragEl && (e.target as HTMLElement).dataset.column) {
      e.dataTransfer!.effectAllowed = 'move';
    }
  };

  const handleDrop = (e: DragEvent) => {
    const target = e.target as HTMLElement;
    e.stopPropagation();

    if (dragEl && dragEl !== target) {
      const oldIndex = findIndexInDom(dragEl);
      let newIndex = findIndexInDom(target);

      if (e.clientX > startX) {
        if (e.offsetX < target.clientWidth * 0.25 && dragEl.nextElementSibling !== target) {
          newIndex--;
        }
      } else {
        if (e.offsetX > target.clientWidth * 0.75 && dragEl !== target.nextElementSibling) {
          newIndex++;
        }
      }

      const list = store.sorting.slice() as SortConfigItem[];
      list.splice(newIndex, 0, list.splice(oldIndex, 1)[0]);
      setState({ sorting: list });
    }

    dragEl = null;
  };

  return (
    <div class="group-sort-config">
      <label for="group-type">分组</label>
      <select class="form-select" id="group-type" value={store.grouping as string} onChange={handleGroupingChange}>
        <option value="">N/A</option>
        <For each={GROUPABLE_COLUMNS}>
          {item => (<option value={item as string}>{COLUMN_NAME[item as Column]}</option>)}
        </For>
      </select>

      <button type="button" class="btn btn-sort" title="排序"
        data-sort={store.grouping_sort}
        disabled={!store.grouping || !sortable(store.grouping)}
        onClick={toggleGroupingSort}
      />

      <label>排序</label>
      <div class="BtnGroup sort-config-list" onClick={handleColumnSorting} onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}>
        <For each={store.sorting}>
          {item => (<button type="button" class="BtnGroup-item btn" data-column={item.column} data-sort={item.sort} draggable={true} disabled={item.column === store.grouping}>{COLUMN_NAME[item.column as Column]}</button>)}
        </For>
      </div>

      <label><input type="checkbox" checked={store.show_not_owned} onChange={() => setState({ show_not_owned: !store.show_not_owned })} />显示尚未拥有的角色</label>
    </div>
  );
}

function sortable(column: unknown): column is SortableColumn {
  return SORTABLE_COLUMNS.includes(column as any);
}

function invertSort(sort: SORT): SORT {
  switch (sort) {
    case SORT.ASC: return SORT.DESC;
    case SORT.DESC: return SORT.ASC;
  }
  return SORT.NONE;
}

function findIndexInDom(element: Element): number {
  const list = element.parentElement?.children;
  if (list) {
    for (let i = 0; i < list.length; ++i) {
      if (list[i] === element) return i;
    }
  }
  return -1;
}
