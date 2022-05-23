/// <reference types="vite/client" />

import { ParentProps, Show, onMount } from 'solid-js';
import { get as getCookie, set as setCookie } from '../utils/cookie';
import { show as showToast } from '../utils/toast';
import { CAPTURABLE } from '../utils/capture';
import * as Storage from '../utils/storage';
import store, { set } from '../store/settings';
import '@github/details-dialog-element';
import '../styles/settings.scss';

export default (props: ParentProps) => {
  let $details: HTMLDetailsElement | undefined;
  let $color_mode: HTMLSelectElement | undefined;
  let $dark_theme: HTMLSelectElement | undefined;
  let $screenshot_clipboard: HTMLInputElement | undefined;
  let $screenshot_savefile: HTMLInputElement | undefined;
  let $cookie: HTMLTextAreaElement | undefined;

  const handleDialogToggle = (e: Event) => {
    if ($cookie) {
      $cookie.value = document.cookie;
    }
    if ($screenshot_clipboard) {
      $screenshot_clipboard.checked = store.screenshot.clipboard;
    }
    if ($screenshot_savefile) {
      $screenshot_savefile.checked = store.screenshot.savefile;
    }
  };

  const select = (e: FocusEvent) => {
    (e.target as HTMLTextAreaElement).select();
  };

  const saveCookie = () => {
    const ltuid = getCookie('ltuid', $cookie!.value);
    const ltoken = getCookie('ltoken', $cookie!.value);
    if (!ltuid || !ltoken) {
      showToast('必须包含 ltuid 和 ltoken', { type: 'error' });
      return false;
    }
    if (!/^[1-9]\d{5,8}$/.test(ltuid)) {
      showToast('ltuid 格式不正确', { type: 'error' });
      return false;
    }
    setCookie('ltuid', ltuid, { expires: 365 });
    setCookie('ltoken', ltoken, { expires: 365 });
    return true;
  };

  const saveScreenshotSettings = () => {
    set('screenshot.clipboard', $screenshot_clipboard!.checked);
    set('screenshot.savefile', $screenshot_savefile!.checked);
  };

  const handleFormSave = (e: Event) => {
    let success = true;

    applyTheme($color_mode!.value, $dark_theme!.value);
    saveThemeConfig($color_mode!.value, $dark_theme!.value);

    if ($screenshot_clipboard) {
      saveScreenshotSettings();
    }

    if ($cookie) {
      success &&= saveCookie();
    }

    if (success) {
      $details!.open = false;
    }
  };

  onMount(() => {
    getThemeConfig().then(({ mode, darkTheme }) => {
      applyTheme(mode, darkTheme);
      $color_mode!.value = mode;
      $dark_theme!.value = darkTheme;
    });
  });

  return (
    <details ref={$details} class="settings details-overlay details-overlay-dark" onToggle={handleDialogToggle}>
      <summary class="btn" role="button">设置</summary>

      <details-dialog class="Box Box--overlay d-flex flex-column anim-fade-in fast">
        <div class="Box-header">
          <button class="Box-btn-octicon btn-octicon float-right" type="button" aria-label="关闭" data-close-dialog>
            <svg class="octicon octicon-x" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"></path></svg>
          </button>
          <h3 class="Box-title">设置</h3>
        </div>

        <div class="Box-body">
          <div class="form-group theme-options">
            <div class="form-group-header">
              <label>主题选项</label>
            </div>

            <div class="form-group-body">
              <label for="input-color-mode">颜色模式</label>
              <select class="form-select" id="input-color-mode" ref={$color_mode}>
                <option value="auto">自动</option>
                <option value="light">亮色</option>
                <option value="dark">暗色</option>
              </select>

              <label for="input-dark-theme">暗色主题</label>
              <select class="form-select" id="input-dark-theme" ref={$dark_theme}>
                <option value="dark">Dark</option>
                <option value="dark_dimmed">Dark Dimmed</option>
                <option value="dark_high_contrast">Dark High Contrast</option>
              </select>
            </div>
          </div>

          <Show when={/* @once */ import.meta.env.DEV || CAPTURABLE}>
            <div class="form-group screenshot-options">
              <div class="form-group-header">
                <label>截图选项</label>
              </div>

              <div class="form-group-body">
                <p class="note">在此页面上单击本扩展在浏览器上的按钮，可以截取整个页面。在此处选择截图之后的动作。</p>
                <label><input type="checkbox" ref={$screenshot_clipboard} />复制到剪贴板</label>
                <label><input type="checkbox" ref={$screenshot_savefile} />保存为文件</label>
              </div>
            </div>
          </Show>

          <Show when={/* @once */ !['pages', 'chrome-ext'].includes(import.meta.env.MODE) && (location.protocol === 'http:' || location.protocol === 'https:') && !location.hostname.endsWith('.mihoyo.com')}>
            <div class="form-group">
              <div class="form-group-header">
                <label for="input-cookie">Cookie</label>
              </div>
              <div class="form-group-body">
                <textarea class="form-control" id="input-cookie" rows={4} ref={$cookie} onFocus={select} autofocus />
              </div>
            </div>
          </Show>
        </div>

        <div class="Box-footer">
          <button type="button" class="btn btn-primary" onClick={handleFormSave}>保存</button>
        </div>
      </details-dialog>
    </details>
  );
}

function applyTheme(mode: string, darkTheme?: string) {
  document.documentElement.dataset.colorMode = mode;
  if (darkTheme) {
    document.documentElement.dataset.darkTheme = darkTheme;
  }
}

async function getThemeConfig() {
  const config = {
    mode: 'auto',
    darkTheme: 'dark_dimmed',
  };

  try {
    const userconfig = await Storage.get('theme');
    if (userconfig) {
      const parts = userconfig.split(',');
      if (parts.length === 2 && ['auto', 'light', 'dark'].includes(parts[0]) && ['dark', 'dark_dimmed'].includes(parts[1])) {
        config.mode = parts[0];
        config.darkTheme = parts[1];
      }
    }
  } catch (e) {
    // DO NOTHING
  }

  return config;
}

function saveThemeConfig(mode: string, darkTheme: string) {
  return Storage.set('theme', `${mode},${darkTheme}`);
}
