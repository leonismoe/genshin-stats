// DS1: APIClientType.IOS              : 1: -
// DS1: APIClientType.ANDROID          : 2: k2
// DS1: APIClientType.WEB (PC)         : 4: -
// DS1: APIClientType.WEBVIEW (Mobile) : 5: lk2
// DS2: APIClientType.ANDROID          : 2: x6
// DS2: APIClientType.WEBVIEW (Mobile) : 5: x4

// https://github.com/UIGF-org/mihoyo-api-collect/issues/1

import { APIClientType, ValuesOfEnum } from '../typings';

interface Salts {
  [version: string]: SaltItem;
  latest: string;
}

interface SaltItem {
  '1'?: Record<APIClientType, string>;
  '2'?: Record<APIClientType, string>;
}

declare const data: Salts;
export default data;
