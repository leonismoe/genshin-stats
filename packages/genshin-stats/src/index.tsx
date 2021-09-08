import { render } from 'solid-js/web';
import { show as showToast } from './utils/toast';
import App from './components/App';

window.addEventListener('DOMContentLoaded', () => {
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
