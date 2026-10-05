---
title: 在linux上安装wireshark
description: wireshark是一款很好用的抓包工具，它可以安装在windows,linux,macos等平台上，在这个教程中，会告诉你如何安装wireshark在ubuntu上 用apt安装wireshark 可以直接使用apt安装wireshark，但是这样无法安装新版本，所以最好先手动添加仓库 安装时你可
date: 2023-10-10T10:29:28+08:00
tags:
  - wireshark
  - linux
categories: []
legacyPath: /2023/10/10/在linux上安装wireshark/
---

wireshark是一款很好用的抓包工具，它可以安装在windows,linux,macos等平台上，在这个教程中，会告诉你如何安装wireshark在ubuntu上

# 用apt安装wireshark

可以直接使用apt安装wireshark，但是这样无法安装新版本，所以最好先手动添加仓库

```shell
$ sudo add-apt-repository ppa:wireshark-dev/stable
$ sudo apt update
$ sudo apt install wireshark
```
安装时你可能会遇到这个选项，让你是否允许非root用户抓包，选择"是"

![20231010103445](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/20231010103445.png)

如果没有这个选项出现，可以执行一下命令
```shell
$ sudo dpkg-reconfigure wireshark-common
```

之后我们需要把我们的用户添加到wireshark用户组
```shell
$ sudo usermod -aG wireshark $(whoami)
```

然后重启机器就可以使用wireshark了