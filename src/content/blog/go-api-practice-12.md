---
title: (十二)用邮件来发送验证码
description: 开始前的准备 我们用mailhog来作为邮箱服务器 - SMTP端口：1025 - 网页端口：8025 我们再powershell使用MailHog命令开启服务 编码 封装mail包 我们依然先去封装mail包 pkg/mail/driverinterface.go pkg/mail/drivers
date: 2022-09-08T13:28:16+08:00
tags:
  - go
categories: []
legacyPath: /2022/09/08/go-api-practice-12/
---

# 开始前的准备

```shell
$ go install github.com/mailhog/MailHog@latest
$ go get github.com/jordan-wright/email
```

我们用mailhog来作为邮箱服务器

- SMTP端口：1025
- 网页端口：8025

我们再powershell使用`MailHog`命令开启服务

# 编码

## 封装mail包

我们依然先去封装mail包

`pkg/mail/driver_interface.go`

```go
package mail

type Driver interface {
   Send(mail Email, config map[string]string) bool
}
```

`pkg/mail/driver_smtp.go`

```go
package mail

import (
   "fmt"
   emailPKG "github.com/jordan-wright/email"
   "go-api-practice/pkg/logger"
   "net/smtp"
)

type SMTP struct {
}

// Send 实现 email.Driver interface 的 Send 方法
func (s *SMTP) Send(email Email, config map[string]string) bool {

   e := emailPKG.NewEmail()

   e.From = fmt.Sprintf("%v <%v>", email.From.Name, email.From.Address)
   e.To = email.To
   e.Bcc = email.Bcc
   e.Cc = email.Cc
   e.Subject = email.Subject
   e.Text = email.Text
   e.HTML = email.HTML

   logger.DebugJSON("发送邮件", "发件详情", e)

   err := e.Send(
      fmt.Sprintf("%v:%v", config["host"], config["port"]),

      smtp.PlainAuth(
         "",
         config["username"],
         config["password"],
         config["host"],
      ),
   )
   if err != nil {
      logger.ErrorString("发送邮件", "发件出错", err.Error())
      return false
   }

   logger.DebugString("发送邮件", "发件成功", "")
   return true
}
```

实现了接口

`pkg/mail/mail.go`

```go
package mail

import (
   "go-api-practice/pkg/config"
   "sync"
)

type From struct {
   Address string
   Name    string
}

type Email struct {
   From    From
   To      []string
   Bcc     []string //密送
   Cc      []string //抄送
   Subject string
   Text    []byte // Plaintext message (optional)
   HTML    []byte // Html message (optional)
}

type Mailer struct {
   Driver Driver
}

var once sync.Once
var internalMailer *Mailer

func NewMailer() *Mailer {
   once.Do(func() {
      internalMailer = &Mailer{
         Driver: &SMTP{},
      }
   })
   return internalMailer
}

func (mailer *Mailer) Send(email Email) bool {
   return mailer.Driver.Send(email, config.GetStringMapString("mail.smtp"))
}
```

最终封装了发送邮件的功能到一个`Send`函数中

## mail配置

`config/mail.go`

```go
package config

import "go-api-practice/pkg/config"

func init() {
   config.Add("mail", func() map[string]interface{} {
      return map[string]interface{}{

         // 默认是 Mailhog 的配置
         "smtp": map[string]interface{}{
            "host":     config.Env("MAIL_HOST", "localhost"),
            "port":     config.Env("MAIL_PORT", 1025),
            "username": config.Env("MAIL_USERNAME", ""),
            "password": config.Env("MAIL_PASSWORD", ""),
         },

         "from": map[string]interface{}{
            "address": config.Env("MAIL_FROM_ADDRESS", "go-api-practice@example.com"),
            "name":    config.Env("MAIL_FROM_NAME", "Go-API-Practice"),
         },
      }
   })
}
```

## 发送邮件接口

和前面发送短信的接口类似，我们去开发这个接口

`pkg/verifycode/verifycode.go`

