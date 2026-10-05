---
title: lab2-编译内核并添加系统调用
description: 在开始之前，请现配置好基本的环境，请你先完成下面博客中的qemu和busybox部分 因为内核需要添加系统调用，我们需要重新编译。 本实验均在ubuntu 22.04下进行，编译的内核版本是5.19（低版本内核会在添加系统调用时略有不同）。 添加系统调用 1. linux-5.19/arch/x86
date: 2023-06-02T22:26:59+08:00
tags:
  - linux
categories:
  - hdu-os-lab
legacyPath: /2023/06/02/lab2-编译内核并添加系统调用/
---

在开始之前，请现配置好基本的环境，请你先完成下面博客中的qemu和busybox部分

[编译x86_64 linux并运行在qemu上](/2023/06/02/%E7%BC%96%E8%AF%91x86_64%20linux%E5%B9%B6%E8%BF%90%E8%A1%8C%E5%9C%A8qemu%E4%B8%8A/)

因为内核需要添加系统调用，我们需要重新编译。

本实验均在`ubuntu 22.04`下进行，编译的内核版本是`5.19`（低版本内核会在添加系统调用时略有不同）。

# 添加系统调用

1. 

`linux-5.19/arch/x86/entry/syscalls/syscall_64.tbl`

![image-20230602230645731](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230602230645731.png)

添加

```
335	64	mysetnice		sys_mysetnice
```

2. 

`linux-5.19/include/linux/syscalls.h`

![image-20230602231000337](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230602231000337.png)

添加

```c
asmlinkage long sys_mysetnice(pid_t pid, int flag, int nicevaluse, void __user* prio, void __user* nice);
```

3. 

`linux-5.19/kernel/sys.c`

![image-20230602231154502](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230602231154502.png)

在最后一个`#endif`前加上下面的代码

```c
// 置于sys.c的最末端（在‘#endif’之前
SYSCALL_DEFINE5(mysetnice, pid_t, pid, int, flag, int, nicevalue, void __user *,
prio, void __user *, nice) {
    int cur_prio, cur_nice;
    struct pid *ppid;
    struct task_struct *pcb;
    int res;

    // 通过进程PID号找到进程的PID结构体，如果ppid为空指针则代表不存在与进程号与pid相同的进程，此时返回EFAULT（
    // 我编译的时候这个if判断并没有加进去，想做出上述判断的可以将注释删去，就逻辑本身而言没有问题-_-
    // 但我无法保证最后是否会出问题，因为我没有自己尝试过
    ppid = find_get_pid(pid);
    /*
    if (ppid == NULL)
        return EFAULT;
    */

    // 通过进程的PID结构体，找到与之对应的进程控制块
    pcb = pid_task(ppid, PIDTYPE_PID);

    // 如果flag=1则修改进程的nice值为nicevalue
    if (flag == 1) {
    set_user_nice(pcb, nicevalue);
    }  // flag既不为1也不为0的时候，即flag出错，此时返回EFAULT
    else if (flag != 0) {
    return EFAULT;
    }

    // 获取进程当前的最新nice值和prio值
    cur_prio = task_prio(pcb);
    cur_nice = task_nice(pcb);

    // 由于系统调用是在内核态下运行的，所有数据均为内核空间的数据，
    // 利用copy_to_user()函数将内核空间的数据复制到用户空间
    res = copy_to_user(prio, &cur_prio, sizeof(cur_prio));
    res = copy_to_user(nice, &cur_nice, sizeof(cur_nice));

    return 0;
}
```

# 编译内核

内核的编译步骤与[编译x86_64 linux并运行在qemu上](/2023/06/02/%E7%BC%96%E8%AF%91x86_64%20linux%E5%B9%B6%E8%BF%90%E8%A1%8C%E5%9C%A8qemu%E4%B8%8A/)的编译步骤相同，不予介绍。

# 测试添加的系统调用

qemu请务必使用带动态链接库的根文件系统

```shell
$ sudo mount rootfs-lib.img rootfs-lib
$ cd rootfs-lib
$ sudo vim sys-demo.c
```

内容如下：

```c
#include "unistd.h"
#include "sys/syscall.h"
#include "stdio.h"
#define _SYSCALL_MYSETNICE_ 335
#define EFALUT 14

int main()
{
    int pid, flag, nicevalue;
    int prev_prio, prev_nice, cur_prio, cur_nice;
    int result;

    printf("Please input variable(pid, flag, nicevalue): ");
    scanf("%d%d%d", &pid, &flag, &nicevalue);
    
    result = syscall(_SYSCALL_MYSETNICE_, pid, 0, nicevalue, &prev_prio,
                     &prev_nice);
    if (result == EFALUT)
    {
        printf("ERROR!");
        return 1;
    }
    
    if (flag == 1)
    {
        syscall(_SYSCALL_MYSETNICE_, pid, 1, nicevalue, &cur_prio, &cur_nice);
        printf("Original priority is: [%d], original nice is [%d]\n", prev_prio,
               prev_nice);
        printf("Current priority is : [%d], current nice is [%d]\n", cur_prio,
               cur_nice);
    }
    else if (flag == 0)
    {
        printf("Current priority is : [%d], current nice is [%d]\n", prev_prio,
               prev_nice);
    }
    
    return 0;
}
```

```shell
$ sudo gcc sys-demo.c -o sys-demo
$ cd ..
$ qemu-system-x86_64 -kernel linux-5.19/arch/x86/boot/bzImage -boot c -m 2048M -hda rootfs-lib.img -append "root=/dev/sda rw console=ttyS0,115200 acpi=off nokaslr" -serial stdio -display none
```

启动qemu之后启动`sys-demo`即可

![image-20230602232324866](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230602232324866.png)







