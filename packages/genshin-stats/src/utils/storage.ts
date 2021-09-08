import { hasOwn } from '@mihoyo-kit/api';

const CHROME_EXT_STORAGE = typeof chrome != 'undefined' && chrome.storage || typeof browser != 'undefined' && browser.storage;

export function get(key: string, defaultValue?: string): Promise<string | null | undefined>;
export function get<T extends string>(keys: T[]): Promise<Record<T, string | null>>;
export function get<T extends Record<string, string>>(keys: T): Promise<T>;
export function get(keys: string | string[] | Record<string, string>, defaultValue?: string): Promise<string | Record<keyof typeof keys, string | null | undefined> | null | undefined> {
  if (CHROME_EXT_STORAGE) {
    if (typeof keys === 'string') {
      if (defaultValue === undefined) {
        return new Promise<Record<string, string>>(resolve => CHROME_EXT_STORAGE.local.get(keys, resolve)).then(result => result[keys]);
      } else {
        return new Promise<Record<string, string>>(resolve => CHROME_EXT_STORAGE.local.get({ [keys]: defaultValue }, resolve)).then(result => result[keys]);
      }
    } else {
      return new Promise<Record<keyof typeof keys, any>>((resolve: (value: any) => void) => CHROME_EXT_STORAGE.local.get(keys, resolve));
    }
  }

  if (typeof localStorage != 'undefined') {
    if (typeof keys === 'string') {
      const result = localStorage.getItem(keys);
      return Promise.resolve(result == null ? defaultValue : result);

    } else if (Array.isArray(keys)) {
      const result: Record<string, string | null> = {};
      for (const key of keys) {
        result[key] = localStorage.getItem(key);
      }
      return Promise.resolve(result);

    } else {
      const result: Record<string, string> = {};
      for (const key in keys) {
        if (hasOwn(keys, key)) {
          const value = localStorage.getItem(key);
          result[key] = value == null ? keys[key] : value;
        }
      }
      return Promise.resolve(result);
    }
  }

  return Promise.resolve(null);
}

export function set(key: string, value: string): Promise<void>;
export function set(items: Record<string, string>): Promise<void>;
export function set(items: string | Record<string, string>, value?: string): Promise<void> {
  if (CHROME_EXT_STORAGE) {
    return new Promise<void>(resolve => {
      if (typeof items == 'string') {
        CHROME_EXT_STORAGE.local.set({ [items]: value }, resolve);
      } else {
        CHROME_EXT_STORAGE.local.set(items, resolve);
      }
    });
  }

  if (typeof localStorage != 'undefined') {
    if (typeof items == 'string') {
      localStorage.setItem(items, value!);
    } else {
      for (const key in items) {
        if (hasOwn(items, key)) {
          localStorage.setItem(key, items[key]);
        }
      }
    }
  }

  return Promise.resolve();
}

export function clear(): Promise<void> {
  if (CHROME_EXT_STORAGE) {
    return new Promise<void>(resolve => CHROME_EXT_STORAGE.local.clear(resolve));
  }

  localStorage?.clear();
  return Promise.resolve();
}

export function remove(keys: string | string[]): Promise<void> {
  if (CHROME_EXT_STORAGE) {
    return new Promise<void>(resolve => CHROME_EXT_STORAGE.local.remove(keys, resolve));
  }

  if (typeof localStorage != 'undefined') {
    if (typeof keys === 'string') {
      localStorage.removeItem(keys);
    } else {
      for (const key of keys) {
        localStorage.removeItem(key);
      }
    }
  }

  return Promise.resolve();
}

export function getAll(): Promise<Record<string, string>> {
  if (CHROME_EXT_STORAGE) {
    return new Promise<Record<string, any>>(resolve => CHROME_EXT_STORAGE.local.get(null, resolve));
  }

  const result: Record<string, string> = {};
  if (typeof localStorage !== 'undefined') {
    for (let i = 0; i < localStorage.length; ++i) {
      const key = localStorage.key(i)!;
      result[key] = localStorage.getItem(key)!;
    }
  }

  return Promise.resolve(result);
}
