---
title: swaggo的使用
description: swag是一个为Go语言生成文档的框架，主要有两个部分组成 - swag命令行工具，用于把Go注释生成为对应的Swagger2.0文档 - 为多种流行框架准备的插件，可以帮助我们快速嵌入Swag 快速开始(以gin为例) 下载和使用swag命令行工具 如果不能使用记得检查一下你的${GOPATH}/
date: 2022-11-17T20:34:59+08:00
tags:
  - swaggo
  - go
categories: []
legacyPath: /2022/11/17/swaggo的使用/
---

swag是一个为Go语言生成文档的框架，主要有两个部分组成

- swag命令行工具，用于把Go注释生成为对应的Swagger2.0文档
- 为多种流行框架准备的插件，可以帮助我们快速嵌入Swag

# 快速开始(以gin为例)

## 下载和使用swag命令行工具

```shell
$ go install github.com/swaggo/swag/cmd/swag@latest
```

如果不能使用记得检查一下你的`${GOPATH}/bin`目录是否加入了环境变量，接下来我们加上Go注释，main()函数中的内容我们暂且不需要管，在你的main.go中加入上面的注释部分就可以了，如果你不想把注释放在main.go的位置，后面使用swag命令行工具的过程中需要带上相关的参数

```go
// @title           Swagger Example API
// @version         1.0
// @description     This is a sample server celler server.
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.url    http://www.swagger.io/support
// @contact.email  support@swagger.io

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8080
// @BasePath  /api/v1

// @securityDefinitions.basic  BasicAuth
func main() {
    r := gin.Default()

    c := controller.NewController()

    v1 := r.Group("/api/v1")
    {
        accounts := v1.Group("/accounts")
        {
            accounts.GET(":id", c.ShowAccount)
            accounts.GET("", c.ListAccounts)
            accounts.POST("", c.AddAccount)
            accounts.DELETE(":id", c.DeleteAccount)
            accounts.PATCH(":id", c.UpdateAccount)
            accounts.POST(":id/images", c.UploadAccountImage)
        }
    //...
    }
    r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
    r.Run(":8080")
}
//...
```

生成swag的docs目录，目录中包含了swag文档中的所有信息

```shell
$ swag init
```

![image-20221117204850694](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221117204850694.png)

如果你的注释在其它地方，加上-g参数

```shell
$ swag init -g <filepath>
```

然后我们可以使用swag的fmt命令来格式化我们的注释，当然，这不是必须的

```shell
$ swag fmt
```

## 整合gin

下载相关包

```shell
$ go get -u github.com/swaggo/swag/cmd/swag
```

然后，在给swagger分配路由的文件中加上对应的包，分配路由的代码如下所示

```go
r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
```

就是你想把这行代码放在什么位置，就把对应的包引入。这里切记，一定要导入的docs文件，否则swagger将会找不到数据！

```go
import "github.com/swaggo/gin-swagger" // gin-swagger middleware
import "github.com/swaggo/files" // swagger embed files
import _"project-name/docs" // 导入你的docs文件

// 通过下面这个方式给swagger文档分配路由
// 访问/swagger/index.html
r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
```

最后访问`/swagger/index.html`就可以生效了

## 给API添加注释

我们简单看个例子

```go
// ListAccounts godoc
// @Summary      List accounts
// @Description  get accounts
// @Tags         accounts
// @Accept       json
// @Produce      json
// @Param        q    query     string  false  "name search by q"  Format(email)
// @Success      200  {array}   model.Account
// @Failure      400  {object}  httputil.HTTPError
// @Failure      404  {object}  httputil.HTTPError
// @Failure      500  {object}  httputil.HTTPError
// @Router       /accounts [get]
func (c *Controller) ListAccounts(ctx *gin.Context) {
  q := ctx.Request.URL.Query().Get("q")
  accounts, err := model.AccountsAll(q)
  if err != nil {
    httputil.NewError(ctx, http.StatusNotFound, err)
    return
  }
  ctx.JSON(http.StatusOK, accounts)
}
```

更多的例子大家自己去读官方文档，我就不具体介绍了，这里要提一句，注释和对应的函数之间不能有空行，否则不会给这个函数生成文档

[swaggo/swag](https://github.com/swaggo/swag)
