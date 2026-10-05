---
title: (十四)邮箱发送验证码
description: 开始前的准备 - 发送邮箱验证码时请确保开启MailHog 开始编码 整体逻辑和手机发送短信差不多 接受前端数据 app/requests/signuprequest.go 控制器 注册路由 测试
date: 2022-09-08T13:31:16+08:00
tags:
  - go
categories: []
legacyPath: /2022/09/08/go-api-practice-14/
---

# 开始前的准备

- 发送邮箱验证码时请确保开启`MailHog`

# 开始编码

整体逻辑和手机发送短信差不多

## 接受前端数据

`app/requests/signup_request.go`

```go
type SignupUsingEmailRequest struct {
   Email           string `json:"email,omitempty" valid:"email"`
   VerifyCode      string `json:"verify_code,omitempty" valid:"verify_code"`
   Name            string `valid:"name" json:"name"`
   Password        string `valid:"password" json:"password,omitempty"`
   PasswordConfirm string `valid:"password_confirm" json:"password_confirm,omitempty"`
}

func SignupUsingEmail(data interface{}, c *gin.Context) map[string][]string {

   rules := govalidator.MapData{
      "email":            []string{"required", "min:4", "max:30", "email", "not_exists:users,email"},
      "name":             []string{"required", "alpha_num", "between:3,20", "not_exists:users,name"},
      "password":         []string{"required", "min:6"},
      "password_confirm": []string{"required"},
      "verify_code":      []string{"required", "digits:6"},
   }

   messages := govalidator.MapData{
      "email": []string{
         "required:Email 为必填项",
         "min:Email 长度需大于 4",
         "max:Email 长度需小于 30",
         "email:Email 格式不正确，请提供有效的邮箱地址",
         "not_exists:Email 已被占用",
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

   _data := data.(*SignupUsingEmailRequest)
   errs = validators.ValidatePasswordConfirm(_data.Password, _data.PasswordConfirm, errs)
   errs = validators.ValidateVerifyCode(_data.Email, _data.VerifyCode, errs)

   return errs
}
```

## 控制器

```go
// SignupUsingEmail 使用 Email + 验证码进行注册
func (sc *SignupController) SignupUsingEmail(c *gin.Context) {

    // 1. 验证表单
    request := requests.SignupUsingEmailRequest{}
    if ok := requests.Validate(c, &request, requests.SignupUsingEmail); !ok {
        return
    }

    // 2. 验证成功，创建数据
    userModel := user.User{
        Name:     request.Name,
        Email:    request.Email,
        Password: request.Password,
    }
    userModel.Create()

    if userModel.ID > 0 {
        response.CreatedJSON(c, gin.H{
            "data": userModel,
        })
    } else {
        response.Abort500(c, "创建用户失败，请稍后尝试~")
    }
}
```

> 注册路由

```go
authGroup.POST("/signup/using-phone", suc.SignupUsingPhone)
authGroup.POST("/signup/using-email", suc.SignupUsingEmail)
```

## 测试

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20220905081857051.png)

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20220905081940831.png)
