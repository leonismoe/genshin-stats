import { findChrome } from 'find-chrome-bin';
import puppeteer from 'puppeteer-core';

(async() => {
  const chrome = await findChrome({});

  const browser = await puppeteer.launch({
    executablePath: chrome.executablePath,
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  await page.goto('https://user.mihoyo.com/#/login', {
    waitUntil: 'domcontentloaded',
  });

  await page.waitForResponse(response => {
    return response.ok() && response.url().startsWith('https://webapi.account.mihoyo.com/Api/login_by_cookie');
  }, { timeout: 0 });

  const siteCookies = await page.cookies();
  await browser.close();

  const cookies: string[] = [];
  siteCookies.forEach(({ name, value }) => {
    if (['login_uid', 'login_ticket', 'cookie_token', 'stoken', 'ltoken', 'account_id', 'ltuid'].includes(name)) {
      cookies.push(`${name}=${encodeURIComponent(value)}`);
    }
  });

  console.log('Your cookies:');
  console.log(cookies.join('; '));
})();
