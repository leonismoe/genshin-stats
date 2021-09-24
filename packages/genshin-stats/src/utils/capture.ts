/// <reference types="vite/client" />
/// <reference types="chrome" />
/// <reference types="webextension-polyfill" />

import sleep from './sleep';

const tabs: typeof chrome.tabs = typeof chrome != 'undefined' && chrome.tabs || typeof browser != 'undefined' && browser.tabs as any;

export const CAPTURABLE = tabs && (import.meta.env.MODE === 'chrome-ext' || typeof tabs.captureVisibleTab != 'undefined');

function rAF() {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

function captureVisibleTab() {
  return new Promise<string>(resolve => {
    tabs.captureVisibleTab(resolve);
  });
}

function dataUrlToImage(url: string) {
  return new Promise<HTMLImageElement>(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = url;
  });
}

export async function capture() {
  const originalScrollTop = document.documentElement.scrollTop;
  document.documentElement.scrollTop = 0;
  await rAF();

  const canvas = document.createElement('canvas');
  const fullHeight = canvas.height = document.documentElement.scrollHeight * devicePixelRatio;
  canvas.width = document.documentElement.clientWidth * devicePixelRatio;

  let offsetY = 0;
  const context = canvas.getContext('2d')!;
  while (offsetY < fullHeight) {
    const img = await dataUrlToImage(await captureVisibleTab());

    const nextOffsetY = offsetY + img.naturalHeight;
    if (nextOffsetY > fullHeight) {
      const clippedHeight = nextOffsetY - fullHeight;
      const croppedHeight = img.naturalHeight - clippedHeight;
      context.drawImage(img, 0, clippedHeight, img.naturalWidth, croppedHeight, 0, offsetY, img.naturalWidth, croppedHeight);
      break;

    } else {
      context.drawImage(img, 0, offsetY, img.naturalWidth, img.naturalHeight);
      offsetY = nextOffsetY;
      document.documentElement.scrollTop += document.documentElement.clientHeight;
    }

    await sleep(500);
  }

  document.documentElement.scrollTop = originalScrollTop;

  return canvas;
}

export default capture;
