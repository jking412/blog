---
title: (十五)密码加密和jwt认证
description: "开始前的准备 开始编码 密码加密 pkg/hash/hash.go 这里要注意的是BcryptCheck()函数的参数位置不能错误，否则函数将无法正常运行 添加钩子函数 app/models/user/userhooks.go 这里我们使用了gorm的钩子函数，注意参数和函数名都不要出错 验证密码 "
date: 2022-09-08T13:33:16+08:00
tags:
  - go
categories: []
legacyPath: /2022/09/08/go-api-practice-15/
---

# 开始前的准备

```shell
$ go get golang.org/x/crypto
$ go get github.com/golang-jwt/jwt
```

# 开始编码

## 密码加密

`pkg/hash/hash.go`

```go
package hash

import (
   "go-api-practice/pkg/logger"
   "golang.org/x/crypto/bcrypt"
)

func BcryptHash(password string) string {
   bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
   logger.LogIf(err)

   return string(bytes)
}

func BcryptCheck(password, hash string) bool {
   err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
   return err == nil
}

func BcryptIsHashed(str string) bool {
   return len(str) == 60
}
```

这里要注意的是`BcryptCheck()`函数的参数位置不能错误，否则函数将无法正常运行

> 添加钩子函数

`app/models/user/user_hooks.go`

```go
package user

import (
   "go-api-practice/pkg/hash"
   "gorm.io/gorm"
)

func (userModel *User) BeforeSave(tx *gorm.DB) (err error) {
   if !hash.BcryptIsHashed(userModel.Password) {
      userModel.Password = hash.BcryptHash(userModel.Password)
   }

   return
}
```

这里我们使用了`gorm`的钩子函数，注意参数和函数名都不要出错

> 验证密码

`app/models/user/user_model.go`

```go
func (userModel *User) ComparePassword(_password string) bool {
   return hash.BcryptCheck(_password, userModel.Password)
}
```

## 测试密码加密

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20220905082638470.png)

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20220905082658293.png)

可以看到密码已经被加密

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20220905082730346.png)

## jwt授权

`pkg/jwt/jwt.go`

```go
package jwt

import (
   "errors"
   "github.com/gin-gonic/gin"
   jwtpkg "github.com/golang-jwt/jwt"
   "go-api-practice/pkg/app"
   "go-api-practice/pkg/config"
   "go-api-practice/pkg/logger"
   "strings"
   "time"
)

var (
   ErrTokenExpired           error = errors.New("令牌已过期")
   ErrTokenExpiredMaxRefresh error = errors.New("令牌已过最大刷新时间")
   ErrTokenMalformed         error = errors.New("请求令牌格式有误")
   ErrTokenInvalid           error = errors.New("请求令牌无效")
   ErrHeaderEmpty            error = errors.New("需要认证才能访问！")
   ErrHeaderMalformed        error = errors.New("请求头中 Authorization 格式有误")
)

// JWT 定义一个jwt对象
type JWT struct {

   // 秘钥，用以加密 JWT，读取配置信息 app.key
   SignKey []byte

   // 刷新 Token 的最大过期时间
   MaxRefresh time.Duration
}

// JWTCustomClaims 自定义载荷
type JWTCustomClaims struct {
   UserID       string `json:"user_id"`
   UserName     string `json:"user_name"`
   ExpireAtTime int64  `json:"expire_time"`

   // StandardClaims 结构体实现了 Claims 接口继承了  Valid() 方法
   // JWT 规定了7个官方字段，提供使用:
   // - iss (issuer)：发布者
   // - sub (subject)：主题
   // - iat (Issued At)：生成签名的时间
   // - exp (expiration time)：签名过期时间
   // - aud (audience)：观众，相当于接受者
   // - nbf (Not Before)：生效时间
   // - jti (JWT ID)：编号
   jwtpkg.StandardClaims
}

func NewJWT() *JWT {
   return &JWT{
      SignKey:    []byte(config.GetString("app.key")),
      MaxRefresh: time.Duration(config.GetInt64("jwt.max_refresh_time")) * time.Minute,
   }
}

// ParserToken 解析 Token，中间件中调用
func (jwt *JWT) ParserToken(c *gin.Context) (*JWTCustomClaims, error) {

   tokenString, parseErr := jwt.getTokenFromHeader(c)
   if parseErr != nil {
      return nil, parseErr
   }

   // 1. 调用 jwt 库解析用户传参的 Token
   token, err := jwt.parseTokenString(tokenString)

   // 2. 解析出错
   if err != nil {
      validationErr, ok := err.(*jwtpkg.ValidationError)
      if ok {
         if validationErr.Errors == jwtpkg.ValidationErrorMalformed {
            return nil, ErrTokenMalformed
         } else if validationErr.Errors == jwtpkg.ValidationErrorExpired {
            return nil, ErrTokenExpired
         }
      }
      return nil, ErrTokenInvalid
   }

   // 3. 将 token 中的 claims 信息解析出来和 JWTCustomClaims 数据结构进行校验
   if claims, ok := token.Claims.(*JWTCustomClaims); ok && token.Valid {
      return claims, nil
   }

   return nil, ErrTokenInvalid
}

// RefreshToken 更新 Token，用以提供 refresh token 接口
func (jwt *JWT) RefreshToken(c *gin.Context) (string, error) {

   // 1. 从 Header 里获取 token
   tokenString, parseErr := jwt.getTokenFromHeader(c)
   if parseErr != nil {
      return "", parseErr
   }

   // 2. 调用 jwt 库解析用户传参的 Token
   token, err := jwt.parseTokenString(tokenString)

   // 3. 解析出错，未报错证明是合法的 Token（甚至未到过期时间）
   if err != nil {
      validationErr, ok := err.(*jwtpkg.ValidationError)
      // 满足 refresh 的条件：只是单一的报错 ValidationErrorExpired
      if !ok || validationErr.Errors != jwtpkg.ValidationErrorExpired {
         return "", err
      }
   }

   // 4. 解析 JWTCustomClaims 的数据
   claims := token.Claims.(*JWTCustomClaims)

   // 5. 检查是否过了『最大允许刷新的时间』
   x := app.TimenowInTimezone().Add(-jwt.MaxRefresh).Unix()
   if claims.IssuedAt > x {
      // 修改过期时间
      claims.StandardClaims.ExpiresAt = jwt.expireAtTime()
      return jwt.createToken(*claims)
   }

   return "", ErrTokenExpiredMaxRefresh
}

// IssueToken 生成  Token，在登录成功时调用
func (jwt *JWT) IssueToken(userID string, userName string) string {

   // 1. 构造用户 claims 信息(负荷)
   expireAtTime := jwt.expireAtTime()
   claims := JWTCustomClaims{
      userID,
      userName,
      expireAtTime,
      jwtpkg.StandardClaims{
         NotBefore: app.TimenowInTimezone().Unix(), // 签名生效时间
         IssuedAt:  app.TimenowInTimezone().Unix(), // 首次签名时间（后续刷新 Token 不会更新）
         ExpiresAt: expireAtTime,                   // 签名过期时间
         Issuer:    config.GetString("app.name"),   // 签名颁发者
      },
   }

   // 2. 根据 claims 生成token对象
   token, err := jwt.createToken(claims)
   if err != nil {
      logger.LogIf(err)
      return ""
   }

   return token
}

// createToken 创建 Token，内部使用，外部请调用 IssueToken
func (jwt *JWT) createToken(claims JWTCustomClaims) (string, error) {
   // 使用HS256算法进行token生成
   token := jwtpkg.NewWithClaims(jwtpkg.SigningMethodHS256, claims)
   return token.SignedString(jwt.SignKey)
}

// expireAtTime 过期时间
func (jwt *JWT) expireAtTime() int64 {
   timenow := app.TimenowInTimezone()

   var expireTime int64
   if config.GetBool("app.debug") {
      expireTime = config.GetInt64("jwt.debug_expire_time")
   } else {
      expireTime = config.GetInt64("jwt.expire_time")
   }

   expire := time.Duration(expireTime) * time.Minute
   return timenow.Add(expire).Unix()
}

// parseTokenString 使用 jwtpkg.ParseWithClaims 解析 Token
func (jwt *JWT) parseTokenString(tokenString string) (*jwtpkg.Token, error) {
   return jwtpkg.ParseWithClaims(tokenString, &JWTCustomClaims{}, func(token *jwtpkg.Token) (interface{}, error) {
      return jwt.SignKey, nil
   })
}

// getTokenFromHeader 使用 jwtpkg.ParseWithClaims 解析 Token
// Authorization:Bearer xxxxx
func (jwt *JWT) getTokenFromHeader(c *gin.Context) (string, error) {
   authHeader := c.Request.Header.Get("Authorization")
   if authHeader == "" {
      return "", ErrHeaderEmpty
   }
   // 按空格分割
   parts := strings.SplitN(authHeader, " ", 2)
   if !(len(parts) == 2 && parts[0] == "Bearer") {
      return "", ErrHeaderMalformed
   }
   return parts[1], nil
}
```

