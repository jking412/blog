---
title: Dosbox和masm搭建汇编环境
description: 学习汇编语言之前，需要有一个环境来运行汇编代码，所以此文记录下自己的环境搭建过程 下载Dosbox和masm Dosbox提供32位机环境，masm负责编译汇编代码 Doxbox下载地址 Dos官网 点击Download下载即可 接下来安装masm https://github.com/xDarkL
date: 2022-12-26T10:43:39+08:00
tags: []
categories: []
legacyPath: /2022/12/26/Dosbox和masm搭建汇编环境/
---

学习汇编语言之前，需要有一个环境来运行汇编代码，所以此文记录下自己的环境搭建过程

# 下载Dosbox和masm

Dosbox提供32位机环境，masm负责编译汇编代码

Doxbox下载地址

[Dos官网](https://www.dosbox.com/download.php?main=1)

![image-20221226105031616](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221226105031616.png)

点击Download下载即可

接下来安装masm

https://github.com/xDarkLemon/DOSBox_MASM/tree/master

下载解压以后我们只需要这个masm文件夹

# 配置Dosbox

接下来我们需要把masm配置到Dosbox中，我们打开`DOSBox 0.74-3 Options.bat`文件

![image-20221226105813360](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221226105813360.png)

在文件的底部加入如下内容，把`D:\1Packages\Debug`换成`你自己masm文件夹所在位置`，此外我们在相同目录下可以新建一个asm目录作为工作目录

```shell
MOUNT F  D:\1Packages\Debug
set PATH=%PATH%;F:\masm;
F:
cd F:\ASM
```

![image-20221226110006515](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221226110006515.png)

意思是把本机的`D:\1Packages\Debug`目录挂载到`Dosbox的F盘`，这样我们就可以在Dosbox下的F盘直接使用masm命令了

这样就配置完成了，如果觉得窗口太小，我们可以使用`alt+enter`来使得窗口全屏，再次按下退出全屏。
