import { ParentProps, createEffect, Switch, Match, For, onMount, onCleanup, createSignal } from 'solid-js';
import { store, setState as updateGlobalState, submit } from '../store/global';
import { PAGE_TYPE } from '../store/typings';
import { show as showToast } from '../utils/toast';
import { set as setGlobalCssVariable } from '../utils/global-css-variables';
import statStore from '../store/stats';
import roleStore from '../store/roles';
import RoleOptions from './RoleOptions';
import { SpiralAbyssHeader } from './SpiralAbyss';
import Settings from './Settings';
import UIDInput from './UIDInput';
import '../styles/header.scss';

export default (props: ParentProps) => {
  let $header: HTMLElement | undefined;

  const [uid, setUid] = createSignal<string>(store.uid);
  createEffect(oldUid => {
    if (oldUid !== store.uid) {
      setUid(store.uid);
    }
  }, store.uid);

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    try {
      submit(uid());
    } catch (e) {
      const msg = (e as Error).message;
      showToast(msg, { type: 'error' });
    }
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
              <UIDInput id="input-uid" value={uid()} suggestions={store.uids} onChange={setUid} onUpdateSuggestions={uids => updateGlobalState({ uids })} />
              <button type="submit" class="btn btn-primary btn-submit" disabled={statStore.loading}>查询</button>
            </form>

            <Settings />

            <label><input type="checkbox" checked={store.stick_header} onChange={() => updateGlobalState({ stick_header: !store.stick_header })} />固定页眉</label>
            <label><input type="checkbox" checked={store.stick_group_banner} onChange={() => updateGlobalState({ stick_group_banner: !store.stick_group_banner })} />固定组别</label>

            <a href="https://github.com/leonismoe/genshin-stats" class="github-link" title="GitHub" target="_blank"><svg class="octicons" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg></a>
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
    updateGlobalState({ page });
  };
}
