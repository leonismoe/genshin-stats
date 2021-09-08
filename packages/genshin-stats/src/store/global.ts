import { createStore } from 'solid-js/store';
import { createRoot, createSignal, createEffect } from 'solid-js';
import { getUserGameRoles } from '@mihoyo-kit/api';
import { isValidUid, isValidCnUid } from '@mihoyo-kit/genshin-data';
import { GlobalState, PAGE_TYPE } from './typings';
import { show as showToast } from '../utils/toast';
import * as Storage from '../utils/storage';

function createGlobalStore() {
  const data: GlobalState = {
    uid: '',
    uids: [],
    page: PAGE_TYPE.ROLES,
    stick_header: false,
    stick_group_banner: false,
  };

  return createStore<GlobalState>(data);
}

export const [store, setState] = createGlobalStore();
export default store;

async function getUserConfig() {
  const config = await Storage.get(['uids', 'stick_header', 'stick_group_banner']);
  if (!config) {
    return;
  }

  let uids = config.uids ? config.uids.split(',') : [];
  if (uids.length > 0 && !uids[0]) {
    uids = [];
  }

  if (!uids.length) {
    getUserGameRoles('hk4e_cn').then(list => {
      if (list.length && !store.uid) {
        setState({ uid: list[0].game_uid });
      }
    }, e => {
      showToast(e.message, { type: 'error' });
    });
  }

  return {
    uid: uids[0] || '',
    uids,
    stick_header: config.stick_header === 'true',
    stick_group_banner: config.stick_group_banner === 'true',
  };
}

createRoot(() => {
  getUserConfig().then(config => config && setState(config));

  createEffect(() => {
    const value = store.uids.join(',');
    Storage.set('uids', value);
  });

  createEffect(() => {
    const value = '' + store.stick_header;
    Storage.set('stick_header', value);
  });

  createEffect(() => {
    const value = '' + store.stick_group_banner;
    Storage.set('stick_group_banner', value);
  });
});


const [submitSignal, setSubmit] = createSignal<number>();
export { submitSignal };
export function submit(uid: string) {
  if (!uid) {
    throw new Error('UID 不能为空');
  }

  if (!isValidUid(uid)) {
    throw new Error('UID 不合法');
  }

  if (!isValidCnUid(uid)) {
    throw new Error('不支持查询国际服数据');
  }

  const uids = store.uids.slice();
  const position = uids.indexOf(uid);
  if (~position) {
    uids.splice(position, 1);
  }
  uids.unshift(uid);

  setState({ uid, uids });
  setSubmit(Date.now());
}

