#!/usr/bin/env node

import { createInterface } from 'readline';
import { checkinGenshinCN } from '../cn';

(async() => {
  const { isTTY } = process.stdout;

  let cookies: string[] = [];
  if (process.argv.length > 2) {
    cookies = process.argv.slice(2);
  } else if (process.env.MIHOYO_COOKIES) {
    cookies = process.env.MIHOYO_COOKIES.split(/\n|\|/g);
  }

  if (cookies.length) {
    for (let i = 0; i < cookies.length; ++i) {
      try {
        if (isTTY) {
          clearLine();
          process.stdout.write(`:: (${i + 1}/${cookies.length}) 正在签到...`);
        } else {
          process.stdout.write(`:: (${i + 1}/${cookies.length}) `);
        }

        const res = await checkinGenshinCN(cookies[i]);
        if (isTTY) {
          clearLine();
          process.stdout.write(`:: (${i + 1}/${cookies.length}) ${res.checkedIn ? '签到成功' : '今日已签到'}，本月共签到 ${res.total_sign_day} 天\n`);
        } else {
          process.stdout.write(`${res.checkedIn ? '签到成功' : '今日已签到'}，本月共签到 ${res.total_sign_day} 天\n`);
        }
        process.stdout.write(`   游戏角色: ${res.role.nickname} (${res.role.region_name} ${res.role.game_uid})\n`);
        process.stdout.write(`   签到奖励: ${res.award.name} x ${res.award.cnt}\n`);

      } catch (e) {
        if (isTTY) {
          clearLine();
          process.stdout.write(`:: (${i + 1}/${cookies.length}) 签到失败\n`);
        } else {
          process.stdout.write('签到失败\n');
        }
        process.stdout.write(`   ${(e as Error).message}\n`);
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
          const res = await checkinGenshinCN(cookie.trim());
          process.stdout.write(`:: ${res.role.nickname} (${res.role.region_name} ${res.role.game_uid}) ${res.checkedIn ? '签到成功' : '今日已签到'}，本月共签到 ${res.total_sign_day} 天\n`);
          process.stdout.write(`   签到奖励: ${res.award.name} x ${res.award.cnt}\n`);
        } catch (e) {
          process.stdout.write(':: 签到失败\n');
          process.stdout.write(`   ${(e as Error).message}\n`);
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
