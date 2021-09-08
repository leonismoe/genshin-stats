import { Show, PropsWithChildren, createEffect, Switch, Match, For, onMount, onCleanup } from 'solid-js';
import { store, setState, submit } from '../store/global';
import { PAGE_TYPE } from '../store/typings';
import { show as showToast } from '../utils/toast';
import { set as setGlobalCssVariable } from '../utils/global-css-variables';
import statStore from '../store/stats';
import roleStore from '../store/roles';
import RoleOptions from './RoleOptions';
import { SpiralAbyssHeader } from './SpiralAbyss';
import Settings from './Settings';
import '../styles/header.scss';

export default (props: PropsWithChildren) => {
  let $header: HTMLElement | undefined;
  let $uid: HTMLInputElement | undefined;

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    try {
      submit($uid!.value);
    } catch (e) {
      const msg = e.message;
      showToast(msg, { type: 'error' });
    }
  };

  const autoSelect = (e: FocusEvent) => {
    (e.target as HTMLInputElement).select();
  };

  const handleAutoComplete = (e: MouseEvent, value: string) => {
    e.preventDefault();
    $uid!.value = value;
    (e.target as HTMLAnchorElement).blur();
  };

  const syncHeaderHeight = () => {
    const page = store.page;
    const stick_header = store.stick_header;

    requestAnimationFrame(() => {
      setGlobalCssVariable('--header-height', page ? `${$header!.clientHeight}px` : 0);
      setGlobalCssVariable('--header-height-when-stick', page && stick_header ? `${$header!.clientHeight}px` : 0);
    });
  }

  createEffect(syncHeaderHeight);

  onMount(() => {
    window.addEventListener('resize', syncHeaderHeight);
  });
  onCleanup(() => {
    window.removeEventListener('resize', syncHeaderHeight);
  });

  return (
    <header
      ref={$header}
      classList={{
        sticky: store.stick_header,
        'box-shadow-none': store.stick_header && store.stick_group_banner && (store.page == PAGE_TYPE.ROLES && !!roleStore.grouping || store.page == PAGE_TYPE.ABYSS || store.page == PAGE_TYPE.SUMMARY),
      }}
    >
      <div class="container">
        <nav class="UnderlineNav UnderlineNav--right" classList={{ 'box-shadow-none': store.page == PAGE_TYPE.SUMMARY && store.stick_header && !store.stick_group_banner }}>
          <div class="UnderlineNav-actions">
            <form onSubmit={handleSubmit}>
              <label for="input-uid">UID</label>
              <div class="autocomplete-wrapper">
                <input type="text" class="form-control input-contrast" id="input-uid" ref={$uid} onFocus={autoSelect} value={store.uid} disabled={statStore.loading} />
                <div class="autocomplete-results">
                  <For each={store.uids}>{item => (
                    <a href="#" class="autocomplete-item" onClick={e => handleAutoComplete(e, item)}>{item}</a>
                  )}</For>
                </div>
              </div>
              <button type="submit" class="btn btn-primary btn-submit" disabled={statStore.loading}>查询</button>
            </form>

            <Settings />

            <label><input type="checkbox" checked={store.stick_header} onChange={() => setState({ stick_header: !store.stick_header })} />固定页眉</label>
            <label><input type="checkbox" checked={store.stick_group_banner} onChange={() => setState({ stick_group_banner: !store.stick_group_banner })} />固定组别</label>
          </div>

          <div class="UnderlineNav-body">
            <a class="UnderlineNav-item" href={`#${PAGE_TYPE.SUMMARY}`} onClick={switchPage(PAGE_TYPE.SUMMARY)} aria-current={pageActive(PAGE_TYPE.SUMMARY)} draggable={false}>总览</a>
            <a class="UnderlineNav-item" href={`#${PAGE_TYPE.ROLES}`} onClick={switchPage(PAGE_TYPE.ROLES)} aria-current={pageActive(PAGE_TYPE.ROLES)} draggable={false}>角色</a>
            <a class="UnderlineNav-item" href={`#${PAGE_TYPE.ABYSS}`} onClick={switchPage(PAGE_TYPE.ABYSS)} aria-current={pageActive(PAGE_TYPE.ABYSS)} draggable={false}>深渊</a>
          </div>
        </nav>

        <Switch>
          <Match when={store.page === PAGE_TYPE.ROLES}>
            <RoleOptions />
          </Match>
          <Match when={store.page === PAGE_TYPE.ABYSS}>
            <SpiralAbyssHeader />
          </Match>
        </Switch>

        {props.children}
      </div>
    </header>
  );
}

function pageActive(page: PAGE_TYPE) {
  return store.page === page ? 'page' : undefined;
}

function switchPage(page: PAGE_TYPE) {
  return (e: MouseEvent) => {
    e.preventDefault();
    setState({ page });
  };
}
