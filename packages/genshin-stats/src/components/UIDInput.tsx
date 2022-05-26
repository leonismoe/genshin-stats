import { Show, ParentProps, createEffect, For, createSignal, createMemo } from 'solid-js';
import { UidItem } from '../store/typings';
import { store } from '../store/global';
import { setTarget, onPointerUp } from '../utils/emulate-click';

interface UIDInputProps {
  value: string;
  id?: string;
  disabled?: boolean;
  readonly?: boolean;
  suggestions: UidItem[];
  onChange?: (newValue: string) => void;
  onUpdateSuggestions?: (suggestions: UidItem[]) => void;
}

export default (props: ParentProps<UIDInputProps>) => {
  let $uid: HTMLInputElement | undefined;

  const [value, setValue] = createSignal<string>(props.value);
  const [suggestAll, setSuggestAll] = createSignal<boolean>(true);
  const [retainSuggestions, setRetainSuggestions] = createSignal<boolean>(false);

  createEffect<string>((oldValue) => {
    if (oldValue !== props.value) {
      setValue(props.value);
    }
    return props.value;
  }, props.value);

  const filteredSuggestions = createMemo<UidItem[]>(prevSuggestions => {
    if (suggestAll()) {
      return props.suggestions;
    }

    if (retainSuggestions()) {
      const map = Object.create(null);
      props.suggestions.forEach(item => {
        map[item[0]] = item;
      });

      const suggestions: UidItem[] = [];
      prevSuggestions.forEach(([uid]) => {
        const item = map[uid];
        if (item) {
          suggestions.push(item);
        }
      });

      return suggestions;
    }

    const val = value();
    return props.suggestions.filter(s => s[0].includes(val) || s[1].includes(val));
  }, props.suggestions);

  const candidateItemIndex = createMemo(() => Math.max(0, filteredSuggestions().findIndex(s => s[0] === value())));

  const autoSelect = (e: Event) => {
    (e.target as HTMLInputElement).select();
  };

  const preventDefault = (e: Event) => {
    e.preventDefault();
  };

  const handleInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    setSuggestAll(!value);
    setRetainSuggestions(false);
    setValue(value);
  };

  const emitChange = () => {
    if (props.onChange) {
      props.onChange(value());
    }
  };

  const handleBlur = (e: FocusEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || relatedTarget.className !== 'autocomplete-item' && relatedTarget.tagName !== 'BUTTON') {
      emitChange();
    }
    setSuggestAll(true);
    setRetainSuggestions(true);
  };

  const handleChange = (e: Event) => {
    handleInput(e);
    emitChange();
  };

  const handleAutoComplete = (value: string, e: PointerEvent) => {
    preventDefault(e);
    setValue(value);
    emitChange();
    if (document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }
  };

  const handlePointerDown = (e: PointerEvent) => {
    e.stopPropagation();
    setTarget(e.currentTarget);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const candidates = filteredSuggestions();
    const index = candidateItemIndex();

    switch (e.code) {
      case 'Enter': {
        if (candidates.length) {
          setValue(candidates[index][0]);
        }
        emitChange();

        const $target = e.target as HTMLInputElement;
        requestAnimationFrame(() => {
          if (document.activeElement === $target) {
            $target.blur();
          }
        });
        break;
      }

      case 'ArrowUp':
      case 'ArrowDown':
        preventDefault(e);
        if (candidates.length) {
          let nextIndex = index + (e.code === 'ArrowDown' ? 1 : -1);
          if (nextIndex < 0) {
            nextIndex = candidates.length - 1;
          } else if (nextIndex >= candidates.length) {
            nextIndex = 0;
          }
          setRetainSuggestions(true);
          setValue(candidates[nextIndex][0]);
          autoSelect(e);
        }
        break;
    }
  };

  const handleNameEdit = (item: UidItem, e: Event) => {
    e.stopPropagation();
    $uid!.focus();
    const index = props.suggestions.indexOf(item);
    if (~index) {
      const suggestions = props.suggestions.slice();
      const newName = prompt(`修改 ${item[0]} 的备注 (留空表示清除备注):`, item[1]);
      if (newName !== null) {
        suggestions[index] = [item[0], newName];
        props.onUpdateSuggestions!(suggestions as UidItem[]);
        requestAnimationFrame(() => $uid!.focus());
      }
    }
  };

  const removeSuggestion = (item: UidItem, e: Event) => {
    e.stopPropagation();
    $uid!.focus();
    const index = props.suggestions.indexOf(item);
    if (~index) {
      let name = item[0];
      if (item[1]) {
        name += ` (${item[1]})`;
      }

      if (confirm(`确定要删除 ${name} 吗?`)) {
        const suggestions = props.suggestions.slice();
        suggestions.splice(index, 1);
        props.onUpdateSuggestions!(suggestions as UidItem[]);
        requestAnimationFrame(() => $uid!.focus());
      }
    }
  };

  return (
    <div class="autocomplete-wrapper">
      <input
        type="text"
        class="form-control input-contrast"
        id={props.id}
        ref={$uid}
        value={value()}
        onFocus={autoSelect}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onChange={handleChange}
        disabled={props.disabled}
        readonly={props.readonly}
      />

      <div class="autocomplete-results">
        <For each={filteredSuggestions()}>{(item, index) => (
          <a
            href="#"
            class="autocomplete-item"
            aria-selected={index() === candidateItemIndex()}
            onClick={preventDefault}
            onPointerDown={handlePointerDown}
            onPointerUp={e => onPointerUp(e, handleAutoComplete.bind(null, item[0]))}
          >
            <span>{item[0]}</span>
            <Show when={item[1] || item[0] === store.game_uid}>
              <small>{item[1] || '(自己)'}</small>
            </Show>
            <Show when={props.onUpdateSuggestions}>
              <ul>
                <li><button
                  class="btn-octicon"
                  title="修改备注"
                  onClick={preventDefault}
                  onPointerDown={handlePointerDown}
                  onPointerUp={e => onPointerUp(e, handleNameEdit.bind(null, item))}
                ><svg class="octicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25a1.75 1.75 0 01.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 000-.354l-1.086-1.086zM11.189 6.25L9.75 4.81l-6.286 6.287a.25.25 0 00-.064.108l-.558 1.953 1.953-.558a.249.249 0 00.108-.064l6.286-6.286z"></path></svg></button></li>
                <li><button
                  class="btn-octicon btn-octicon-danger"
                  title="删除"
                  onClick={preventDefault}
                  onPointerDown={handlePointerDown}
                  onPointerUp={e => onPointerUp(e, removeSuggestion.bind(null, item))}
                ><svg class="octicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.405 15h5.19c.9 0 1.652-.681 1.741-1.576l.66-6.6a.75.75 0 00-1.492-.149l-.66 6.6a.25.25 0 01-.249.225h-5.19a.25.25 0 01-.249-.225l-.66-6.6z"></path></svg></button></li>
              </ul>
            </Show>
          </a>
        )}</For>
      </div>
    </div>
  );
}
