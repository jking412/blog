---
title: 制作iso镜像文件
description: 本教程会遵照El-Torito标准生成ISO文件。 编写内核文件 这里我们简单的写一个打印helloworld的汇编即可 我们编译上述文件 然后我们将内容放在新的位置 创建iso文件 最后我们可以用qemu或者vmware启动
date: 2023-08-15T16:41:35+08:00
tags:
  - linux
categories: []
legacyPath: /2023/08/15/制作iso镜像文件/
---

本教程会遵照**El-Torito**标准生成ISO文件。

# 编写内核文件

这里我们简单的写一个打印helloworld的汇编即可

```assembly
#define print(x) movb $0x0E, %ah; \
                 movb $(x), %al; \
                 int $0x10

.globl start
start:
    .code16
    cli
    cld

    print('H')
    print('e')
    print('l')
    print('l')
    print('o')
    print(' ')
    print('W')
    print('o')
    print('r')
    print('l')
    print('d')
    print('!')
```

我们编译上述文件

```shell
$ gcc -nostdinc -c -o boot.o boot.S
$ ld -N -e start -Ttext 0x7C00 -o boot.out boot.o
$ objcopy -S -O binary -j .text boot.out boot.out
```

然后我们将内容放在新的位置

```shell
$ mkdir -p prepared_for_iso/boot
$ cp boot.out prepared_for_iso/boot/loader.sys 
```

# 创建iso文件

```shell
$ xorriso -as mkisofs -R -J -c boot/bootcat \
          -b boot/loader.sys -no-emul-boot -boot-load-size 4 \
          -o ./bootable.iso ./prepared_for_iso
```

最后我们可以用qemu或者vmware启动

```shell
$ qemu-system-i386 -cdrom bootable.iso
```