这是工具类

> 时区

`pkg/app/app.go`

```go
func TimenowInTimezone() time.Time {
   chinaTimezone, _ := time.LoadLocation(config.GetString("app.timezone"))
   return time.Now().In(chinaTimezone)
}
```

> 配置信息

`config/jwt.go`

```go
package config

import "go-api-practice/pkg/config"

func init() {
   config.Add("jwt", func() map[string]interface{} {
      return map[string]interface{}{

         // 使用 config.GetString("app.key")
         // "signing_key":

         // 过期时间，单位是分钟，一般不超过两个小时
         "expire_time": config.Env("JWT_EXPIRE_TIME", 120),

         // 允许刷新时间，单位分钟，86400 为两个月，从 Token 的签名时间算起
         "max_refresh_time": config.Env("JWT_MAX_REFRESH_TIME", 86400),

         // debug 模式下的过期时间，方便本地开发调试
         "debug_expire_time": 86400,
      }
   })
}
```

> 获得字符串ID

`app/models/model.go`

```go
func (a BaseModel) GetStringID() string {
   return cast.ToString(a.ID)
}
```

## 在控制器中调用

`app/http/controllers/api/v1/auth/signup_controller.go`

```go
func (sc *SignupController) SignupUsingPhone(c *gin.Context) {
   request := requests.SignupUsingPhoneRequest{}

   if ok := requests.Validate(c, &request, requests.SignupUsingPhone); !ok {
      return
   }
   userModel := user.User{
      Name:     request.Name,
      Phone:    request.Phone,
      Password: request.Password,
   }

   userModel.Create()

   if userModel.ID > 0 {
      token := jwt.NewJWT().IssueToken(userModel.GetStringID(), userModel.Name)
      response.CreatedJSON(c, gin.H{
         "token": token,
         "data":  userModel,
      })
   } else {
      response.Abort500(c, "创建用户失败")
   }
}

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
      token := jwt.NewJWT().IssueToken(userModel.GetStringID(), userModel.Name)
      response.CreatedJSON(c, gin.H{
         "token": token,
         "data":  userModel,
      })
   } else {
      response.Abort500(c, "创建用户失败，请稍后尝试~")
   }
}
```

## 测试jwt

我们用之前的API在来注册一个用户，成功如下

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20220905083242904.png)
