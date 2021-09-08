/// <reference types="chrome" />
/// <reference types="webextension-polyfill" />

const action  = typeof chrome !== 'undefined' && chrome.action || browser.action;
const runtime = typeof chrome !== 'undefined' && chrome.runtime || browser.runtime;

action.onClicked.addListener(tab => {
  if (tab.url) {
    const url = new URL(tab.url);
    if (url.hostname === runtime.id) {
      runtime.sendMessage('capture');

    } else {
      runtime.openOptionsPage();
    }

  } else {
    runtime.openOptionsPage();
  }
});
