---
title: ubuntu美化macos主题
description: 最近突然想美化一下自己ubuntu的风格，想试一试macos风格的ubuntu，本博客记录这次的美化过程。 视频参考： https://www.bilibili.com/video/BV1gT411m7FF/?spmidfrom=333.337.search-card.all.click 此外先下载
date: 2023-06-08T17:23:20+08:00
tags:
  - ubuntu
categories: []
legacyPath: /2023/06/08/ubuntu美化macos主题/
---

最近突然想美化一下自己ubuntu的风格，想试一试macos风格的ubuntu，本博客记录这次的美化过程。

视频参考：

https://www.bilibili.com/video/BV1gT411m7FF/?spm_id_from=333.337.search-card.all.click

此外先下载一下需要的文件：

https://sky-public-resource.oss-cn-hangzhou.aliyuncs.com/ubunmac.zip

下面是美化过程

```shell
$ sudo apt update && sudo apt upgrade
$ sudo apt install gnome-tweaks gnome-shell-extensions -y
```

打开火狐浏览器，在插件搜索`gnome shell`并安装

![image-20230609082608796](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230609082608796.png)

然后进入`gnome`插件下载网址下载gnome插件

https://extensions.gnome.org/

下载插件

- `User Themes`

解压之前下载的`WhiteSur-gtk-theme-master.zip`

进入到目录执行以下命令

```shell
$ ./install.sh -t all -N glassy -s 220
$ sudo ./tweaks.sh -g
```

然后在家目录下新建`.icons`目录，将`Mkos-Big-Sur-master`文件解压到目录下。

进入到`设置外观`，修改配置如下

![image-20230609085510969](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230609085510969.png)

然后打开菜单，打开优化，设置如下

![image-20230609085931409](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230609085931409.png)

![image-20230609090010154](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230609090010154.png)

重新回到我们的`gnome`插件网页，下载如下插件

- `Blur my shell`

  修改配置如下

  ![image-20230609090224061](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230609090224061.png)

- `frippery move clock`
- `lock screen background  `

再更换桌面壁纸为压缩包中的图片

接下来执行命令

```
sudo nautilus
```

进入到`/usr/share/plymouth/themes`

修改`default.plymouth`中的配置

`WatermarkVerticalAlignment=.5`