```go
func (vc *VerifyCode) SendEmail(email string) error {

    // 生成验证码
    code := vc.generateVerifyCode(email)

    // 方便本地和 API 自动测试
    if !app.IsProduction() && strings.HasSuffix(email, config.GetString("verifycode.debug_email_suffix")) {
        return nil
    }

    content := fmt.Sprintf("<h1>您的 Email 验证码是 %v </h1>", code)
    // 发送邮件
    mail.NewMailer().Send(mail.Email{
        From: mail.From{
            Address: config.GetString("mail.from.address"),
            Name:    config.GetString("mail.from.name"),
        },
        To:      []string{email},
        Subject: "Email 验证码",
        HTML:    []byte(content),
    })

    return nil
}
```

和手机发送验证码类似的，对于特殊邮箱可以跳过验证

`app/requests/verify_code_request.go`

```go
type VerifyCodeEmailRequest struct {
   CaptchaID     string `json:"captcha_id,omitempty" valid:"captcha_id"`
   CaptchaAnswer string `json:"captcha_answer,omitempty" valid:"captcha_answer"`

   Email string `json:"email,omitempty" valid:"email"`
}

// VerifyCodeEmail 验证表单，返回长度等于零即通过
func VerifyCodeEmail(data interface{}, c *gin.Context) map[string][]string {

   // 1. 定制认证规则
   rules := govalidator.MapData{
      "email":          []string{"required", "min:4", "max:30", "email"},
      "captcha_id":     []string{"required"},
      "captcha_answer": []string{"required", "digits:6"},
   }

   // 2. 定制错误消息
   messages := govalidator.MapData{
      "email": []string{
         "required:Email 为必填项",
         "min:Email 长度需大于 4",
         "max:Email 长度需小于 30",
         "email:Email 格式不正确，请提供有效的邮箱地址",
      },
      "captcha_id": []string{
         "required:图片验证码的 ID 为必填",
      },
      "captcha_answer": []string{
         "required:图片验证码答案必填",
         "digits:图片验证码长度必须为 6 位的数字",
      },
   }

   errs := validate(data, rules, messages)

   // 图片验证码
   _data := data.(*VerifyCodeEmailRequest)
   errs = validators.ValidateCaptcha(_data.CaptchaID, _data.CaptchaAnswer, errs)

   return errs
}
```

从前端中读取邮箱和验证码，特别的，由于我们验证`captcha`验证码的代码部分是公共的，所以我们对它封装一层

`app/requests/validators/custom_validators.go`

```go
package validators

import "go-api-practice/pkg/captcha"

func ValidateCaptcha(captchaID, captchaAnswer string, errs map[string][]string) map[string][]string {
   if ok := captcha.NewCaptcha().VerifyCaptcha(captchaID, captchaAnswer); !ok {
      errs["captcha_answer"] = append(errs["captcha_answer"], "图片验证码错误")
   }
   return errs
}
```

我们顺便把手机号验证的部分也一并修改

最后我们再完成控制器部分

`app/http/controllers/api/v1/auth/verify_code_controller.go`

```go
func (vc *VerifyCodeController) SendUsingEmail(c *gin.Context) {
   request := requests.VerifyCodeEmailRequest{}

   if ok := requests.Validate(c, &request, requests.VerifyCodeEmail); !ok {
      return
   }

   err := verifycode.NewVerifyCode().SendEmail(request.Email)
   if err != nil {
      response.Abort500(c, "发送失败")
   } else {
      response.Success(c)
   }
}
```

注册接口

`routes/api.go`

```go
vcc := new(auth.VerifyCodeController)
authGroup.POST("/verify-codes/captcha", vcc.ShowCaptcha)
authGroup.POST("/verify-codes/phone", vcc.SendUsingPhone)
authGroup.POST("/verify-codes/email", vcc.SendUsingEmail)
```

## 测试

创建接口

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20220902154100778.png)

如果成功，结果如下

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20220902154146060.png)
