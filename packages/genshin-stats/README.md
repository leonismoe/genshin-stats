Genshin Impact Stats
====================
EN
[中文](README_CHS.md)

Query Genshin Impact game record data by UID, including characters, reliquaries, weapons, and spiral abyss statistics.
There's no need to set up a reverse proxy or download desktop applications.

Only tested under Google Chrome and Chromium-based Edge browser.

Note: Currently only supports querying CN server.


## Features
* Grouping  
  ![](screenshots/grouping.png)

* Sorting  
  Click the button to toggle ascending and descending order, and drag and drop to modify the sorting priority.  
  ![](screenshots/sorting.png)

* Quickly Screenshot  
  This feature is only available with the browser extension.  
  Click the browser extension button to open the query page, and click the button again on the query page to take a screenshot.  
  ![](screenshots/chrome-ext.png)


## Usage
1. Access https://bbs.mihoyo.com/ys/, ensure you have logged in.
2. Open https://genshin-stats.pages.dev/
3. Input the target UID, and then click the query button.

Make sure you have the [Tampermonkey](https://www.tampermonkey.net/) browser extension installed when using it for the first time.
and click https://genshin-stats.pages.dev/genshin-stats.user.js to install the user script for this project to Tampermonkey.

This script is only used to support cross-domain requests to the miHoYo API, all data is stored locally in your browser and no personal data is uploaded or intercepted, you can audit the code yourself.


## Install as browser extension (unrecommend)
Download and unzip the extension zip file, open the developer mode in the browser extension page, then click "load unpacked", and select the directory you just unzipped.

This project does not include the `HYWenHei-85W` font file due to the restriction of font license, to get a better display, please copy `YuanShen_Data/StreamingAssets/MiHoYoSDKRes/HttpServerResources/font/zh-cn.ttf` from Genshin Impact to `assets/fonts/HYWenHei-85W.ttf` manually.  
Or download the font file from the Internet, then place it at the path mentioned above.

If you are a developer, please select the `dist` directory when loading unpacked extension (you need to compile it first).


## Upgrade (browser extension)
Just extract the files of the new extension zip directly to the directory you previously installed.


## Build
``` sh
npm run build:chrome-ext
```


### Screenshots
Summary  
![](screenshots/summary.jpg)  

Roles  
![](screenshots/roles.jpg)  

Grouping roles  
![](screenshots/roles-grouped-by-rarity.jpg)  

Sprial Abyss  
![](screenshots/abyss.jpg)  
