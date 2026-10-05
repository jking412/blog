---
title: Dockerfile中CMD和ENTRYPOINT的区别
description: CMD和ENTRYPOINT的功能看起来比较类似，但是两者还是存在一些区别。 容器启动命令的构成 我们可以通过docker ps查看容器的启动信息 可以通过COMMAND字段查看到容器的启动命令为/app/web 实际上COMMAND由ENTRYPOINT+CMD构成 我们在docker run后默
date: 2023-09-14T19:41:16+08:00
tags: []
categories: []
legacyPath: /2023/09/14/Dockerfile中CMD和ENTRYPOINT的区别/
---

CMD和ENTRYPOINT的功能看起来比较类似，但是两者还是存在一些区别。

# 容器启动命令的构成
我们可以通过`docker ps`查看容器的启动信息
```
CONTAINER ID   IMAGE            COMMAND      CREATED       STATUS               PORTS     NAMES
e77a3d7d7014   helloworld:1.0   "/app/web"   2 hours ago   Exited (2) 2 hours ago             competent_wescoff
```
可以通过`COMMAND`字段查看到容器的启动命令为`/app/web`

实际上`COMMAND由ENTRYPOINT+CMD`构成

我们在`docker run`后默认跟随的参数为`CMD`的部分，如果要修改`ENTRYPOINT`需要显式增加`--entrypoint`参数
```shell
$ docker run --entrypoint ls helloworld -a
CONTAINER ID   IMAGE        COMMAND   CREATED          STATUS                      PORTS     NAMES
106fc4a8833b   helloworld   "ls -a"   22 seconds ago   Exited (0) 22 seconds ago             boring_feynman

```
可以看到启动命令被更改

# 通过Dockerfile配置启动命令
ENTRYPOINT和CMD除了可以在启动时配置以外，我们还可以在Dockerfile中配置，但是`命令行的优先级是大于Dockerfile`的

配置的方式有两种
```Dockerfile
FROM alpine

WORKDIR /app
COPY web /app/web

ENTRYPOINT ["ls"]
CMD ["-a"]
```
我们运行上述镜像，可以发现启动命令为`ls -a`，我们可以通过命令行替换ENTRYPOINT或者CMD部分
```shell
$ docker run helloworld -l
```
可以发现启动命令为`ls -l`，ENTRYPOINT的替换就不再演示

第二种和第一种类似，主要是说明exec和Shell执行方式的区别
```Dockerfile
FROM alpine

WORKDIR /app
COPY web /app/web

ENTRYPOINT ls -a
```
如果我们执行上面的镜像，我们会发现启动命令变成了`/bin/sh -c ls -a`

也就说如果我们不使用`[]`，那么docker会用`/bin/sh -c`的方式执行，也就是shell执行，但是如果加上[]，会通过exec系统调用执行，`在大多数情况下，推荐使用第一种，也就是exec方式`

# 结合使用CMD和ENTRYPOINT
可以发现ENTRYPOINT通常指定核心命令，也是我们不希望用户修改的部分，而CMD则通常配置成参数部分，合理配合这两个部分可以让Docker镜像更加灵活