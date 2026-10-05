---
title: 在u盘中安装ubuntu
description: 你是否因为经常使用不同的电脑，但是编程环境不同而苦恼呢，今天的文章会教你把ubuntu装入移动固态中，现在SSD的价格已经很便宜了，这里我会用1T的移动固态为例，教会你如何将ubuntu装入移动其中（同时支持UEFI和BIOS）。 在开始之前，有几点需要提醒： 1. 操作不当可能会导致数据损失，严重
date: 2023-06-01T20:41:56+08:00
tags:
  - ubuntu
  - 装机
categories: []
legacyPath: /2023/06/01/在u盘中安装ubuntu/
---

你是否因为经常使用不同的电脑，但是编程环境不同而苦恼呢，今天的文章会教你把ubuntu装入移动固态中，现在SSD的价格已经很便宜了，这里我会用1T的移动固态为例，教会你如何将ubuntu装入移动其中（同时支持UEFI和BIOS）。

在开始之前，有几点需要提醒：

1. 操作不当可能会导致数据损失，严重的操作失误甚至可能破坏你的电脑，所以要慎重操作。
2. 每一步都要经可能谨慎的操作，一个粗心可能就会导致前功尽弃。
3. 建议有一定基础的人来完成。

# 使用Vmware

首先安装vmware，https://www.vmware.com/cn/products/workstation-pro/workstation-pro-evaluation.html

虽然是收费的，但是网上激活码简直不要太多，这里自己搜索解决。

（如果之前没有使用虚拟机或者安装系统的经验接下来操作要更加小心）

在安装完成之后，我们用管理员权限打开vmware（在左下角的搜索栏中找到vmware，右键点击后用管理员打开），创建虚拟机，除了下面出现的内容，其他的都选择默认即可。

1. 选择稍后安装操作系统，我们需要后面自定义的配置

![image-20230531205214087](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/img/image-20230531205214087.png)

2. 使用物理磁盘，也就是u盘，这里一定要有管理员权限



![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/img/image-20230531205235908.png)

3. 选择物理磁盘，选择你u盘的盘符，注意，这里一定不要选错，一般是最后一个。

   实在不确定通过这里的教程查看https://jingyan.baidu.com/article/0f5fb09923fde06d8334ea35.html

![image-20230531205235908](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/img/image-20230531205330556.png)

4. 在虚拟机设置中选择UEFI

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/img/image-20230531205417235.png)

5. 选择提前下好磁盘印象文件

   下载url：https://cn.ubuntu.com/

![image-20230531210821564](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/img/image-20230531210821564.png)

6. 配置好之后启动虚拟机，静静的等待，默认方式启动之后选择try ubuntu，我们先不要下载

​	进入ubuntu之后下载gparted分区工具

​	（如果启动失败报错u盘被占用，尝试关闭各类应用，重启，格式化u盘等操作）

![image-20230531211732495](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/img/image-20230531211732495.png)

7. 接下来的操作操作会格式化u盘，请确保你的u盘的重要文件都被备份，创建gpt表

![image-20230531212108850](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/img/image-20230531212108850.png)

![image-20230531212125193](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/img/image-20230531212125193.png)

8. 分区，下面是分区的结果，我的空间比较大，分的奢侈了一点，我说明一下下面的分区

   - /dev/sda1: 依然作为u盘的空间，不想要当作u盘使用可以不要
   - /dev/sda2: linux主要空间，决定了你的linux操作系统占用的空间
   - /dev/sda3:  efi分区，100MB以上即可
   - /dev/sda4: 交换空间，这块区域在内存不足时会被用作虚拟内存，如果u盘空间小可以不要
   - 最后的空间安装grub，预留1M以上即可（所以说我分的比较随意，空间小的尽量不要浪费）

   分配好之后确认即可

![image-20230531212901951](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/img/image-20230531212901951.png)

9. 安装grub，按顺序输入以下内容

   ```shell
   sudo gdisk /dev/sdb
   n
   # 默认编号，回车就行
   # 默认开始位置，回车
   # 默认结束位置，回车
   EF02 # EF02 就是 bios_grub
   p # 看到 Name 有 BIOS boot partition 就可以了
   w
   y
   ```

   

![image-20230531213039722](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/img/image-20230531213039722.png)

安装之后结果如下

![image-20230531213104971](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/img/image-20230531213104971.png)

# 安装ubuntu

接下来点击桌面上的ubuntu install，在安装类型这一步选择其它选项

![image-20230531213250935](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/img/image-20230531213250935.png)

在进入到安装类型之后，要做三件事：

1. 将/dev/sda2挂载到`/`，选择格式化这个分区
2. 将/dev/sda3改为efi
3. 确认`安装启动引导器的设备为你的u盘`

![image-20230531213429677](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/img/image-20230531213429677.png)

完成后等待继续安装默认配置继续，等待ubuntu安装即可。

在安装完成之后，你的ubuntu就可以通过UEFI启动了（现在的计算机基本上是UEFI，所以如果你不想再折腾到这里就结束了），但是我们接下来还是支持一下BIOS启动。

# BIOS启动

我们将虚拟机关闭，将启动方式改为BIOS（与上面相同），启动之后还是选择try ubuntu

```shell
# 将你安装linux的分区挂载（在本博客中是sda2）
sudo mount /dev/sdaX /mnt
# 这里是你u盘的分区
sudo grub-install --target=i386-pc --recheck --boot-directory=/mnt/boot /dev/sda
```

如果没有错误报出，那么应该就成功了，用虚拟机尝试BIOS和UEFI启动看看是不是都可以正常启动。

如果都正常启动了，就大功告成了！

重启你的计算机，选择U盘启动就可以进入你安装的ubuntu了。

