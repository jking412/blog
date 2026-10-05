---
title: (一)开启docker的旅程
description: 天下苦环境久矣 printf("Hello World!")，这也许是你学习C语言时打印的第一行语句，C语言作为大多数人的入门语言，Hello World开始了我们的代码生涯。对于过去初学的我们而言，要打印出这一行代码并不轻松，我们要安装一个集成开发环境，可能是CodeBlocks，可能是visua
date: 2022-12-16T11:34:36+08:00
tags:
  - docker
categories: []
legacyPath: /2022/12/16/从docker开启的旅程/
---

# 天下苦环境久矣

`printf("Hello World!")`，这也许是你学习C语言时打印的第一行语句，C语言作为大多数人的入门语言，Hello World开始了我们的代码生涯。对于过去初学的我们而言，要打印出这一行代码并不轻松，我们要安装一个集成开发环境，可能是CodeBlocks，可能是visual studio等等，有些可能会给我们安装好C语言的环境，有些则要自己安装或者是配置环境变量。可能我们千辛万苦安装好了运行环境，结果要运行一个项目，我们可能还需要下载这个项目所需要的依赖。不管具体的情况如何，`配置环境`，这短短的四个字可能将会在接下来的几年时间里一直折磨我们。

环境给我们带来了很大的痛苦，但我们显然不会就此认命，有了疼点，就会有相应的解决方案，我们手里可是握着代码的程序员。那么到底应该如何解决这个问题呢。在起初，我们首先解决的是依赖问题，对于各种语言，都有了自己对应的包（依赖）管理机制，例如`Java`的`Maven`，`javascript`的`npm`等，这些包管理工具记录了我们项目所需要的依赖，借助于这些工具，我们在下次运行这些程序时可以快速下载好所需要的依赖。依赖的问题看起来就解决了，但，真的如此吗？

问题很快出现，我们在下载依赖时，可能遇到包管理工具版本错误的问题，这些包管理工具本身就是一个个软件，为了配置安装这些软件，我们似乎又回到了起点。退一步说，包管理工具只能解决依赖的问题，一个语言所需要的运行环境还是需要我们自己去下载，包管理工具确实为我们的开发起到了很大的作用，但是它依然没有从根本上解决问题。

我们必须进一步深入这个问题，我们不妨重新思考依赖，从软件的角度来说，依赖确实是一个个包，但是如果我们换一个角度，其实一个程序上最本质上的依赖，是对当前`操作系统的依赖`。既然如此，我们为什么不直接把`软件连同操作系统`一起带过去呢。

怎么把操作系统和软件打包在一起呢，我们此时很容易想到一个技术——`虚拟化技术`，即使用虚拟机来打包我们的软件。但是问题就在于虚拟机太大了，一个linux系统可能相对小一些，只有几个G，但是如果是windows系统，数量很快会增长到几十个G，我们为了搬运一个软件的环境，花费如此大的代价，似乎是有些过了。

那么这个问题到底该如何解决，我们今天的主角——docker，给我们提供了一个方案。从虚拟化环境的角度来说，docker提供了与虚拟机类似的效果，但是docker创造的虚拟环境大小只有`几百MB`甚至只有`几十MB`！十分轻量！

docker，给了苦环境久矣的我们一抹希望。那么docker到底是如何解决这些问题，又是怎样使用的呢，且听我娓娓道来。

# Docker——把环境都装到箱子里

Docker，是一个容器化引擎。我们来看看它的定义，不难发现两个关键词，`容器`和`引擎`。那么引擎是什么呢，比如我们常说的汽车引擎，就是用于发动汽车的，那么容器化引擎，就是用于容器化的，也就是说，docker就是一个负责容器化的软件。

那么容器化是什么呢，这里我们先暂且不提容器的本质，我们先简单的理解为容器就是一个`轻量的"虚拟机"`，而docker，就是负责把软件和它对应的环境打包到一个容器里，也就是容器化。而打包好的环境，具有轻量且灵活的特点，就好像海上运送货物的集装箱一样，麻雀虽小，五脏俱全，docker把环境和软件都打包到了一样的一个箱子里。

Docker为什么可以实现如此轻量化，我们比对虚拟机和docker之间的工作原理，不难发现docker容器化出的应用都共享同一个操作系统，而虚拟机则是为每一个应用都虚拟化出了一个操作系统，两者的开销显然不在同一级别上。

![b734f7d91bda055236b3467bc16f6302](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/b734f7d91bda055236b3467bc16f6302.png)

# 启航，小鲸鱼！

介绍了这么多，不知道是否你对docker已经充满了好奇，是否已经摩拳擦掌准备好使用docker了呢，下面我就来简单介绍docker的使用。

Docker在各个平台都有安装的方式，如果有条件，最好使用linux系统，因为Docker的实现事实上是`依赖于linux系统`的，直接使用linux会有更加原生的体验，当然，如果手边暂时没有linux的环境可以使用或者对linux的操作还没有很熟悉，在其它操作系统上使用图形化的界面也是一个不错的入门方式。下面我会介绍centos，ubuntu和windows的docker安装方式。

## CentOS 中的安装

CentOS的安装比较简单，按照下面的步骤依次执行命令即可

```shell
$ sudo yum install -y yum-utils
$  sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo
$ sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

## Ubuntu中的安装

Ubuntu的安装也比较简单，按照顺序执行以下命令

```shell
$ sudo apt-get update
$ sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
$ sudo mkdir -p /etc/apt/keyrings
$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
$ echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
$ sudo apt-get update
$ sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

## 其它linux系统中的安装

如果是其它linux系统，docker官网都提供了较为详尽的安装方式，链接放在下面，按照自己的需求寻找即可。

[Docker在linux操作系统中的安装方式](https://docs.docker.com/engine/install/)

## Windows中的安装

相较于linux，Windows的安装则稍显麻烦，因为docker是的运行依赖于linux，所以我们必须先下载`wsl`，即`Windows Subsystem for Linux`，Windows中的linux子系统。

用管理员打开powershell，下载wsl，这个命令会帮你下好wsl，同时下载一个ubuntu，安装的内容比较大，这里可能要花费几十分钟的时间。

```shell
$ wsl --install
```

安装完成以后，你可以在它给你安装的ubuntu系统中按照上面提到的方法安装docker （笔者没有试过），也可以下载`docker desktop`，这边介绍下载`docker desktop的方法`

进入docker的官网，下载安装包，然后安装即可。

https://www.docker.com/

![image-20221216181845610](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221216181845610.png)

# 小鲸鱼，该干活了

现在，我们已经有了我们自己的小鲸鱼，下面我会简单的告诉你如何让小鲸鱼工作起来。

我们需要先启动我们的小鲸鱼，Windows只需要双击启动程序就可以了

```shell
$ sudo systemctl start docker
```

和学习别的语言一样，我们先来运行docker中的hello world

```shell
$ docker run hello-world
```

如果你看到打印了下面这一段文字，那么就代表docker安装成功了，也恭喜你成功运行了一个容器。

```text
Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/get-started/
```

到目前为止，我们已经安装好了docker并且运行了第一个容器，成功迈出了docker之旅的第一步，在下一个章节，我会详细介绍docker的使用方式。

