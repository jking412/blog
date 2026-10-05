---
title: linux搭建dosbox环境
description: dosbox能够让我们在现代os上使用早期dos环境。 dos环境下的汇编是比较友好的，dos本身简单的机制也有利于我们对系统有初步的理解。 下面我们来在linux环境中搭建dosbox和其汇编环境。 安装dosbox 我们直接使用包管理工具安装dosbox即可。 安装完成以后我们需要修改一些配置。
date: 2023-06-29T07:56:36+08:00
tags:
  - linux
categories: []
legacyPath: /2023/06/29/linux搭建dosbox环境/
---

dosbox能够让我们在现代os上使用早期dos环境。

dos环境下的汇编是比较友好的，dos本身简单的机制也有利于我们对系统有初步的理解。

下面我们来在linux环境中搭建dosbox和其汇编环境。

# 安装dosbox

我们直接使用包管理工具安装dosbox即可。

```shell
$ sudo apt install dosbox # ubuntu
```

安装完成以后我们需要修改一些配置。

我们需要挂载一个宿主机的位置到dosbox的d盘，这样可以实现两者之间文件的互通。

我们找到dosbox的配置文件`~/.dosbox/dosbox-[version].conf`，添加如下内容：

```
mount d 需要被挂载的位置
d:    
```

# 汇编环境搭建

在本博客中我们使用nasm来作为编译器。

我们先下载nasm和debug工具，点击下面的链接下载。

https://sky-public-resource.oss-cn-hangzhou.aliyuncs.com/nasm-dos.tar.gz

下载完成以后我们将压缩包中的内容解压到我们挂载的目录，这样就大功告成了。
