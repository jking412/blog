---
title: (六)封装验证器
description: 开始前的准备 抽离公共部分代码 抽离验证函数中的公共部分 我们发现再验证手机号码和邮箱的过程中很多代码是类似的，所以我们可以把它们抽离出来重复使用 app/requests/signuprequest.go 我们发现这个部分是完全一致的 app/requests/requests.go 这里把这一段
date: 2022-08-27T09:58:01+08:00
tags:
  - go
categories: []
legacyPath: /2022/08/27/go-api-practice-6/
---

# 开始前的准备

# 抽离公共部分代码

### 抽离验证函数中的公共部分

我们发现再验证手机号码和邮箱的过程中很多代码是类似的，所以我们可以把它们抽离出来重复使用

`app/requests/signup_request.go`

```go
// 配置初始化
opts := govalidator.Options{
   Data:          data,
   Rules:         rules,
   TagIdentifier: "valid", // 模型中的 Struct 标签标识符
   Messages:      messages,
}

// 开始验证
return govalidator.New(opts).ValidateStruct()
```

我们发现这个部分是完全一致的

`app/requests/requests.go`

```go
func validate(data interface{}, rules govalidator.MapData, messages govalidator.MapData) map[string][]string {
   ops := govalidator.Options{
      Data:          data,
      Rules:         rules,
      TagIdentifier: "valid",
      Messages:      messages,
   }
   return govalidator.New(ops).ValidateStruct()
}
```

这里把这一段代码单独取了出来，要注意这个`validate`是小写字母开头的，是一个私有函数，待会我们会创建一个共有的`Validate`函数以供控制器使用

### 修改原来的代码

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

   return validate(data, rules, messages)
}

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

   return validate(data, rules, messages)
}
```

把公共部分修改即可，接下来我们来抽离控制器中的公共部分

### 抽离控制器的公共部分

`app/http/controllers/api/v1/auth/signup_controller.go`

```go
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
```

我们将会把这一段代码抽离

`app/requests/requests.go`

```go
type ValidateFunc func(interface{}, *gin.Context) map[string][]string

func Validate(c *gin.Context, obj interface{}, handler ValidateFunc) bool {
   if err := c.ShouldBind(obj); err != nil {
      c.AbortWithStatusJSON(http.StatusUnprocessableEntity, gin.H{
         "message": "数据格式错误",
         "error":   err.Error(),
      })
      fmt.Println(err.Error())
      return false
   }

   errs := handler(obj, c)

   if len(errs) > 0 {
      c.AbortWithStatusJSON(http.StatusUnprocessableEntity, gin.H{
         "message": "上传的数据格式出错",
         "error":   errs,
      })
      return false
   }

   return true
}
```

这里用`type`定义了一个新的类型来处理不同的验证要求

接下来再修改控制器中的代码就非常整洁了

`app/http/controllers/api/v1/auth/signup_controller.go`

```go
type SignupController struct {
   v1.BaseController
}

func (sc *SignupController) IsPhoneExist(c *gin.Context) {

   request := requests.SignupPhoneExistRequest{}

   if ok := requests.Validate(c, &request, requests.ValidateSignupPhoneExist); !ok {
      return
   }

   c.JSON(http.StatusOK, gin.H{
      "exist": user.IsPhoneExist(request.Phone),
   })
}

func (sc *SignupController) IsEmailExist(c *gin.Context) {

   // 初始化请求对象
   request := requests.SignupEmailExistRequest{}

   if ok := requests.Validate(c, &request, requests.ValidateSignupEmailExist); !ok {
      return
   }

   //  检查数据库并返回响应
   c.JSON(http.StatusOK, gin.H{
      "exist": user.IsEmailExist(request.Email),
   })
}
```

这个时候相当有必要再用之前再apifox创建好的接口再来请求一次来确定你的重构是否成功，这种环节很容易出问题，到了后面再修改就没那么简单了，这是个好习惯，在每部分完成你都可以这样取验证你的代码是否可以跑通。

验证成功那么重构就完成了，在我们写代码的过程中，经常的重构是有必要的，在项目开始时，代码量并不大，我们可以轻松的维护，但是加入我们不再初期就对这些有可能变得臃肿的代码进行一些可能的组织，代码很快就会变得难以维护。

