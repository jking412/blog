---
title: 记录一次双系统linux未删除干净导致系统无法正常启动
description: 由于自己电脑的磁盘总共只有512G，能分配给双系统linux的空间实际上不会太多，所以我决定将其删除，安装到1T大小SSD的U盘上，但是删除以后由于linux的分区信息还存在，所以开机以后将进入grub，正常开机只能通过进入BIOS，或许也可以调正分区的启动顺序，但是我的电脑并不可以。 下面记录一下
date: 2023-09-21T10:27:37+08:00
tags: []
categories: []
legacyPath: /2023/09/21/记录一次双系统linux未删除干净导致系统无法正常启动/
---

由于自己电脑的磁盘总共只有512G，能分配给双系统linux的空间实际上不会太多，所以我决定将其删除，安装到1T大小SSD的U盘上，但是删除以后由于linux的分区信息还存在，所以开机以后将进入grub，正常开机只能通过进入BIOS，或许也可以调正分区的启动顺序，但是我的电脑并不可以。

下面记录一下如何彻底删除linux信息。

# 通过diskpart彻底删除linux
先通过命令行打开diskpart
```shell
$ diskpart
$ list disk
```
选择`windows所在的磁盘`，然后查看分区
```
$ select disk 0 # 根据你的具体情况选择
$ list partition
```
然后选择`system`分区，把他挂载出来
```shell
$ select partition 1
assign letter=J
```
然后我们就可以在`我的电脑`中打开，找到`J盘`,进入到其中，删除linux的文件夹即可。