/// <reference types="vite-plugin-pwa/client" />

import { render } from 'solid-js/web';
import { show as showToast } from './utils/toast';
import App from './components/App';
import { registerSW } from 'virtual:pwa-register';

window.addEventListener('DOMContentLoaded', () => {
  if (/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)){
    document.body.classList.add('mac-like');
  }

  render(App, document.body);

  if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
    const version = document.querySelector('meta[name=version]') as HTMLMetaElement;
    if (version && /^\d+\.\d+\.\d+$/.test(version.content) && version.content !== chrome.runtime.getManifest().version) {
      const wrap = document.createElement('div');
      const btn = document.createElement('a');
      btn.textContent = '此处';
      btn.href = '#';
      btn.addEventListener('click', e => {
        e.preventDefault();
        chrome.runtime.reload();
      });
      wrap.appendChild(document.createTextNode('检测到版本更新，请点击'));
      wrap.appendChild(btn);
      wrap.appendChild(document.createTextNode('重新加载扩展。注意，您可能需要重新点击扩展按钮以打开此页面。'));
      showToast(wrap, { sticky: true, dismissable: false });
    }
  }
});

if (import.meta.env.MODE === 'pages') {
  const updateSW = registerSW({
    onNeedRefresh() {
      const wrap = document.createElement('div');
      const btn = document.createElement('a');
      btn.textContent = '单击此处';
      btn.href = '#';
      btn.addEventListener('click', e => {
        e.preventDefault();
        btn.blur();
        btn.classList.add('color-fg-subtle');
        btn.style.pointerEvents = 'none';
        updateSW(true);
      });
      wrap.appendChild(document.createTextNode('检测到版本更新，请'));
      wrap.appendChild(btn);
      wrap.appendChild(document.createTextNode('刷新页面。'));
      showToast(wrap, { sticky: true });
    },
  });
}
