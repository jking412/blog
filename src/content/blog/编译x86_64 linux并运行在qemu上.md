---
title: 编译x86_64 linux并运行在qemu上
description: 本节内容将会告诉你如何自己编译内核并且将这个内核运行在qemu模拟器上。在成功运行之后，我们可以自由的修改并验证我们的内核，以下操作均在Ubntun 22.04下完成。 在开始之前我们有一些需要注意的东西： 1. 在编译过程中，你会遇到各种各样的环境问题，造成的原因可能是多样的，尤其是在遇到这样比较
date: 2023-06-02T20:32:52+08:00
tags:
  - linux
  - qemu
categories: []
legacyPath: /2023/06/02/编译x86_64 linux并运行在qemu上/
---

本节内容将会告诉你如何自己编译内核并且将这个内核运行在qemu模拟器上。在成功运行之后，我们可以自由的修改并验证我们的内核，以下操作均在`Ubntun 22.04`下完成。

在开始之前我们有一些需要注意的东西：

1. 在编译过程中，你会遇到各种各样的环境问题，造成的原因可能是多样的，尤其是在遇到这样比较复杂的任务时，所以你现在最好就做好长时间作战的心理准备，`更重要的是会自己使用搜索引擎`（还在用baidu的赶紧埋了:sob:），不要想着跟着做就能解决问题，下面我列出了一些高频的环境问题，当你遇到问题时可以回头过来看看：
   - 当你在编译内核时出现编译错误，大概率是缺少某个包，这个时候去网上搜索，安装对应的包一般就能解决问题了。
   - 粗心导致的错误，这是一个漫长的过程，你极有可能在某一步输错了内容而导致整个内容的崩坏，这个一般难以检查，只能更加细心，尽量使用复制而不是自己输入。
   - ......
2. 不要完全相信教程，一方面是教程本身的问题，一方面是我们的环境并不完全相同。

为了完成我们的目标，我们需要编译完成三个项目：

1. linux：提供内核
2. qemu：提供模拟环境
3. busybox：提供根文件系统和一些基本的系统工具

下面我们一步一步来

# linux

我们去下面这个网站下载linux源码

https://github.com/torvalds/linux

为了使遇到环境问题的可能性尽可能小，我们下载与我们当前系统版本相似的内核，用`uname -r`查看内核版本

![image-20230602153004363](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230602153004363.png)

可以看到我的linux内核版本是5.19，我们选择和和自己内核版本相同的linux源码，选择tag以后下载

![image-20230602153140796](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230602153140796.png)

我们先安装一些会用到的包（大概率是不够的）

```shell
$ sudo apt install autoconf automake autotools-dev curl libmpc-dev libmpfr-dev libgmp-dev \
                 gawk build-essential bison flex texinfo gperf libtool patchutils bc \
                 zlib1g-dev libexpat-dev git \
                 libglib2.0-dev libfdt-dev libpixman-1-dev \
                 libncurses5-dev libncursesw5-dev libelf-dev
```

下载完成后我们先创建一个总文件夹，名字可以随意，我这里就叫`hdu-os-lab`了，我们将linux源码解压到总文件夹下，然后进入linux文件夹，开始编译。

第一步创建x64默认的配置文件

```shell
$ make ARCH=x86_64 x86_64_defconfig
```

![image-20230602153618577](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230602153618577.png)



第二步进行进一步配置，默认即可

```shell
$ make ARCH=x86_64 menuconfig
```

进入到这个页面后`Save`然后`Exit`即可，如果出现报错大概率是你的终端太小了（物理），不足以容纳配置页面，将你的终端拉大一点就行了。

![image-20230602153843373](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230602153843373.png)

第三部正式开始编译，这一部时间略久，5-10分钟左右（作者机子上）

```shell
make bzImage -j$(nproc) # -j 表示开启多线程编译，nproc是cpu的数量
```

![image-20230602163737358](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230602163737358.png)

显示`ready`内核就编译好了

# qemu

qemu的部分有两种方法，第一种方法是用包管理工具直接安装，第二种方式是自己编译，在本文采用了后者，这里还是推荐大家使用前者。

## 直接安装

- **Arch:** `pacman -S qemu`
- **Debian/Ubuntu:** `apt-get install qemu`
- **Fedora:** `dnf install @virtualization`
- **Gentoo:** `emerge --ask app-emulation/qemu`
- **RHEL/CentOS:** `yum install qemu-kvm`
- **SUSE:** `zypper install qemu`

## 自己编译

下载源码，在本文中使用了`8.0.0`版本

