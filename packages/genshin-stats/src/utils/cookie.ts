export function get(key: string, cookieString = document?.cookie): string | undefined {
  if (!cookieString) {
    return;
  }

  const cookies = cookieString.split('; ');
  const normalizedKey = decodeURIComponent(key);

  for (let i = 0; i < cookies.length; ++i) {
    const cookie = cookies[i];
    const position = cookie.indexOf('=');
    const name = decodeURIComponent(cookie.substr(0, position));

    if (name === normalizedKey) {
      const value = cookie.substr(position + 1);
      return decodeURIComponent(value[0] === '"' ? value.slice(1, -1) : value);
    }
  }
}

export function getAll(cookieString = document?.cookie): Record<string, string> {
  const jar: Record<string, string> = {};
  const cookies = cookieString.split('; ');

  for (let i = 0; i < cookies.length; ++i) {
    const cookie = cookies[i];
    const position = cookie.indexOf('=');
    const name = decodeURIComponent(cookie.substr(0, position));
    const value = cookie.substr(position + 1);

    jar[name] = decodeURIComponent(value[0] === '"' ? value.slice(1, -1) : value);
  }

  return jar;
}

interface CookieItem {
  name: string;
  value: string;
};

export function getList(cookieString = document?.cookie): CookieItem[] {
  const list: CookieItem[] = [];
  const cookies = cookieString.split('; ');

  for (let i = 0; i < cookies.length; ++i) {
    const cookie = cookies[i];
    const position = cookie.indexOf('=');
    const name = decodeURIComponent(cookie.substr(0, position));
    const value = cookie.substr(position + 1);

    list.push({ name, value: decodeURIComponent(value[0] === '"' ? value.slice(1, -1) : value) });
  }

  return list;
}

export interface CookieAttributes {
  expires?: number | string | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'Strict' | 'lax' | 'Lax' | 'none' | 'None';

  [property: string]: any;
}

export function set(key: string, value: string | number, attributes?: CookieAttributes): void {
  if (typeof document !== 'undefined') {
    let stringifiedAttributes = '';
    if (attributes) {
      attributes = { ...attributes };

      if (attributes.expires) {
        if (typeof attributes.expires == 'number') {
          attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
        }
        if (typeof attributes.expires != 'string') {
          attributes.expires = attributes.expires.toUTCString();
        }
      }

      for (const name in attributes) {
        const value = attributes[name];
        if (value || value === 0) {
          stringifiedAttributes += `; ${name}`;
          if (value !== true) {
            stringifiedAttributes += `=${value}`.replace(/;/, '%3B');
          }
        }
      }
    }

    key = encodeURIComponent(key)
      .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
      .replace(/[()]/g, escape);

    document.cookie = `${key}=${encodeURIComponent(value).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent)}${stringifiedAttributes}`;
  }
}

export function remove(key: string, attributes?: CookieAttributes): void {
  set(key, '', { ...attributes, expires: -1 });
}
