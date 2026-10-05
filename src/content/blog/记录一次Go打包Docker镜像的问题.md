---
title: 记录一次Go打包Docker镜像的问题
description: 在Linux环境下编译好Go源文件以后我尝试将最后的可执行文件复制到Docker镜像alpine中。 这是一个最简单的Go Web代码 以及对应的Dockerfile 在最后运行容器时始终出现了file not found的警告，容器一直启动失败，我尝试通过exec进入到容器内部查看文件，发现文件确
date: 2023-09-14T19:18:30+08:00
tags:
  - Go
categories: []
legacyPath: /2023/09/14/记录一次Go打包Docker镜像的问题/
---

在Linux环境下编译好Go源文件以后我尝试将最后的可执行文件复制到Docker镜像`alpine`中。
这是一个最简单的Go Web代码
```Go
package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	var r = gin.Default()

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, "pong")
	})

	r.GET("/produce", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"msg":   "ok",
			"goods": "apple",
		})
	})

	if err := r.Run(":3000"); err != nil {
		panic("start error")
	}
}
```
以及对应的Dockerfile
```Dockerfile
FROM alpine

WORKDIR /app
COPY web /app/web

CMD ["/app/web"]
```
在最后运行容器时始终出现了`file not found`的警告，容器一直启动失败，我尝试通过exec进入到容器内部查看文件，发现文件确实拷贝到了正确的位置，但是我在容器中无法使用`./web`之类的方式启动。

那看来是可执行文件本身的问题，很快发现默认情况下Go编译处的可执行文件是需要动态链接，而`alpine是一个相当轻量的Linux，其本身并不包括动态链接所需要的文件，所以我们要使用静态链接`

找到问题之后我们只要静态编译即可
```shell
$ CGO_ENABLED=0 go build -a -ldflags '-extldflags "-static"' .
```
最后再次重新构建发现问题果然解决