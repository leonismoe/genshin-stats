import md5 from '@leonismoe/md5';
import SALTS from '../../data/salts.json';
import { APIClientType, MixedValuesOfEnum, Merge, DSOptions } from '../../typings';
import { USER_AGENT_ANDROID_WEBVIEW, USER_AGENT_WINDOWS_CRHOME } from './user-agent';

export default getDS;

export function getDS(): string;
export function getDS(options: DSOptions): string;
export function getDS(client_type: MixedValuesOfEnum<APIClientType>, app_version?: string): string;
export function getDS(options?: DSOptions | MixedValuesOfEnum<APIClientType>, app_version?: string): string {
  let salt = SALTS[SALTS.latest]?.[1]?.[APIClientType.WEBVIEW];

  if (typeof options === 'object') {
    salt = options.salt || SALTS[options.app_version]?.[1]?.[options.client_type];

  } else if (options) {
    salt = SALTS[app_version || SALTS.latest]?.[1]?.[/* client_type */options];
    if (!salt && !app_version) {
      const prefix = SALTS.latest.slice(0, SALTS.latest.lastIndexOf('.'));
      for (let i = +SALTS.latest.slice(prefix.length + 1) - 1; i >= 0 && !salt; --i) {
        salt = SALTS[`${prefix}.${i}`]?.[1]?.[/* client_type */options];
      }
    }
  }

  if (!salt) {
    throw new Error('no salt found');
  }
  return calculateDS(salt);
}

export function calculateDS(salt: string): string {
  const time = (Date.now() / 1000) | 0;
  const nonce = Math.random().toString(36).substr(2, 6);
  const digest = md5(`salt=${salt}&t=${time}&r=${nonce}`);

  return `${time},${nonce},${digest}`;
}


type DS2Param = string | Record<string, string | number | boolean | null | undefined>;

export function getDS2(body: DS2Param, query: DS2Param | URLSearchParams, options?: DSOptions): string;
export function getDS2(body: DS2Param, query: DS2Param | URLSearchParams, client_type: MixedValuesOfEnum<APIClientType>, app_version?: string): string;
export function getDS2(body: DS2Param, query: DS2Param | URLSearchParams, options?: DSOptions | MixedValuesOfEnum<APIClientType>, app_version?: string): string {
  let salt = SALTS[SALTS.latest]?.[2]?.[APIClientType.WEBVIEW];

  if (typeof options === 'object') {
    salt = options.salt || SALTS[options.app_version]?.[2]?.[options.client_type];

  } else if (options) {
    salt = SALTS[app_version || SALTS.latest]?.[2]?.[/* client_type */options];
    if (!salt && !app_version) {
      const prefix = SALTS.latest.slice(0, SALTS.latest.lastIndexOf('.'));
      for (let i = +SALTS.latest.slice(prefix.length + 1) - 1; i >= 0 && !salt; --i) {
        salt = SALTS[`${prefix}.${i}`]?.[1]?.[/* client_type */options];
      }
    }
  }

  if (!salt) {
    throw new Error('no salt found');
  }

  if (body == null) {
    body = '';
  } else if (typeof body === 'object') {
    body = JSON.stringify(body);
  }

  if (query == null) {
    query = '';
  } else if (typeof query === 'object') {
    query = normalizeQuery(query);
  }

  return calculateDS2(salt, body, query);
}

export function calculateDS2(salt: string, body: string, query: string): string {
  const time = (Date.now() / 1000) | 0;
  const nonce = ('' + (100000 + 100000 * Math.random() | 0)).slice(-6);
  const digest = md5(`salt=${salt}&t=${time}&r=${nonce}&b=${body}&q=${query}`);

  return `${time},${nonce},${digest}`;
}

export function normalizeQuery(query: Record<string, string | number | boolean | null | undefined> | URLSearchParams): string {
  if (query instanceof URLSearchParams) {
    query.sort();
    const result = query.toString();
    return result[0] === '?' ? result.slice(1) : result;
  }

  const fragments: string[] = [];
  for (const key of Object.keys(query).sort()) {
    const value = query[key];
    if (value != null) {
      fragments.push(`${key}=${value}`);
    }
  }

  return fragments.join('&');
}


type LooseDSOptions = Merge<DSOptions, { app_version?: string }>;

export function getUserAgent(options: LooseDSOptions): string {
  switch (options.client_type) {
    case APIClientType.ANDROID: return 'okhttp/4.8.0';
    case APIClientType.WEBVIEW: return `${USER_AGENT_ANDROID_WEBVIEW} miHoYoBBS/${options.app_version || SALTS.latest}`;
    case APIClientType.WEB: return typeof navigator != 'undefined' ? navigator.userAgent : USER_AGENT_WINDOWS_CRHOME;
  }
  return '';
}


export function getHTTPRequestHeaders(options: LooseDSOptions): Record<string, string> {
  const headers: Record<string, string> = {
    'x-rpc-app_version': options.app_version || SALTS.latest,
    'x-rpc-client_type': options.client_type + '',
  };

  if (options.client_type == APIClientType.ANDROID) {
    headers['referer'] = 'https://app.mihoyo.com';
    headers['x-rpc-channel'] = 'miyousheluodi';
  }

  if (options.channel) {
    headers['x-rpc-channel'] = options.channel;
  }

  if (options.device_id) {
    headers['x-rpc-device_id'] = options.device_id;
  }

  if (options.client_type == APIClientType.WEBVIEW) {
    headers['x-requested-with'] = 'com.mihoyo.hyperion';
  }

  return headers;
}
