---
title: (十三)手机号发送短信验证码
description: 开始前的准备 编码开始 接受前端数据 app/requests/signuprequest.go 从前端接受到数据，为了满足我们的自定义需求，我们需要自己来拓展验证包 自定义规则 app/requests/validators/customrules.go 自定义验证器 app/requests/v
date: 2022-09-08T13:29:16+08:00
tags:
  - go
categories: []
legacyPath: /2022/09/08/go-api-practice-13/
---

# 开始前的准备

# 编码开始

## 接受前端数据

`app/requests/signup_request.go`

```go
type SignupUsingPhoneRequest struct {
   Phone           string `json:"phone,omitempty" valid:"phone"`
   VerifyCode      string `json:"verify_code,omitempty" valid:"verify_code"`
   Name            string `valid:"name" json:"name"`
   Password        string `valid:"password" json:"password,omitempty"`
   PasswordConfirm string `valid:"password_confirm" json:"password_confirm,omitempty"`
}

func SignupUsingPhone(data interface{}, c *gin.Context) map[string][]string {

   rules := govalidator.MapData{
      "phone":            []string{"required", "digits:11", "not_exists:users,phone"},
      "name":             []string{"required", "alpha_num", "between:3,20", "not_exists:users,name"},
      "password":         []string{"required", "min:6"},
      "password_confirm": []string{"required"},
      "verify_code":      []string{"required", "digits:6"},
   }

   messages := govalidator.MapData{
      "phone": []string{
         "required:手机号为必填项，参数名称 phone",
         "digits:手机号长度必须为 11 位的数字",
      },
      "name": []string{
         "required:用户名为必填项",
         "alpha_num:用户名格式错误，只允许数字和英文",
         "between:用户名长度需在 3~20 之间",
      },
      "password": []string{
         "required:密码为必填项",
         "min:密码长度需大于 6",
      },
      "password_confirm": []string{
         "required:确认密码框为必填项",
      },
      "verify_code": []string{
         "required:验证码答案必填",
         "digits:验证码长度必须为 6 位的数字",
      },
   }

   errs := validate(data, rules, messages)

   _data := data.(*SignupUsingPhoneRequest)
   errs = validators.ValidatePasswordConfirm(_data.Password, _data.PasswordConfirm, errs)
   errs = validators.ValidateVerifyCode(_data.Phone, _data.VerifyCode, errs)

   return errs
}
```

从前端接受到数据，为了满足我们的自定义需求，我们需要自己来拓展验证包

## 自定义规则

`app/requests/validators/custom_rules.go`

```go
package validators

import (
   "errors"
   "fmt"
   "github.com/thedevsaddam/govalidator"
   "go-api-practice/pkg/database"
   "strings"
)

func init() {

   // 自定义规则 not_exists，验证请求数据必须不存在于数据库中。
   // 常用于保证数据库某个字段的值唯一，如用户名、邮箱、手机号、或者分类的名称。
   // not_exists 参数可以有两种，一种是 2 个参数，一种是 3 个参数：
   // not_exists:users,email 检查数据库表里是否存在同一条信息
   // not_exists:users,email,32 排除用户掉 id 为 32 的用户
   govalidator.AddCustomRule("not_exists", func(field string, rule string, message string, value interface{}) error {
      rng := strings.Split(strings.TrimPrefix(rule, "not_exists:"), ",")

      // 第一个参数，表名称，如 users
      tableName := rng[0]
      // 第二个参数，字段名称，如 email 或者 phone
      dbFiled := rng[1]

      // 第三个参数，排除 ID
      var exceptID string
      if len(rng) > 2 {
         exceptID = rng[2]
      }

      // 用户请求过来的数据
      requestValue := value.(string)

      // 拼接 SQL
      query := database.DB.Table(tableName).Where(dbFiled+" = ?", requestValue)

      // 如果传参第三个参数，加上 SQL Where 过滤
      if len(exceptID) > 0 {
         query.Where("id != ?", exceptID)
      }

      // 查询数据库
      var count int64
      query.Count(&count)

      // 验证不通过，数据库能找到对应的数据
      if count != 0 {
         // 如果有自定义错误消息的话
         if message != "" {
            return errors.New(message)
         }
         // 默认的错误消息
         return fmt.Errorf("%v 已被占用", requestValue)
      }
      // 验证通过
      return nil
   })
}
```

## 自定义验证器

`app/requests/validators/custom_validators.go`

```go
func ValidatePasswordConfirm(password, passwordConfirm string, errs map[string][]string) map[string][]string {
   if password != passwordConfirm {
      errs["password_confirm"] = append(errs["password_confirm"], "两次输入密码不匹配！")
   }
   return errs
}

// ValidateVerifyCode 自定义规则，验证『手机/邮箱验证码』
func ValidateVerifyCode(key, answer string, errs map[string][]string) map[string][]string {
   if ok := verifycode.NewVerifyCode().CheckAnswer(key, answer); !ok {
      errs["verify_code"] = append(errs["verify_code"], "验证码错误")
   }
   return errs
}
```

## 完成控制器

`app/http/controllers/api/v1/auth/signup_controller.go`

```go
// SignupUsingPhone 使用手机和验证码进行注册
func (sc *SignupController) SignupUsingPhone(c *gin.Context) {

    // 1. 验证表单
    request := requests.SignupUsingPhoneRequest{}
    if ok := requests.Validate(c, &request, requests.SignupUsingPhone); !ok {
        return
    }

    // 2. 验证成功，创建数据
    _user := user.User{
        Name:     request.Name,
        Phone:    request.Phone,
        Password: request.Password,
    }
    _user.Create()

    if _user.ID > 0 {
        response.CreatedJSON(c, gin.H{
            "data": _user,
        })
    } else {
        response.Abort500(c, "创建用户失败，请稍后尝试~")
    }
}
```

> 添加create()方法

```go
// Create 创建用户，通过 User.ID 来判断是否创建成功
func (userModel *User) Create() {
    database.DB.Create(&userModel)
}
```

> 添加API

```go
authGroup.POST("/signup/email/exist", suc.IsEmailExist)
authGroup.POST("/signup/using-phone", suc.SignupUsingPhone)
```

## 测试

我们设置了可以跳过验证的特殊手机号，采用这个手机号来测试一下我们的接口

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20220905081236101.png)

测试一下

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20220905081304027.png)
