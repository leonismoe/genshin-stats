/// <reference types="vite/client" />

import type { RequestOptions } from '@mihoyo-kit/api';

export const PROXY_OPTIONS: RequestOptions = import.meta.env.PROD ? {} : {
  resolveUrl: url => {
    if (typeof url == 'string') {
      url = new URL(url);
    }
    return '/proxy/' + url.hostname + url.pathname + url.search;
  },
};
