import type Browser from 'webextension-polyfill';

declare global {
  declare const browser: typeof Browser;
}
