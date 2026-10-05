---
title: (五)完成验证手机和邮箱是否存在接口
description: 开始前的准备 简单好用的go验证包，可以自定义验证规则和错误信息 创建controller app/http/controllers/api/v1/baseapicontroller.go 和前面一样，先创建一个Controller基类 app/http/controllers/api/v1/aut
date: 2022-08-27T09:57:58+08:00
tags:
  - go
categories: []
legacyPath: /2022/08/27/go-api-practice-5/
---

# 开始前的准备

```shell
$ go get github.com/thedevsaddam/govalidator
```

简单好用的go验证包，可以自定义验证规则和错误信息

# 创建controller

`app/http/controllers/api/v1/base_api_controller.go`

```go
type BaseController struct {
}
```

和前面一样，先创建一个Controller基类

`app/http/controllers/api/v1/auth/signup_controller.go`

```go
type SignupController struct {
   v1.BaseController
}

func (sc *SignupController) IsPhoneExist(c *gin.Context) {

   request := requests.SignupPhoneExistRequest{}

   if err := c.ShouldBindJSON(&request); err != nil {
      c.AbortWithStatusJSON(http.StatusUnprocessableEntity, gin.H{
         "error": err.Error(),
      })

      fmt.Println(err.Error())

      return
   }

   errs := requests.ValidateSignupPhoneExist(&request, c)

   if len(errs) > 0 {
      c.AbortWithStatusJSON(http.StatusUnprocessableEntity, gin.H{
         "error": errs,
      })
      return
   }

   c.JSON(http.StatusOK, gin.H{
      "exist": user.IsPhoneExist(request.Phone),
   })
}

func (sc *SignupController) IsEmailExist(c *gin.Context) {

   // 初始化请求对象
   request := requests.SignupEmailExistRequest{}

   // 解析 JSON 请求
   if err := c.ShouldBindJSON(&request); err != nil {
      // 解析失败，返回 422 状态码和错误信息
      c.AbortWithStatusJSON(http.StatusUnprocessableEntity, gin.H{
         "error": err.Error(),
      })
      // 打印错误信息
      fmt.Println(err.Error())
      // 出错了，中断请求
      return
   }

   // 表单验证
   errs := requests.ValidateSignupEmailExist(&request, c)
   // errs 返回长度等于零即通过，大于 0 即有错误发生
   if len(errs) > 0 {
      // 验证失败，返回 422 状态码和错误信息
      c.AbortWithStatusJSON(http.StatusUnprocessableEntity, gin.H{
         "errors": errs,
      })
      return
   }

   //  检查数据库并返回响应
   c.JSON(http.StatusOK, gin.H{
      "exist": user.IsEmailExist(request.Email),
   })
}
```

部分验证包中的结构体和相关函数还未创建

控制器中的逻辑：

1. 解析前端的数据到用户模型
2. 验证这些数据是否符合规范
3. 从数据库检查数据是否已经存在

> ShouldBindJSON

把上下文中的json信息解析到结构体中

# 创建验证函数

`app/requests/signup_request.go`

```go
type SignupPhoneExistRequest struct {
   Phone string `json:"phone,omitempty" valid:"phone"`
}

func ValidateSignupPhoneExist(data interface{}, c *gin.Context) map[string][]string {
   // 自定义验证规则
   rules := govalidator.MapData{
      "phone": []string{"required", "digits:11"},
   }

   // 自定义验证出错时的提示
   messages := govalidator.MapData{
      "phone": []string{
         "required:手机号为必填项，参数名称 phone",
         "digits:手机号长度必须为 11 位的数字",
      },
   }

   // 配置初始化
   opts := govalidator.Options{
      Data:          data,
      Rules:         rules,
      TagIdentifier: "valid", // 模型中的 Struct 标签标识符
      Messages:      messages,
   }

   // 开始验证
   return govalidator.New(opts).ValidateStruct()
}
```

定制自己所需的验证信息，最后返回的错误信息保存在一个map中

验证邮箱的代码与验证手机类似

```go
type SignupEmailExistRequest struct {
   Email string `json:"email,omitempty" valid:"email"`
}

func ValidateSignupEmailExist(data interface{}, c *gin.Context) map[string][]string {

   // 自定义验证规则
   rules := govalidator.MapData{
      "email": []string{"required", "min:4", "max:30", "email"},
   }

   // 自定义验证出错时的提示
   messages := govalidator.MapData{
      "email": []string{
         "required:Email 为必填项",
         "min:Email 长度需大于 4",
         "max:Email 长度需小于 30",
         "email:Email 格式不正确，请提供有效的邮箱地址",
      },
   }

   // 配置初始化
   opts := govalidator.Options{
      Data:          data,
      Rules:         rules,
      TagIdentifier: "valid", // 模型中的 Struct 标签标识符
      Messages:      messages,
   }

   // 开始验证
   return govalidator.New(opts).ValidateStruct()
}
```

通过这两个例子，我相信你可以大致理解这个包的用法，还是要提醒一点，在模仿代码过程中细节还是很容易出错的，你可以看看有没有以下问题

- `&`
- `:`
- `大小写`

​	...

# 分配路由

```go
v1 := router.Group("/v1")
{ //这个大括号是为了让结构更加清晰
    v1.GET("/", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "hello": "world",
        })
    })
    authGroup := v1.Group("/auth")
    { //这个大括号也是为了让结构更加清晰
        suc := new(auth.SignupController)

        authGroup.POST("/signup/phone/exist", suc.IsPhoneExist)
        authGroup.POST("/signup/email/exist", suc.IsEmailExist)
    }
}
```

# 测试

我们在apifox中创建这两个auth文件夹，然后把这两个接口都放在其中

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20220827093243047.png)

这是一个长度只有10位的错误手机号，请求结果如下

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20220827093623168.png)

我们向末尾多添加一个0，结果如下

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20220827093723445.png)

之后我们可以在数据库中手动创建包含这个手机号的用户然后再尝试，这些测试就交给你们自己了

- 创建数据后尝试
- 请求邮箱接口

