---
title: (二)docker的基本使用
description: 在第一节的内容中，我们了解了docker的作用，以及完成了docker的安装和docker的hello world，初步进入了docker的时间，这一节内容会从docker的基本架构出发，讲解组成架构中组成部分的关系以及如何操作它们。 Docker的架构 接下来我会讲解docker的基本使用方式，在
date: 2022-12-17T09:43:24+08:00
tags: []
categories: []
legacyPath: /2022/12/17/docker的基本使用/
---

在第一节的内容中，我们了解了docker的作用，以及完成了docker的安装和docker的hello world，初步进入了docker的时间，这一节内容会从docker的基本架构出发，讲解组成架构中组成部分的关系以及如何操作它们。

# Docker的架构

接下来我会讲解docker的基本使用方式，在学习之前，我们先来看看docker的整体架构。

![c8116066bdbf295a7c9fc25b87755dfe](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/c8116066bdbf295a7c9fc25b87755dfe.png)

我们来看看docker的组成部分，首先docker是有一个客户端的，是一个C/S架构。

然后我们来看看docker最核心的部分——`容器`，`镜像`，`仓库`。我们之前说了docker把软件和环境打包到一起，那么这个打包的结果就是一个`镜像`，这个`镜像是一个模板`，如果我们要运行这个应用，docker会按照这个模板，生成一个`容器去运行这个应用`。

与创建一个虚拟机相对比，`镜像`就类似于`iso`文件，而`容器`就类似于`虚拟机`，镜像只是充当了一个不变的模板，而根据这个模板，我们可以运行任意数量的“容器”。

![image-20221217101801776](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221217101801776.png)

那么`仓库`这个概念也就好理解了，`仓库`就是用于存放`镜像`的，我们可以从仓库去下载我们需要的镜像，那么接下来我们就先从`容器`,`镜像`这两个方面来讲述docker的操作。

# 镜像的基本操作

基本操作无非是如何下载，如何查看，如何删除，先来看看镜像的查看。

```shell
$ docker images
```

我们之前运行过hello-world可以看到我们已经有了一个镜像，hello-world，一个镜像的信息包括它的`名字`，`标签`，`ID`，`创建时间`以及`镜像的大小`，镜像的ID用于唯一的标识每个镜像，在执行相关的操作可以用`镜像的ID来代替镜像的名字`。此外，我们可以看到hello-world这个镜像的大小十分轻量，只有十几KB。

```
REPOSITORY    TAG       IMAGE ID       CREATED         SIZE
hello-world   latest    feb5d9fea6a5   14 months ago   13.3kB
```

在用镜像的ID代替镜像名字时，我们可以只使用`镜像ID的前缀`，`只要这个前缀不存在于其它镜像中`，不会造成歧义，我们就可以`尽可能短`的使用ID前缀。

加入我们这个时候只有这一个镜像，那么现在有两种删除镜像的方式，用`名字指定`和用`ID指定`

```shell
$ docker rmi hello-world 
$ docker rmi f # 只有这一个镜像，采用ID的第一位也不会造成歧义,也就是feb5d9fea6a5的第一位，f
# 查看镜像，发现hello-world已经被删除了
$ docker images
```

大部分时候我们用ID的前两到三位就足以唯一标识一个镜像了，后面的镜像也存在类似的操作，事实上`docker images`这个命令展示给我们的ID也只是一个前缀。

现在我们已经删除了hello-world这个镜像，我们接下来把它重新下载回来。

下载镜像采用的是`docker pull`这个命令，一个镜像包括`镜像的名字`和`镜像的标签`，如果不带标签默认就是`lastest`这个标签。现在我们来下载`hello-world`，也就是`hello-world:lastest`这个镜像

```shell
$ docker pull hello-world
# 再次查看，发现hello-world已经下载完成
$ docker images
```

那么我们要如何查找我们需要的镜像呢，后面我在将仓库的时候会进行比较详细的介绍，现在先介绍使用docker命令的方式查找。

使用`docker search`来查看可以下载的镜像

```shell
$ docker search nginx
```

在找到镜像以后，就可以根据镜像的名字来下载我们需要的镜像了。

![image-20221217111216995](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221217111216995.png)

