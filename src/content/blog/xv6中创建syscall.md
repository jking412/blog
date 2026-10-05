---
title: xv6系统启动——bootloader
description: 我们以在xv6中添加一个date系统调用为例，介绍在xv6中添加系统调用的方法和原理。 date syscall介绍 date系统调用可以获取系统当前的UTC时间。 在我们完成date系统调用后，我们利用这个系统调用做一个小小的工具，可以打印当前的系统时间，工具代码如下： date.c 变量r是我们
date: 2023-09-08T16:20:47+08:00
tags: []
categories: []
legacyPath: /2023/09/08/xv6中创建syscall/
---

我们以在xv6中添加一个date系统调用为例，介绍在xv6中添加系统调用的方法和原理。

# date syscall介绍

date系统调用可以获取系统当前的UTC时间。

在我们完成date系统调用后，我们利用这个系统调用做一个小小的工具，可以打印当前的系统时间，工具代码如下：

`date.c`

```c
#include "types.h"
#include "user.h"
#include "date.h"

int
main(int argc, char *argv[])
{
  struct rtcdate r;

  if (date(&r)) {
    printf(2, "date failed\n");
    exit();
  }

  // your code to print the time in any format you like...

  exit();
}
```

变量`r`是我们获取到的时间，我们可以通过r打印我们想要的时间格式，结构体r的内容如下：

```c
struct rtcdate {
  uint second;
  uint minute;
  uint hour;
  uint day;
  uint month;
  uint year;
};
```

# 添加系统调用

首先要注意的是，我们要添加一个系统调用，我们需要在好多地方添加对应的代码，我们很容易遗忘。因此，我们可以借鉴xv6中已经写好的系统调用，`uptime`系统调用是一个很好的例子。

```shell
$ grep -n uptime *.[hcS]
syscall.c:105:extern int sys_uptime(void);
syscall.c:121:[SYS_uptime]  sys_uptime,
syscall.h:15:#define SYS_uptime 14
sysproc.c:83:sys_uptime(void)
user.h:25:int uptime(void);
usys.S:31:SYSCALL(uptime)
```

我们不难发现我们要在六个地方添加对应的代码，那么加下来的事情就是照葫芦画瓢即可。

1. ```c
   extern int sys_uptime(void);
   extern int sys_date(void);
   ```

2. ```c
   static int (*syscalls[])(void) = {
   [SYS_fork]    sys_fork,
   ...
   [SYS_close]   sys_close,
   [SYS_date]    sys_date,
   };
   ```

3. ```c
   #define SYS_close  21
   #define SYS_date   22
   ```

4. `sysproc.c`的内容我们留着后面完成

5.   ```c
   int uptime(void);
   int date(struct rtcdate*);
   ```

6. ```
   SYSCALL(uptime)
   SYSCALL(date)
   ```

第四部分的内容是系统调用的具体实现，我们在这里需要借助于系统`lapic.c`中给我们提供的`cmostime`函数，这个函数接受一个 `struct rtcdate`指针，将时间赋值到其中，此外，参数我们也需要借助于xv6提供的argptr来获取。

```c
int
date(void)
{
    struct rtcdate *r;
    if(argptr(0, (void*)&r, sizeof(struct rtcdate)) < 0)
        return -1;
    cmostime(r);
    return 0;
}
```

# 执行过程分析

1. 我们在使用这个系统调用在用户态的形式，这个函数被定义在`user.h`中。只需要引入`user.h`我们就可以使用系统调用。

2. 这个系统调用使用汇编实现的，当然，这个实现比较简单，我们在传入参数之后，我们在`%eax`寄存器中传入我们需要使用的系统调用号，然后使用`int`指令即可。这个实现在`usys.S`中。

```c
#define SYSCALL(name) \
  .globl name; \
  name: \
    movl $SYS_ ## name, %eax; \
    int $T_SYSCALL; \
    ret

SYSCALL(fork)
SYSCALL(exit)
SYSCALL(wait)
SYSCALL(pipe)
...
```

3. 关于`movl $SYS_ ## name, %eax;`在C语言中，两个`#`表示字符串拼接，以fork为例，这里的指令实际上是`movl $SYS_ fork, %eax;`，还记得我说`%eax`要传入系统调用号吗，那么`SYS_fork`是怎么转变成正确的系统调用号的呢，在`syscall.h`中：

```c
#define SYS_fork    1
#define SYS_exit    2
#define SYS_wait    3
#define SYS_pipe    4
#define SYS_read    5
#define SYS_kill    6
#define SYS_exec    7
#define SYS_fstat   8
```

这样，在预编译后，指令就是（fork为例），`movl 1,%eax`。

4. 然后，`int`指令会陷入内核，具体的细节我们暂不关系，接下来，我们会执行`syscall.c`中的`syscall`函数

```c
void
syscall(void)
{
  int num;
  struct proc *curproc = myproc();

  num = curproc->tf->eax;
  if(num > 0 && num < NELEM(syscalls) && syscalls[num]) {
    curproc->tf->eax = syscalls[num]();
  } else {
    cprintf("%d %s: unknown sys call %d\n",
            curproc->pid, curproc->name, num);
    curproc->tf->eax = -1;
  }
}
```

可以看到核心函数：

```c
curproc->tf->eax = syscalls[num]();
```

其中num是系统调用号，那么syscalls是什么呢，也是在这个文件中，内容如下：

```c
static int (*syscalls[])(void) = {
[SYS_fork]    sys_fork,
[SYS_exit]    sys_exit,
...
[SYS_write]   sys_write,
[SYS_mknod]   sys_mknod,
[SYS_unlink]  sys_unlink,
[SYS_link]    sys_link,
[SYS_mkdir]   sys_mkdir,
[SYS_close]   sys_close,
[SYS_date]    sys_date,
};
```

是不是巧妙地利用了C语言的宏。

5. 最后，（还是以fork为例），我们会发现系统会执行`sys_fork`函数，这个函数被定义在`sysproc.c`中（事实上可以被定义在任何位置）

```c
int
sys_fork(void)
{
  return fork();
}
```

可以发现有意思的一点，系统调用调用到最后竟然还是调用`fork`？！这个fork已经和前面的fork完全不同了，现在的fork是一个内核中的函数，被定义在`proc.c`中，前面的过程事实上都可以理解为对内核函数的包装，通过上面的一系列过程，我们最终实现了在用户态`"调用"`内核中函数。

> 可以发现date也是同理，date系统调用最终是调用了`cmostime`函数。不过看起来fork系统调用由于用户态和内核态有着相同的名字看起来更加有趣。

# 将date工具加入到xv6中

我们现在已经完成了我们的系统调用，最后我们只需要`make`编译即可，`make`会帮助我们把`date.c`编译成`_date`二进制文件。最后，在编译之前，我们需要把`_date`加入到`Makefile`的`UPROGS`中，这样命令才能生效。

到这里我们就成功为xv6添加了一个系统调用，用利用这个系统调用制作了一个打印的时间的工具。

> tips：分清楚系统调用和shell 命令
>
> `date.c和_date`是我们利用date系统调用制作的，我们要注意我们在xv6 shell中使用的date命令是`_date`二进制文件调用的结果，而不是直接使用系统调用

```makefile
UPROGS=\
	_cat\
	_echo\
	_forktest\
	_grep\
	_init\
	_kill\
	_ln\
	_ls\
	_mkdir\
	_rm\
	_sh\
	_stressfs\
	_usertests\
	_wc\
	_zombie\
	_date\
```

```shell
$ make
$ make qemu
```

