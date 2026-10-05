---
title: GDB快速入门
description: GDB全称GNU symbolic debugger，诞生于GNU计划，是一款程序调试器，如果脱离IDE环境，GDB将会是你强大的帮手。 GDB下载和使用 在windows环境中只要下载过C语言应该就会有GDB，这里主要介绍linux环境，也很简单 调试一个程序，例如我们现在要调试可执行程序a.ou
date: 2023-01-01T15:17:06+08:00
tags: []
categories: []
legacyPath: /2023/01/01/gdb快速入门/
---

GDB全称GNU symbolic debugger，诞生于GNU计划，是一款程序调试器，如果脱离IDE环境，GDB将会是你强大的帮手。

# GDB下载和使用

在windows环境中只要下载过C语言应该就会有GDB，这里主要介绍linux环境，也很简单

```shell
# centos
$ sudo yum install gdb
# ubuntu
$ sudo apt install gdb
# 其它系统类似
```

调试一个程序，例如我们现在要调试可执行程序`a.out`

```shell
$ gdb a.out
```

此外，如果我们要调试一个C语言的程序，我们需要在gcc编译时增加`-g`选项，这个选项告诉编译器添加调试信息

```shell
$ gcc -g main.c
```

# GDB调试常用命令

下面是一些常用的命令，括号里面是命令的缩写，使用两者都可以

## run（r）

启动程序，如果有断点则运行至第一断点，如果没有则运行到结束

## next（n）

让程序往下执行一步

## list（l）

列出程序源代码及其行号

## break（b）

给程序打断点，可以给某一行打断点，也可以给一个函数打断点

```shell
$ b 行号
$ b 函数名
```

## info（i）

查看调试信息，可以查看断点

```shell
$ i b
```

## continue（c）

向下执行到下一个断点

## print（p）

打印变量信息

# 调试core文件

core文件是内存的映象，当程序崩溃的时候，core文件保存了内存的状态，用于调试。由于core文件略大，默认被限制生成。

我们可以解除这个限制

```shell
$ ulimit -c unlimited
```

我们可以写一段会导致崩溃的程序

```c
#include<stdio.h>
int main(){
    int *a = NULL;
    *a = 1; 
    return 0;
}
```

崩溃后产生core文件，我这里是`core.2197`，用GDB调试

```shell
$ gdb a.out core.2197
```

我们可以直接看到崩溃的地方

```
Program terminated with signal 11, Segmentation fault.
#0  0x00000000004004dd in main () at a.c:4
4           *a = 1;
```

ok，这就是GDB的简单使用了
