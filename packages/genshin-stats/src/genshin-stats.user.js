// ==UserScript==
// @name         Genshin Stats
// @description  Make "Genshin Stats" page work without browser extension.
// @version      1.0.0
// @homepage     https://github.com/leonismoe/genshin-stats/tree/main/packages/genshin-stats
// @updateURL    https://genshin-stats.pages.dev/genshin-stats.user.js
// @downloadURL  https://genshin-stats.pages.dev/genshin-stats.user.js
// @match        https://genshin-stats.pages.dev/*
// @match        https://genshin-stats.leonis.dev/*
// @match        https://leonismoe.github.io/genshin-stats/*
// @connect      api-takumi.mihoyo.com
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
      onload: res => console.log(res) || resolve({
        ok: res.status >= 200 && res.status < 300,
        url: res.finalUrl,
        status: res.status,
        statusText: res.statusText,
        redirected: null,
        headers: transformHeaders(res.responseHeaders),
        get body() { return res.response.stream() },
        json: () => Promise.resolve(JSON.parse(res.responseText)),
        text: () => Promise.resolve(res.responseText),
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
  return new Headers(header.trimEnd().split('\r\n').map(v => {
    const pos = v.indexOf(':');
    return pos < 0 ? [v, ''] : [v.slice(0, pos), v.slice(pos + 1)];
  }));
}
