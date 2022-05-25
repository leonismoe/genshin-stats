/// <reference types="vite/client" />

import { createStore } from 'solid-js/store';
import { createRoot, createSignal, createEffect, batch } from 'solid-js';
import { getUserGameRoles } from '@mihoyo-kit/api';
import { isValidUid, isValidCnUid } from '@mihoyo-kit/genshin-data';
import { GlobalState, PAGE_TYPE, UidItem } from './typings';
import { show as showToast } from '../utils/toast';
import { PROXY_OPTIONS } from './proxy';
import * as Storage from '../utils/storage';

function createGlobalStore() {
  const data: GlobalState = {
    uid: '',
    uids: [],
    page: PAGE_TYPE.ROLES,
    stick_header: false,
    stick_group_banner: false,
    game_uid: '',
    nickname: '',
  };

  return createStore<GlobalState>(data);
}

export const [store, setState] = createGlobalStore();
export default store;

async function getUserConfig() {
  const config = await Storage.get(['uids', 'stick_header', 'stick_group_banner']);

  let uids: UidItem[] = [];
  if (config && config.uids) {
    config.uids.split(',').forEach((text, index) => {
      if (text.length >= 9) {
        uids.push([text.slice(0, 9), text.slice(10)]);
      }
    });
  }

  getUserGameRoles('hk4e_cn', PROXY_OPTIONS).then(list => {
    if (list.length) {
      batch(() => {
        const uid = list[0].game_uid;
        setState({ game_uid: uid, nickname: list[0].nickname });

        if (!store.uid) {
          setState({ uid });
        } else if (!store.uids.find(item => item[0] === uid)) {
          setState({ uids: [...store.uids, [uid, '']] });
        }
      });
    }
  }, e => {
    if (import.meta.env.MODE === 'pages' && e instanceof TypeError && (e.message === 'Failed to fetch' || e.message === 'NetworkError when attempting to fetch resource.')) {
      showToast('网络请求失败，请<a href="genshin-stats.user.js" target="_blank" rel="noopener" data-dismiss="toast">点击此处</a>安装用户脚本（建议使用 <a href="https://www.tampermonkey.net/" target="_blank">Tampermonkey</a> 浏览器扩展管理）以便发起跨域请求。', { type: 'error', sticky: true, html: true });

    } else if (e.code === -100) {
      showToast('尚未登录或登录失效，请<a href="https://bbs.mihoyo.com/ys/" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" data-dismiss="toast">点击此处</a>前往米油社原神社区登录，之后返回此页面查询。', { type: 'error', sticky: true, html: true });

    } else {
      showToast(e.message, { type: 'error', timeout: 5000 });
    }
  });

  if (!config) {
    return;
  }

  return {
    uid: '',
    uids,
    stick_header: config.stick_header === 'true',
    stick_group_banner: config.stick_group_banner === 'true',
  };
}

createRoot(() => {
  getUserConfig().then(config => config && setState(config));

  createEffect(() => {
    Storage.set('uids', store.uids.map(item => item.join('|')).join(','));
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
  let item: UidItem | undefined;
  for (let i = 0; i < uids.length; i++) {
    if (uids[i][0] === uid) {
      item = uids[i] as UidItem;
      uids.splice(i, 1);
      break;
    }
  }
  uids.unshift(item || [uid, '']);

  setState({ uid, uids });
  setSubmit(Date.now());
}