# 容器的基本操作

镜像是真正运行的软件，操作相对来说比镜像复杂些。

容器是真正才是真正运行的程序，所以如何运行一个容器显然是相当重要的，所以我们先来学着怎么运行一个容器，这个操作也很简单，以运行hello-world为例

```shell
$ docker run hello-world
# 当然，用镜像ID也是可以的
$ docker run f
```

这样就可以把hello-world这个镜像运行起来了，这个镜像完成的任务就是打印出一些提示信息。

还记得我们在上一篇文章中执行的docker run hello-world吗，那时我们并`没有提前拉取镜像`，但是依然`成功运行了容器`，我们不妨回顾一下docker的架构图，run这个命令在执行的时候会先查看`本地是否有这个镜像`，如果没有这个镜像，会先从`仓库拉取镜像然后再运行`。

运行成功容器以后，我们查看一下所有的容器。这里应该特别注意的是，当容器没有任务在执行的时候，docker会停止这个容器，hello-world这个镜像因为只有打印信息这个任务，所以完成以后容器就会被停止。`docker ps`只能查看`正在运行的容器`，如果要查看所有的容器，需要添加`-a`参数。

```shell
$ docker ps -a
```

我们可以看到容器的一些信息,包括`ID`，`名字`等信息，我们可以看到容器的名字是一个随机字符串，我们可以通过参数指定。

```
CONTAINER ID   IMAGE       COMMAND  CREATED          STATUS           		  PORTS  NAMES
2eeaafa5c921   hello-world "/hello" 3 seconds ago    Exited (0) 2 seconds ago        competent_poitras
```

因为hello-world这个镜像不具备持续运行的能力，所以我们接下来用`nginx`这个镜像作为案例继续教学，`-d`参数表示让这个容器在后台运行，`--name`可以指定这个容器的名字

```shell
$ docker pull nginx
$ docker run -d --name nginx nginx
$ docker ps
```

接下来我们来使用一下我们运行的nginx，nginx会`监听80端口`，所有我们去浏览器访问一下80端口

![image-20221217122353083](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221217122353083.png)

我们会发现访问失败了，这并不是运行失败了，这里涉及到一个网络的问题，暂且。之前说过，docker会把应用和它的环境打包在一起，这个打包后的运行的容器就类似于虚拟机，要知道，虚拟机与我们本机`并不会共享一个网络`，也就是说虽然nginx监听了80端口，但是它监听的实际上是`nginx这个容器内部的80端口`，为了验证这个说法，我们进入到nginx这个容器内部去一探究竟。

exec可以在容器内执行另外的程序，可以帮助我们进入到容器中，`-it`这个参数是给我们提供一个可以交互的shell，`/bin/bash`是在容器中执行的命令，执行下面这个命令以后我们就进入到了容器中。

```shell
$ docker exec -it nginx /bin/bash
```

进入到容器以后，我们尝试在容器中去访问80端口，看看nginx是否监听了80端口

```shell
$ curl localhost
```

响应如下，说明确实监听了容器内部的80端口。

```
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```

关于容器网络，我们放在之后的章节再详细介绍。

然后我们接着尝试去关闭，打开，删除这个容器，容器和镜像一样，都可以用`ID来代替名字`，这里就不尝试了

```shell
$ docker stop nginx
$ docker start nginx
# 删除之前要先关闭
$ docker stop nginx
$ docker rm nginx
```

最后，如果我们一定要在自己的主机上访问nginx的服务怎么办呢，我们可以把容器内部的端口映射到主机，采用`-p`参数可以帮助我们实现，后面的`80:80`表示`主机端口:容器内部端口`

```shell
# 先删除原来的容器
$ docker rm nginx
$ docker run -d -p 80:80 --name nginx
```

然后我们在浏览器中访问，大功告成

![image-20221217123851938](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221217123851938.png)

最后我来总结一下容器的常用操作

![image-20221217124243311](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221217124243311.png)

这一节介绍了容器和镜像的基本用法，但是我相信此时你们还对容器和镜像有着诸多的疑惑，例如镜像从何拉取，容器的网络是怎么回事，下一节我们继续深入介绍docker的使用。