https://www.qemu.org/download/#source

```shell
$ mkdir qemu-x64
$ cd ../qemu-8.0.0
$ ./configure --target-list=x86_64-softmmu --prefix=${qemu-x64所在目录} # 可执行文件最后会被放在这个目录下面
$ make
$ make install
```

下面是每个步骤成功的截图

```shell
$ ./configure --target-list=x86_64-softmmu --prefix=${qemu-x64所在目录}
```

![image-20230602185718930](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230602185718930.png)

```shell
$ make
```

![image-20230602190638011](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230602190638011.png)

```shell
$ make install
```

![image-20230602190805645](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230602190805645.png)

然后把`qemu-x64下的bin目录`导出（export导出的环境变量只在当前shell有效），你也可以把环境变量写到`.bashrc`文件中

```shell
export PATH="$PATH:{qemu-x64的bin目录}"
```

# busybox

到了现在不知道你是不是已经经历了很多折磨:innocent:，再坚持坚持，这里是最后一个部分了。

源码：

https://github.com/mirror/busybox

下载完后进入目录

```shell
$ make menuconfig
```

`Settings -> Build Options -> Build static binary (no shared libs)`

（按空格选择，按回车进入）

选完`Exit`然后保存即可

![image-20230602192335841](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230602192335841.png)

```shell
$ make 
$ make install
```

![image-20230602192540669](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230602192540669.png)



好了，到目前三个部分的编译就大功告成了!

# 制作根文件系统

按照下面的顺序执行命令

```shell
# 如果想要在系统中包含动态库，这里要需要改为2g
$ qemu-img create rootfs.img  1g
$ mkfs.ext4 rootfs.img
$ mkdir rootfs
$ sudo mount -o loop rootfs.img  rootfs
$ cd rootfs
$ sudo cp -r ../busybox/_install/* .
$ sudo mkdir proc sys dev etc etc/init.d
$ cd etc/init.d/
$ sudo touch rcS
$ sudo vi rcS

# rcS 的内容如下：
---------------------
#!/bin/sh
mount -t proc none /proc
mount -t sysfs none /sys
/sbin/mdev -s
---------------------

$ sudo chmod +x rcS
$ cd ../../../
$ sudo umount rootfs
```

# 启动x86_64 qemu模拟器

```shell
$ qemu-system-x86_64 -kernel linux-5.19/arch/x86/boot/bzImage -boot c -m 2048M -hda rootfs.img -append "root=/dev/sda rw console=ttyS0,115200 acpi=off nokaslr" -serial stdio -display none
```

![image-20230602194750613](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230602194750613.png)

如果到了这里，我终于可以恭喜你成功辣:stuck_out_tongue_closed_eyes:

# 体验x86_64环境

（其实没什么可体验的，因为本机就是x64:confused:）

```shell
$ sudo mount rootfs.img rootfs
# 进入到rootfs编写hello.c
$ sudo vim hello.c
---
#include <stdio.h>

int main(){
    printf("Hello World!");
    return 0;
}
---
# 使用静态编译，因为我们创建的系统中没有复制动态库
$ sudo gcc -static hello.c -o static-hello
# 我们启动我们的qemu模拟器
$ ./static-hello
```

![image-20230602203056031](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230602203056031.png)

如果你想要运行动态链接的可执行文件，那么需要你复制必须的动态库，如果你前面创建的是2g的映像，直接复制动态库即可，下面我假设你创建的是1g的映像，我们先创建一个新的映像。

```shell
$ qemu-img create rootfs-lib.img 2g
$ mkfs.ext4 rootfs-lib.img
$ mkdir rootfs-lib
$ sudo mount rootfs-lib.img rootfs-lib
$ sudo mount rootfs.img rootfs
$ sudo cp -r rootfs/* rootfs-lib
$ cd rootfs-lib
$ sudo mkdir lib lib64
$ sudo cp -r /lib/x86_64-linux-gnu lib
$ sudo cp /lib64/ld-linux-x86-64.so.2 lib64/ld-linux-x86-64.so.2
$ sudo gcc hello.c -o hello
$ cd ..
$ sudo umount rootfs-lib
$ sudo umount rootfs
$ qemu-system-x86_64 -kernel linux-5.19/arch/x86/boot/bzImage -boot c -m 2048M -hda rootfs-lib.img -append "root=/dev/sda rw console=ttyS0,115200 acpi=off nokaslr" -serial stdio -display none
```

![image-20230602210005168](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230602210005168.png)

完结撒花:cherry_blossom:

