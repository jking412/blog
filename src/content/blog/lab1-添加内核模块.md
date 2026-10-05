---
title: lab1-添加内核模块
description: 以题目一为例进行内核模块编程： 题目1： 1. 设计一个模块，要求列出系统中所有内核线程的程序名、PID、进程状态、进程优先级、父进程的PID。 2. 设计一个带参数的模块，其参数为某个进程的PID号，模块的功能是列出该进程的家族信息，包括父进程、兄弟进程和子进程的程序名、PID号、进程状态。具体参
date: 2023-10-17T12:13:02+08:00
tags:
  - linux
categories:
  - hdu-os-lab
legacyPath: /2023/10/17/lab1-添加内核模块/
---

以题目一为例进行内核模块编程：

> 题目1：
> 1. 设计一个模块，要求列出系统中所有内核线程的程序名、PID、进程状态、进程优先级、父进程的PID。
> 2. 设计一个带参数的模块，其参数为某个进程的PID号，模块的功能是列出该进程的家族信息，包括父进程、兄弟进程和子进程的程序名、PID号、进程状态。具体参见教材P336

环境: `ubuntu22`

# 认识内核模块编程的基本框架

```c
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
// 初始化函数
static int hello_init(void)
{

    return 0;
}
// 清理函数
static void hello_exit(void)
{
}

// 函数注册
module_init(hello_init);  
module_exit(hello_exit);  

// 模块许可申明
MODULE_LICENSE("GPL");  
```
有下述几个问题需要注意：
1. 三个头文件必须引入
2. 必须注册初始化和退出函数
3. 必须有模块许可申明

此外，需要注意的是在内核中`我们不能使用用户态函数，也就是说我们不能适用诸如printf,strlen等函数，需要使用专门的内核函数`

下面是Makefile模板，下面是最基本，也是最常用的模板，其中为一要注意的问题是`obj-m的名字需要与编写内核代码文件的名字对应，也就是说这里obj-m是module1.o，你的.c文件的名字应该是module1.c`
```Makefile
obj-m:=module1.o    
KDIR:= /lib/modules/$(shell uname -r)/build
PWD:= $(shell pwd) 

default:
	$(MAKE) -C $(KDIR) M=$(PWD) modules  
clean:
	$(MAKE) -C $(KDIR) M=$(PWD) clean
```
# 编程打印进程信息

## 第一小题

代码比较简单，先放在这里
```c
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/sched.h>
#include <linux/init_task.h>

// 初始化函数
static int hello_init(void)
{
    pr_alert("list start !\n");
    struct task_struct *p;
    printk(KERN_ALERT"名称\t进程号\t状态\t优先级\t父进程号");
    int kernel_thread_num = 0;
    for_each_process(p)
    {
        if(p->mm == NULL){ //内核线程的mm成员为空
            kernel_thread_num++;
            pr_info("%s\t%d\t%ld\t%d\n",p->comm,p->pid, p->stats,p->rt_priority,p->parent->pid);
        }
    }
    pr_info("kernel thread num is %d\n",kernel_thread_num);
    return 0;
}
// 清理函数
static void hello_exit(void)
{
}

// 函数注册
module_init(hello_init);  
module_exit(hello_exit);  

// 模块许可申明
MODULE_LICENSE("GPL");  
```

介绍一下一些函数:
1. pr_info,pr_alert...：用于内核打印	
2. for_each_process：通过遍历init_task(0号进程对应的进程标识符)来遍历所有内核线程 
```c
#define for_each_process(p) \
    for (p = &init_task ; (p = next_task(p)) != &init_task ; )
```

这里最后打印了内核线程的数量，我们可以通过linux命令简单验证，我们通过内核线程的组id为0这一特点计算内核线程数量
```shell
$ ps -e -o pgid | awk '$1 == 0' | wc -l
```

易比较得到一致的结果

## 第二小题
第二小题也不难，主要是对内核提供的一些宏的应用

```c
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/sched.h>
#include <linux/init_task.h>

static pid_t  pid = 1;
module_param(pid,int,0644);

// 初始化函数
static int hello_init(void)
{
    pr_alert("list start !\n");
    struct task_struct *task = pid_task(find_get_pid(pid), PIDTYPE_PID);
    struct task_struct *parent = task->parent;
    struct task_struct *sibling;
    struct list_head *list;
    // List it own process
    pr_info("Root: Name: %s, PID: %d, State: %ld\n",task->comm,task->pid,task->stats);

    // List parent process
    pr_info("Parent: Name: %s, PID: %d, State: %ld\n", parent->comm, parent->pid, parent->stats);

    // List child processes
    list_for_each(list, &task->children) {
        sibling = list_entry(list, struct task_struct, sibling);
        pr_info("Child: Name: %s, PID: %d, State: %ld\n", sibling->comm, sibling->pid, sibling->stats);
    }

    // List sibling processes
    list_for_each(list, &parent->children) {
        sibling = list_entry(list, struct task_struct, sibling);
        if (sibling != task) {
            pr_info("Sibling: Name: %s, PID: %d, State: %ld\n", sibling->comm, sibling->pid, sibling->stats);
        }
    }
    return 0;
}
// 清理函数
static void hello_exit(void)
{
}

// 函数注册
module_init(hello_init);  
module_exit(hello_exit);  

// 模块许可申明
MODULE_LICENSE("GPL");  
```
还是简单介绍一下：
1. module_param(name,type,perm)：声明模块的名字，分别为变量名，变量类型和权限
2. list_for_each：一个用于帮助遍历的宏
3. list_entry：用于帮助类型转换
