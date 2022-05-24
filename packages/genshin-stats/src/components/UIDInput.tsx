import { Show, ParentProps, createEffect, Switch, Match, For, onMount, onCleanup, createSignal, createMemo } from 'solid-js';

interface UIDInputProps {
  value: string;
  id?: string;
  disabled?: boolean;
  readonly?: boolean;
  onChange?: (newValue: string) => void;
  suggestions: readonly string[];
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

  const filteredSuggestions = createMemo<readonly string[]>(prevSuggestions => {
    if (suggestAll()) {
      return props.suggestions;
    }
    if (retainSuggestions()) {
      return prevSuggestions;
    }
    const val = value();
    return props.suggestions.filter(s => String(s).includes(val));
  }, props.suggestions);

  const candidateItemIndex = createMemo(() => Math.max(0, filteredSuggestions().findIndex(s => s === value())));

  const autoSelect = (e: Event) => {
    (e.target as HTMLInputElement).select();
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

  const handleFocus = (e: FocusEvent) => {
    setSuggestAll(true);
    setRetainSuggestions(true);
    autoSelect(e);
  };

  const handleBlur = (e: FocusEvent) => {
    if (!e.relatedTarget || (e.relatedTarget as HTMLElement).className !== 'autocomplete-item') {
      emitChange();
    }
    setSuggestAll(true);
    setRetainSuggestions(true);
  };

  const handleChange = (e: Event) => {
    handleInput(e);
    emitChange();
  };

  const handleAutoComplete = (e: MouseEvent, value: string) => {
    e.preventDefault();
    setValue(value);
    (e.target as HTMLAnchorElement).blur();
    emitChange();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const candidates = filteredSuggestions();
    const index = candidateItemIndex();

    switch (e.code) {
      case 'Enter': {
        if (candidates.length) {
          setValue(candidates[index]);
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
        e.preventDefault();
        if (candidates.length) {
          let nextIndex = index + (e.code === 'ArrowDown' ? 1 : -1);
          if (nextIndex < 0) {
            nextIndex = candidates.length - 1;
          } else if (nextIndex >= candidates.length) {
            nextIndex = 0;
          }
          setRetainSuggestions(true);
          setValue(candidates[nextIndex]);
          autoSelect(e);
        }
        break;
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
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onChange={handleChange}
        disabled={props.disabled}
        readonly={props.readonly}
      />

      <div class="autocomplete-results">
        <For each={filteredSuggestions()}>{(item, index) => (
          <a href="#" class="autocomplete-item" aria-selected={index() === candidateItemIndex()} onClick={e => handleAutoComplete(e, item)}>{item}</a>
        )}</For>
      </div>
    </div>
  );
}
