---
title: 『Go』在Go中使用JWT
description: 什么是JWT JWT即JSON Web Token，工作机制是在用户通过鉴权之后，服务端发送一个JSON作为凭证给客户端，让客户端又权限可以访问一些资源 JWT 的三个部分依次如下。 我们需要注意的是Payload中的数据不会被加密，所以不要存放重要 签名保存在服务端，是绝对不可泄露的 最后，服务器
date: 2022-10-01T19:02:20+08:00
tags:
  - go
  - JWT
categories: []
legacyPath: /2022/10/01/在Go中使用JWT/
---




# 什么是JWT

JWT即`JSON Web Token`，工作机制是在用户通过鉴权之后，服务端发送一个JSON作为凭证给客户端，让客户端又权限可以访问一些资源

JWT 的三个部分依次如下。

```
- Header（头部）
包含了一些元数据
- Payload（负载）
存放实际需要传递的数据
- Signature（签名）
对前两部分进行签名，防止jwt被篡改
```

我们需要注意的是`Payload`中的数据不会被加密，所以不要存放重要

签名保存在服务端，是绝对不可泄露的

最后，服务器会对整个JSON进行加密，然后把加密后的数据传回给客户端，最后我们拿到的jwt大概是这样的

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

# GO使用JWT

下面的代码同时被保存在github仓库中

[jking412/go-example: 小demo，go的整合技术案例 (github.com)](https://github.com/jking412/go-example)

我们先下载一种jwt包

```shell
$ go get "github.com/golang-jwt/jwt"
```

```go
package main

import (
   "fmt"
   "github.com/golang-jwt/jwt"
   "net/http"
   "strconv"
   "strings"
   "time"
)

type JWTCustomClaims struct {
   UserId int
   jwt.StandardClaims
}

func main() {
   http.HandleFunc("/register", registerHandler)
   http.HandleFunc("/login", loginHandler)
   http.HandleFunc("/user", userHandler)
   http.ListenAndServe(":8080", nil)
}

func userHandler(w http.ResponseWriter, r *http.Request) {
   token, err := authJWT(r)
   if err != nil {
      w.Write([]byte("权限不足"))
      return
   }
   id := "user是:" + strconv.Itoa(token.Claims.(*JWTCustomClaims).UserId)
   w.Write([]byte(id))
}

func registerHandler(w http.ResponseWriter, r *http.Request) {
   token, err := generateToken(1)
   if err != nil {
      w.Write([]byte("注册失败"))
      return
   }
   w.Write([]byte(token))
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
   _, err := authJWT(r)
   if err != nil {
      w.Write([]byte("登录失败"))
      return
   }
   w.Write([]byte("登录成功"))
}

func authJWT(r *http.Request) (*jwt.Token, error) {
   tokenString, err := getJwtTokenFromHeader(r)
   if err != nil {
      return nil, err
   }

   token, err := parseToken(tokenString)
   if err != nil {
      return nil, err
   }
   return token, nil
}

func parseToken(tokenString string) (*jwt.Token, error) {
   token, err := jwt.ParseWithClaims(tokenString, &JWTCustomClaims{}, func(token *jwt.Token) (interface{}, error) {
      return []byte("secret"), nil
   })
   return token, err
}

func generateToken(userId int) (string, error) {
   claims := JWTCustomClaims{
      userId,
      jwt.StandardClaims{
         ExpiresAt: time.Now().Unix() + 3600,
         Issuer:    "test",
      },
   }
   token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
   return token.SignedString([]byte("secret"))
}

func getJwtTokenFromHeader(r *http.Request) (string, error) {
   tokenString := r.Header.Get("Authorization")
   fmt.Println(tokenString)

   tokenResult := strings.SplitN(tokenString, " ", 2)
   if len(tokenResult) != 2 || tokenResult[0] != "Bearer" {
      return "", fmt.Errorf("token格式错误")
   }

   return tokenResult[1], nil
}
```

这里只是一个简单实例，体会一下如何生成和解析JWT

`/register`接口可以像客户端随机生成一个JWT

`/login`接口模拟了用户的登录

`/user`模拟了需要JWT鉴权才能获取用户信息的过程

客户端在拿到JWT之后，需要把JWT放在请求头中的`Authorization`字段中，

使用方式如下

```
Authorization:Bearer <服务端的JWT>
```

这样JWT的一个简单使用流程就结束了

