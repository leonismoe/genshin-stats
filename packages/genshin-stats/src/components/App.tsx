import Header from './Header';
import { Match, Switch } from 'solid-js';
import { store as globalStore } from '../store/global';
import { PAGE_TYPE } from '../store/typings';
import settings from '../store/settings';
import Summary from './Summary';
import RoleList from './RoleList';
import SpiralAbyss from './SpiralAbyss';
import { show as showToast } from '../utils/toast';
import { CAPTURABLE, capture } from '../utils/capture';
import { enable as enableCSSPrintMedia, disable as disableCSSPrintMedia } from '../utils/emulate-css-print-media';
import sleep from '../utils/sleep';
import download from '../utils/download';
import '../styles/global.scss';

export default () => {
  return (
    <>
      <Header />

      <Switch>
        <Match when={globalStore.page === PAGE_TYPE.SUMMARY}>
          <Summary />
        </Match>
        <Match when={globalStore.page === PAGE_TYPE.ROLES}>
          <RoleList />
        </Match>
        <Match when={globalStore.page === PAGE_TYPE.ABYSS}>
          <SpiralAbyss />
        </Match>
      </Switch>
    </>
  );
};


if (CAPTURABLE) {
  (chrome || browser).runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message === 'capture') {
      if (!settings.screenshot.clipboard && !settings.screenshot.savefile) {
        showToast('请打开设置面板选择截图后的动作。');
        return;
      }

      enableCSSPrintMedia();
      await sleep(100);

      const margin = 4;
      const contentWidth = document.querySelector('header + * .container')?.clientWidth;

      try {
        const canvas = await capture();

        if (contentWidth && (contentWidth + 2 * margin) * devicePixelRatio < canvas.width) {
          const context = canvas.getContext('2d')!;
          const width = (contentWidth + 2 * margin) * devicePixelRatio;
          const offsetX = (canvas.width - width) / 2;
          const data = context.getImageData(offsetX, 0, width, canvas.height);

          canvas.width = width;
          context.putImageData(data, 0, 0);
        }

        canvas.toBlob(blob => {
          if (blob) {
            if (settings.screenshot.clipboard) {
              try {
                navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
                showToast('已复制页面截图到剪贴板');
              } catch (e) {
                showToast(e.message, { type: 'error' });
              }
            }

            if (settings.screenshot.savefile) {
              download(blob, `${globalStore.uid}-${globalStore.page}.png`);
            }
          }
        }, 'image/png');

      } catch (e) {
        showToast(e.message, { type: 'error' });
      }

      disableCSSPrintMedia();
    }
  });
}
