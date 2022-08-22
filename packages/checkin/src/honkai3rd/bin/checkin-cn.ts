#!/usr/bin/env node

import { createInterface } from 'readline';
import { getUserGameRolesByCookieToken } from '@mihoyo-kit/api';
import { sleep } from '../../common/utils';
import { checkinHonkai3rdCN, batchCheckinHonkai3rdCN, Honkai3rdBatchCheckinResult, Honkai3rdCheckinPreparation, Honkai3rdBatchCheckinFailureResult } from '../cn';
import { getAwards } from '../cn/api';

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
        process.stdout.write(`[${i + 1}/${cookies.length}]\n`);

        const it = batchCheckinHonkai3rdCN(cookies[i]);
        const roles = ((await it.next()).value as Honkai3rdCheckinPreparation).roles;

        let roleIndex = 0;
        while (true) {
          const role = roles[roleIndex];
          if (!role) {
            break;
          }

          const title = `  :: (${roleIndex + 1}/${roles.length}) ${role.nickname} (${role.region_name} ${role.game_uid})`;
          roleIndex++;

          process.stdout.write(title);
          if (isTTY) {
            process.stdout.write(' 正在签到...');
          }

          const result = (await it.next()).value as Honkai3rdBatchCheckinResult;
          if (isErrorResult(result)) {
            if (isTTY) {
              clearLine();
              process.stdout.write(`${title} 签到失败\n`);
            } else {
              process.stdout.write(' 签到失败\n');
            }
            process.stdout.write(`     ${result.error}\n`);
            if ((process.env.DEBUG || process.env.VERBOSE) && result.error instanceof Error && result.error.stack) {
              result.error.stack.split('\n').forEach((text, lineNo) => {
                if (lineNo) process.stdout.write(`   ${text}\n`); // `text` is already prefixed with 4 spaces
              });
            }
            process.exitCode = 1;
            continue;
          }

          let checkInStatus = `${result.checkedIn ? '签到成功' : '今日已签到'}，本月共签到 ${result.total_sign_day} 天`;
          if (result.sign_cnt_missed) {
            checkInStatus += `，漏签 ${result.sign_cnt_missed} 天`;
          }

          if (isTTY) {
            clearLine();
            process.stdout.write(`${title} ${checkInStatus}\n`);
          } else {
            process.stdout.write(` ${checkInStatus}\n`);
          }

          process.stdout.write(`     签到奖励: ${result.award.name} x ${result.award.cnt}\n`);
          if (result.extraAward) {
            process.stdout.write(`     额外奖励: ${result.extraAward.name} x ${result.extraAward.cnt}\n`);
          }
        }

      } catch (e) {
        process.stdout.write(`  签到失败: ${e}\n`);
        if ((process.env.DEBUG || process.env.VERBOSE) && e instanceof Error && e.stack) {
          e.stack.split('\n').forEach((text, lineNo) => {
            if (lineNo) process.stdout.write(`${text}\n`); // `text` is already prefixed with 4 spaces
          });
        }
        process.exitCode = 1;
      }
    }

  } else {
    const awards = await getAwards();

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
      cookie = cookie.trim();
      deferred = deferred.then(async() => {
        try {
          const roles = await getUserGameRolesByCookieToken('bh3_cn', { cookie });
          if (!roles.length) {
            throw new Error('没有找到游戏角色');
          }

          for (let i = 0; i < roles.length; ++i) {
            const role = roles[i];
            const title = `:: (${i + 1}/${roles.length}) ${role.nickname} (${role.region_name} ${role.game_uid})`;
            process.stdout.write(title);
            if (isTTY) {
              process.stdout.write(' 正在签到...');
            }

            try {
              const result = await checkinHonkai3rdCN(cookie, role, awards);
              let checkInStatus = `${result.checkedIn ? '签到成功' : '今日已签到'}，本月共签到 ${result.total_sign_day} 天`;
              if (result.sign_cnt_missed) {
                checkInStatus += `，漏签 ${result.sign_cnt_missed} 天`;
              }

              if (isTTY) {
                clearLine();
                process.stdout.write(`${title} ${checkInStatus}\n`);
              } else {
                process.stdout.write(` ${checkInStatus}\n`);
              }

              process.stdout.write(`   签到奖励: ${result.award.name} x ${result.award.cnt}\n`);
              if (result.extraAward) {
                process.stdout.write(`   额外奖励: ${result.extraAward.name} x ${result.extraAward.cnt}\n`);
              }

            } catch (e) {
              if (isTTY) {
                clearLine();
                process.stdout.write(`${title} 签到失败\n`);
              } else {
                process.stdout.write(' 签到失败\n');
              }
              process.stdout.write(`   ${e}\n`);
              if ((process.env.DEBUG || process.env.VERBOSE) && e instanceof Error && e.stack) {
                e.stack.split('\n').forEach((text, lineNo) => {
                  if (lineNo) process.stdout.write(` ${text}\n`); // `text` is already prefixed with 4 spaces
                });
              }
              process.exitCode = 1;
            }

            await sleep(500);
          }

        } catch (e) {
          process.stdout.write(`签到失败: ${(e as Error).message}\n`);
          if ((process.env.DEBUG || process.env.VERBOSE) && e instanceof Error && e.stack) {
            e.stack.split('\n').forEach((text, lineNo) => {
              if (lineNo) process.stdout.write(`${text}\n`); // `text` is already prefixed with 4 spaces
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

function isErrorResult(result: Honkai3rdBatchCheckinResult): result is Honkai3rdBatchCheckinFailureResult {
  return !!(result as Honkai3rdBatchCheckinFailureResult).error;
}
