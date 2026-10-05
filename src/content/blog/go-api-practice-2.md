---
title: (二)集成gin
description: 开始前的准备 - gin go get github.com/gin-gonic/gin 编码 构建main函数 main.go 我们会在bootstrap包中的SetupRoute()中初始化router，下面我们去完成这个函数 初始化router bootstrap/route.go regis
date: 2022-08-22T07:32:36+08:00
tags:
  - go
categories: []
legacyPath: /2022/08/22/go-api-practice-2/
---






# 开始前的准备

- gin

`go get github.com/gin-gonic/gin`

# 编码

### 构建main函数

`main.go`

```go
package main

import (
   "fmt"
   "github.com/gin-gonic/gin"
)

func main() {
   router := gin.New()

   bootstrap.SetupRoute(router)

   err := router.Run(":3000")
   if err != nil {
      fmt.Println(err)
   }
}
```

 我们会在`bootstrap`包中的`SetupRoute()`中初始化`router`，下面我们去完成这个函数

### 初始化router

`bootstrap/route.go`

```go
package bootstrap

import (
   "github.com/gin-gonic/gin"
   "go-api-practice/routes"
   "net/http"
)

func SetupRoute(router *gin.Engine) {
   registerGlobalMiddleware(router)
   routes.RegisterAPIRoutes(router)
   setup404Handler(router)
}

func registerGlobalMiddleware(router *gin.Engine) {
   router.Use(
      gin.Recovery(),
      gin.Logger(),
   )
}

func setup404Handler(router *gin.Engine) {
   router.NoRoute(func(c *gin.Context) {
      c.JSON(http.StatusNotFound, gin.H{
         "error_code":    404,
         "error_message": "页面不存在",
      })
   })
}
```

> registerGlobalMiddleware()

`registerGlobalMiddleware(router *gin.Engine)`，在这个函数中我们去注册需要使用的中间件，这里我们使用gin自带的中间件即可，此外`setup404Handler(router *gin.Engine)`设置了`404`时的返回结果。

> gin.H

```go
type H map[string]any
type any = interface{}
```

可以看到`gin.H`是一个`map[string]interface{}`类型，借助于`gin.H`我们可以快速的构建想要返回的JSON数据

到这里我们就配置好了我们的`gin.Engine`，接下来我们在`routes`包下的`api.go`中注册路由

### 注册路由

`routes/api.go`

```go
package routes

import (
   "github.com/gin-gonic/gin"
   "net/http"
)

func RegisterAPIRoutes(router *gin.Engine) {
   v1 := router.Group("/v1")

   v1.GET("/", func(c *gin.Context) {
      c.JSON(http.StatusOK, gin.H{
         "hello": "world",
      })
   })
}
```

在这里我们通过路由组的形式去控制API的版本，我们可以通过这种方式来很方便的管理不同版本的API

### 测试

通过Apifox来测试一下这两个API

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20220821221623020.png)

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20220821221648095.png)

设置好之后运行，如果结果和我们预期一致，那么就成功了

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20220821221946788.png)

如果你测试失败了，可能是默认的环境端口错了，你可以在测试环境中进行配置

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20220821222149668.png)

