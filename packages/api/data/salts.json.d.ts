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
