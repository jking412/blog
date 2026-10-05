---
title: 搭建riscv32环境
description: hdu给我们提供的虚拟机非常庞大，而且放在百度网盘上:yum:，极大的占用了我们的时间，金钱还有本地空间，虽然不清楚学校的虚拟机到底提供了多少东西，但实际上riscv32所需的环境并不算太多，既然如此，为什么不在本地自己搭建一个呢？ 以下操作均在ubuntu 22.04下执行。 要搭建环境，我们需要
date: 2023-06-03T12:47:23+08:00
tags:
  - linux
  - riscv
categories:
  - hdu
legacyPath: /2023/06/03/搭建riscv32环境/
---

hdu给我们提供的虚拟机非常庞大，而且放在百度网盘上:yum:，极大的占用了我们的时间，金钱还有本地空间，虽然不清楚学校的虚拟机到底提供了多少东西，但实际上riscv32所需的环境并不算太多，既然如此，为什么不在本地自己搭建一个呢？

以下操作均在`ubuntu 22.04`下执行。

要搭建环境，我们需要编译riscv32的环境和运行riscv32的环境，下面我们就分两个部分来搭建环境。

# riscv-gnu-tool

在实验中我们需要riscv32的汇编，反汇编等操作，这一部分的环境由riscv-gnu-tool提供，这一部分的工具我们可以直接下载。

https://github.com/riscv-collab/riscv-gnu-toolchain/releases/tag/2023.06.02

![image-20230603132556554](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230603132556554.png)

下载解压后即可

# qemu模拟器

我们通过qemu来提供riscv32的运行环境，首先我们下载qemu的源代码

```shell
$ wget https://download.qemu.org/qemu-8.0.2.tar.xz
$ tar xvJf qemu-8.0.2.tar.xz
```

下载一些依赖

```shell
sudo apt install autoconf automake autotools-dev curl libmpc-dev libmpfr-dev libgmp-dev \
                 gawk build-essential bison flex texinfo gperf libtool patchutils bc \
                 zlib1g-dev libexpat-dev git \
                 libglib2.0-dev libfdt-dev libpixman-1-dev \
                 libncurses5-dev libncursesw5-dev
```

创建一个build输出目录，最后的可执行文件会放在build目录下

```shell
$ mkdir build
$ cd qemu-8.0.2
$ ./configure --target-list=riscv32-linux-user --prefix=${build所在位置}
$ make
$ make install
```

等待编译完成，我们进入build目录

```shell
$ cd ../build/bin
```

写一个hello.c测试我们的环境

```c
#include <stdio.h>

int main(){
	printf("Hello World");
    return 0;
}
```

```shell
$ riscv32-unknown-elf-gcc hello.c -o hello
$ ./qemu-riscv32 hello
```

看到输出就成功啦:sunglasses:

```
Hello World
```





