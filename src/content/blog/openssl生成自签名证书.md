---
title: openssl生成自签名证书
description: 使用openssl可以方便的生成自签名证书，步骤如下 1. 创建私钥 由于是自签名，该私钥会同时用于签名和服务器本身，采用如下命令生成 2. 基于私钥创建csr（证书请求签名），csr中包含服务器公钥 3. 最后使用csr和key来生成证书
date: 2024-01-27T10:48:20+08:00
tags:
  - https
categories: []
legacyPath: /2024/01/27/openssl生成自签名证书/
---

使用openssl可以方便的生成自签名证书，步骤如下

1. 创建私钥

由于是自签名，该私钥会同时用于签名和服务器本身，采用如下命令生成

```bash
openssl genrsa -out my.key 2048
```

2. 基于私钥创建csr（证书请求签名），csr中包含服务器公钥

```bash
openssl req -new -key my.key -out my.csr -subj "/C=CN/ST=shanghai/L=shanghai/O=example/OU=it/CN=domain1/CN=domain2"
```

```
/C= Country 国家
/ST= State or Province 省
/L= Location or City 城市
/O= Organization 组织或企业
/OU= Organization Unit 部门
/CN= Common Name 域名或IP
```

3. 最后使用csr和key来生成证书

```bash
openssl x509 -req -in my.csr -out my.crt -signkey my.key -days 3650
```

