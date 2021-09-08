export type ValuesOfEnum<T extends string | number> = `${T}`;
export type MixedValuesOfEnum<T extends string | number> = T | `${T}`;

export type Mutable<T> = { -readonly [P in keyof T ]: T[P] };

export type WrapWithKey<T, Key extends PropertyKey> = {
  [K in Key]: T;
}

export type ReverseMap<T extends Record<keyof T, any>> = {
  [V in T[keyof T]]: {
    [K in keyof T]: T[K] extends V ? K : never;
  }[keyof T];
}

export type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

export type Except<ObjectType, KeysType extends keyof ObjectType> = Pick<ObjectType, Exclude<keyof ObjectType, KeysType>>;
export type Merge<FirstType, SecondType> = Except<FirstType, Extract<keyof FirstType, keyof SecondType>> & SecondType;

export interface PromiseCookieJar {
  getCookieString: (url: string) => Promise<string>;
  setCookie: (rawCookie: string, url: string) => Promise<unknown>;
}

export type APIResponse<T> = {
  readonly data: T;
  readonly message: string;
  readonly retcode: number;
}

export const enum APIClientType {
  IOS = 1,
  ANDROID = 2,
  WEB = 4,     // pc
  WEBVIEW = 5, // webview in android / ios app
}

export interface DSOptions {
  client_type: MixedValuesOfEnum<APIClientType>;
  app_version: string;
  channel?: string;
  device_id?: string; // PC Web: [0-9a-f]{32}, Android: UUID
  salt?: string;
  ds2?: boolean;
}

export const enum GameBiz {
  HONKAI_3RD = 'bh3_cn',
  GENSHIN_IMPACT = 'hk4e_cn',
}
