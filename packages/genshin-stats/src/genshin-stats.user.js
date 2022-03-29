// ==UserScript==
// @name         Genshin Stats
// @description  Make "Genshin Stats" page work without browser extension.
// @version      1.2.0
// @homepage     https://github.com/leonismoe/genshin-stats/tree/main/packages/genshin-stats
// @updateURL    https://genshin-stats.leonis.dev/genshin-stats.user.js
// @downloadURL  https://genshin-stats.leonis.dev/genshin-stats.user.js
// @match        https://genshin-stats.pages.dev/*
// @match        https://*.genshin-stats.pages.dev/*
// @match        https://genshin-stats.leonis.dev/*
// @match        https://leonismoe.github.io/genshin-stats/*
// @connect      api-takumi.mihoyo.com
// @connect      api-takumi-record.mihoyo.com
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

const originalFetch = unsafeWindow.fetch;
unsafeWindow.fetch = (url, options) => {
  if (typeof url === 'string') {
    url = new URL(url, unsafeWindow.location.href);
  }

  if (!url.hostname.endsWith('.mihoyo.com')) {
    return originalFetch(url, options);
  }

  options = options || {};
  return new Promise((resolve, reject) => {
    const req = GM_xmlhttpRequest({
      method: options.method || 'GET',
      url: url.toString(),
      data: options.body,
      headers: options.headers instanceof unsafeWindow.Headers ? Object.fromEntries(options.headers) : options.headers,
      responseType: 'blob',
      onload: res => resolve({
        ok: res.status >= 200 && res.status < 300,
        url: res.finalUrl,
        status: res.status,
        statusText: res.statusText,
        redirected: null,
        headers: transformHeaders(res.responseHeaders),
        get body() { return res.response.stream() },
        json: () => res.response.text().then(JSON.parse),
        text: () => res.response.text(),
        blob: () => res.response,
        arrayBuffer: () => res.response.arrayBuffer(),
      }),
      onabort: reject,
    });

    if (options.signal) {
      options.signal.addEventListener('abort', function onabort() {
        options.signal.removeEventListener('abort', onabort);
        req.abort();
      });
    }
  });
};

function transformHeaders(header) {
  const fragments = [];
  header.trimEnd().split('\r\n').forEach(line => {
    const offset = line.indexOf(':');
    if (offset < 0) {
      fragments.push([line, '']);
    } else {
      const header = line.slice(0, offset);
      line.slice(offset + 1).split('\n').forEach(value => {
        fragments.push([header, value]);
      });
    }
  });
  return new Headers(fragments);
}
