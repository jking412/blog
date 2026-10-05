---
title: 解决Ubuntu24安装搜狗输入法失败
description: ​ 新安装了Ubuntu24之后，无法成功安装搜狐输入法，原因是Ubuntu24使用的是fcitx5，版本过新，最简单的办法就是卸载fcitx5，安装老fcitx 然后剩下的内容按照搜狐官网的安装教程安装即可 https://pinyin.sogou.com/linux/help.php
date: 2025-03-09T11:38:31+08:00
tags: []
categories: []
legacyPath: /2025/03/09/解决Ubuntu24安装搜狐输入法失败/
---

​	新安装了Ubuntu24之后，无法成功安装搜狐输入法，原因是Ubuntu24使用的是fcitx5，版本过新，最简单的办法就是卸载fcitx5，安装老fcitx

```bash
sudo apt remove fcitx5 fcitx5-chinese-addons fcitx5-module-chttrans fcitx5-module-fullwidth fcitx5-module-punctuation
sudo apt install fcitx fcitx-data
```

然后剩下的内容按照搜狐官网的安装教程安装即可

https://pinyin.sogou.com/linux/help.php
