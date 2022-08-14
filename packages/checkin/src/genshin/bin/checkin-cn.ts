#!/usr/bin/env node

import { createInterface } from 'readline';
import { checkinGenshinCN } from '../cn';
import { getAwards } from '../cn/api';

(async() => {
  const { isTTY } = process.stdout;

  let cookies: string[] = [];
  if (process.argv.length > 2) {
    cookies = process.argv.slice(2);
  } else if (process.env.MIHOYO_COOKIES) {
    cookies = process.env.MIHOYO_COOKIES.split(/\n|\|/g);
  }

  const awards = await getAwards();

  if (cookies.length) {
    for (let i = 0; i < cookies.length; ++i) {
      try {
        if (isTTY) {
          clearLine();
          process.stdout.write(`:: (${i + 1}/${cookies.length}) 正在签到...`);
        } else {
          process.stdout.write(`:: (${i + 1}/${cookies.length}) `);
        }

        const res = await checkinGenshinCN(cookies[i], awards);
        const roleText = `${res.role.nickname} (${res.role.region_name} ${res.role.game_uid})`;
        let checkInStatusText = `${res.checkedIn ? '签到成功' : '今日已签到'}，本月共签到 ${res.total_sign_day} 天`;
        if (res.sign_cnt_missed) {
          checkInStatusText += `，漏签 ${res.sign_cnt_missed} 天`;
        }

        if (isTTY) {
          clearLine();
          process.stdout.write(`:: (${i + 1}/${cookies.length}) ${roleText} ${checkInStatusText}\n`);
        } else {
          process.stdout.write(`${roleText} ${checkInStatusText}\n`);
        }
        process.stdout.write(`   签到奖励: ${res.award.name} x ${res.award.cnt}\n`);

      } catch (e) {
        if (isTTY) {
          clearLine();
          process.stdout.write(`:: (${i + 1}/${cookies.length}) 签到失败\n`);
        } else {
          process.stdout.write('签到失败\n');
        }
        process.stdout.write(`   ${e}\n`);
        if ((process.env.DEBUG || process.env.VERBOSE) && e instanceof Error && e.stack) {
          e.stack.split('\n').forEach((text, lineNo) => {
            if (lineNo) process.stdout.write(` ${text}\n`); // `text` is already prefixed with 4 spaces
          });
        }
        process.exitCode = 1;
      }
    }

  } else {
    if (process.stdin.isTTY) {
      process.stderr.write('请输入米油社 Cookie 后按回车后签到，一行一个账号。\n');
      process.stderr.write(`如需退出程序，请按 ${process.platform === 'darwin' ? 'control+C' : 'Ctrl+C'} 结束。\n`);
    }

    const rl = createInterface({
      input: process.stdin,
      terminal: false,
    });

    let deferred = Promise.resolve();
    rl.on('line', cookie => {
      if (!cookie || cookie.startsWith('#')) return;
      deferred = deferred.then(async() => {
        try {
          const res = await checkinGenshinCN(cookie.trim(), awards);
          const roleText = `${res.role.nickname} (${res.role.region_name} ${res.role.game_uid})`;
          let checkInStatusText = `${res.checkedIn ? '签到成功' : '今日已签到'}，本月共签到 ${res.total_sign_day} 天`;
          if (res.sign_cnt_missed) {
            checkInStatusText += `，漏签 ${res.sign_cnt_missed} 天`;
          }

          process.stdout.write(`:: ${roleText} ${checkInStatusText}\n`);
          process.stdout.write(`   签到奖励: ${res.award.name} x ${res.award.cnt}\n`);

        } catch (e) {
          process.stdout.write(':: 签到失败\n');
          process.stdout.write(`   ${e}\n`);
          if ((process.env.DEBUG || process.env.VERBOSE) && e instanceof Error && e.stack) {
            e.stack.split('\n').forEach((text, lineNo) => {
              if (lineNo) process.stdout.write(` ${text}\n`); // `text` is already prefixed with 4 spaces
            });
          }
          process.exitCode = 1;
        }
      });
    });
  }
})();

function clearLine(stream = process.stdout) {
  if (stream.isTTY) {
    stream.clearLine(0);
    stream.write('\r');
  }
}
