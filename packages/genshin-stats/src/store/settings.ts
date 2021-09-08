import { hasOwn } from '@mihoyo-kit/api';
import * as Storage from '../utils/storage';

export const Settings = {
  screenshot: {
    clipboard: true,
    savefile: false,
  },
};

export default Settings as Readonly<typeof Settings>;

export function set(key: string, value: string | number | boolean): Promise<void> {
  let store = Settings as any;
  const path = key.split('.');

  while (path.length > 1) {
    if (!store) {
      break;
    }
    store = store[path.shift()!];
  }

  if (store) {
    store[path[0]] = value;

    return Storage.set(key, value + '');
  }

  return Promise.resolve();
}

async function loadSettings() {
  const data = await Storage.get([
    'screenshot.clipboard',
    'screenshot.savefile',
  ]);

  for (const key in data) {
    if (!hasOwn(data, key) || data[key] == null) continue;

    let store = Settings as any;
    const path = key.split('.');

    while (path.length > 1) {
      if (!store) break;
      store = store[path.shift()!];
    }

    if (store) {
      const prop = path[0];
      const value = data[key]!;
      switch (typeof store[prop]) {
        case 'boolean':
          if (['true', 'false', '1', '0'].includes(value)) {
            store[prop] = value === 'true' || value === '1';
          }
          break;

        case 'number':
          if (!isNaN(+value)) {
            store[prop] = +value;
          }
          break;

        case 'string':
          store[prop] = value;
          break;
      }
    }
  }
}
loadSettings();
