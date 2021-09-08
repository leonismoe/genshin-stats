原神数据查询
============
[EN](README.md)
中文

根据 UID 查询原神国服数据，包括角色列表，圣遗物和武器属性，以及深境螺旋记录。使用该扩展无需搭建反向代理，无需下载桌面应用程序。

仅在 Google Chrome 和基于 Chromium 的 Edge 浏览器中测试通过。


## 功能
* 分组  
  ![](screenshots/grouping.png)

* 多维排序  
  单击按钮切换升序降序，拖拽按钮修改排序优先级。  
  ![](screenshots/sorting.png)

* 截图  
  该功能仅在浏览器扩展下生效  
  单击浏览器扩展按钮可以快速打开查询页面，在查询页面上再次单击按钮可截图。  
  ![](screenshots/chrome-ext.png)


## 安装
下载并解压原神数据查询扩展包，在浏览器扩展页面中打开开发者模式，加载已解压的扩展程序，选择刚才解压的目录即可。

如果您是开发者，在加载已解压的扩展程序时，请选择 `dist` 目录（需要事先编译一次）。


## 使用
1. 访问米油社原神社区 [https://bbs.mihoyo.com/ys/](https://bbs.mihoyo.com/ys/)，确保已登录。
2. 单击浏览器中的原神数据查询按钮，打开查询页面。
3. 输入目标 UID，点击查询按钮即可。


## 更新
直接将新版本的文件覆盖到扩展安装目录即可。


## 编译
``` sh
npm run build:chrome-ext
```


### 截图
总览  
![](screenshots/summary.jpg)  

角色  
![](screenshots/roles.jpg)  

角色分组  
![](screenshots/roles-grouped-by-rarity.jpg)  

深境螺旋  
![](screenshots/abyss.jpg)  
