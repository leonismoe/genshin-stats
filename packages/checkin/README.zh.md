米油社签到工具包
================

目前仅支持原神和崩坏 3 签到，其他类型的签到未实现，欢迎提交 PR。

## 使用

请确保已安装 [Node.js](https://nodejs.org/en/)，中国大陆的镜像站点 <https://npmmirror.com/mirrors/node/>（看不懂可访问 <http://nodejs.cn/download/>）。

### 命令调用

`@mihoyo-kit/checkin` 包里目前提供了两个命令：

* 原神：`checkin-genshin-cn`
* 崩坏 3：`checkin-honkai3rd-cn`

每个命令都支持三种方式调用，择其一即可，可以使用 `npx` 临时安装和启动。如果有安装 `yarn` 或者 `pnpm`，请自行参考对应的使用文档。

下面以 `npx` 和原神为例，整个 `npx -s --yes --package=@mihoyo-kit/checkin@latest checkin-genshin-cn` 可以当作直接调用 `checkin-genshin-cn`：

#### Windows

``` cmd
rem 命令行参数
npx -s --yes --package=@mihoyo-kit/checkin@latest checkin-genshin-cn "<你的 Cookie>"

rem 环境变量方式
set MIHOYO_COOKIES="<你的 Cookie>"
npx -s --yes --package=@mihoyo-kit/checkin@latest checkin-genshin-cn

rem 文件和管道
npx -s --yes --package=@mihoyo-kit/checkin@latest checkin-genshin-cn < \path\to\file\which\stores\cookie
```

#### Linux

``` sh
# 命令行参数
npx -s --yes --package=@mihoyo-kit/checkin@latest checkin-genshin-cn '<你的 Cookie>'

# 环境变量方式
export MIHOYO_COOKIES='<你的 Cookie>'
npx -s --yes --package=@mihoyo-kit/checkin@latest checkin-genshin-cn

# 文件和管道
npx -s --yes --package=@mihoyo-kit/checkin@latest checkin-genshin-cn < /path/to/file/which/stores/cookie

cat /path/to/file/which/stores/cookie | npx -s --yes --package=@mihoyo-kit/checkin@latest checkin-genshin-cn

npx -s --yes --package=@mihoyo-kit/checkin@latest checkin-genshin-cn << EOT
你的 Cookie (一行一个账号)
EOT
```

### 程序接口

可参考各模块 `bin` 目录脚本。

一个可能的 API 文档：<https://paka.dev/npm/@mihoyo-kit/checkin/api>

``` ts
import { checkinGenshinCN } from '@mihoyo-kit/checkin';

console.log(await checkinGenshinCN('你的 Cookie'));
```
