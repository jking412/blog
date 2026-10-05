---
title: cas认证流程简介
description: CAS是什么 在认识CAS之前，我们先认识一下SSO。 SSO是Single Sign On的缩写，意为单点登录，是一种应用架构，用户只需要登录一次就可以访问所有相互信任的应用。 SSO只是一种架构，而CAS就是实现SSO的一套方案，CAS是Central Authentication Servic
date: 2022-11-18T11:06:56+08:00
tags:
  - sso
  - cas
categories: []
legacyPath: /2022/11/18/cas认证流程简介/
---

# CAS是什么

在认识CAS之前，我们先认识一下SSO。

SSO是`Single Sign On`的缩写，意为单点登录，是一种应用架构，用户只需要登录一次就可以访问所有相互信任的应用。

SSO只是一种架构，而CAS就是实现SSO的一套方案，CAS是`Central Authentication Service`的简称。

![c967cd85751e4e739cd8455286c86302_tplv-k3u1fbpfcp-zoom-in-crop-mark_4536_0_0_0](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/c967cd85751e4e739cd8455286c86302_tplv-k3u1fbpfcp-zoom-in-crop-mark_4536_0_0_0.png)

# 了解CAS

我们先来用一个奇怪的游乐场模拟一下CAS整个运作的流程

![image-20221118183917114](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221118183917114.png)

在这个游乐场中，我们只需要去`授权中心`买一次票就可以在全场畅玩。每个游乐设施都需要自己它们自己`单独的票据`，但是我们不需要在每个地点购买票据，只要有游乐场的通票，我们可以用这个通票让游乐设施的售票处找游乐场授权中心验证（防止通票伪造），验证通过以后售票处会给我们票据，拿着对应的票据我们就可以在对应的游乐设施快乐的玩耍了。

在实际CAS实现中，对应关系如下

- 游客——浏览器
- 游乐场授权中心——cas server授权认证中心
- 游乐设施——多个APP
- 通票——TGC（Ticket Grangting Ticket）
- 游乐设施专门的票据——app对应cookie

关系图如下（限于CAS的流程实在比较繁琐，所以下面这个图省略了部分内容，主要省略在`验证通过`这里）

但实际上，我们脱离cas本身复杂的流程来思考，cas只是把多个应用的登录功能抽离出来做了一个集成而已。这里先说明一下，在被省略的验证通过流程中，涉及`TGC`，`TGT`和`ST`三种票据，我们将在下面的具体流程中介绍（一方面不希望过早的把问题复杂化，一方面不希望误导读者，真是纠结啊，大家谅解一下）

![image-20221118184737951](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221118184737951.png)





# CAS的具体流程

我会分别介绍四个方面内容

- 从浏览器发出TGC到浏览器拿到app的cookie的过程中发生了什么（也就是省略内容）
- 没有拿到TGC（没有在cas登陆过）的整个登录流程
- 拿到TGC的整个流程
- 退出登陆的流程

如果看完前面拆分的流程图和第一部分仍然感到疑惑，那么可以仔细看看第2部分，那里有完整的流程，当然，你要有耐心（放大了图慢慢看，看的时候要保证脑子里有user，brower，cas server，app四个对象，要知道，仅凭文字这些流程会很抽象，要让流程动起来）

## 从TGC到app cookie

- TGT：Ticket Grangting Ticket

- TGC：Ticket Granting Cookie

- ST：Service Ticket

TGC和TGC是cas server的一对cookie和session，这样理解就可以了，TGC是用户在cas server登录过的凭证

ST是允许用户访问某一APP的凭据，这个讲起来比较抽象，下面看图，这个图假设用户已经获取了TGC（要注意，上面的流程图已经和这里不同了，也就是说上面的图为了简化流程本身就有错误的内容）

![image-20221118190222832](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221118190222832.png)

`是不是看完这些更加头晕了，由于拆分了流程，局部的认知可能还是会让你感到不明白，下面我们来看看整个流程`

## 未登录状态下（无TGC）的完整流程

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/5e8d855819894c3fa1f8ba85ead37cb2_tplv-k3u1fbpfcp-zoom-in-crop-mark_4536_0_0_0.png)

这里我能说的就是大家认真看图，一定要把四个角色在流程中做什么搞清楚

## 有TGC状态下登录APP

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/d3264e5b6f18444cb700616d6904fcf8_tplv-k3u1fbpfcp-zoom-in-crop-mark_4536_0_0_0.png)

流程和上面区别不大，唯一的区别就是免去了用户了登录，这也是cas最重要的地方

## 退出登录

需要了解的是，使用cas server的App在一个退出登陆后会全部退出登录

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/a616807e5bd34deb985c72a201826695_tplv-k3u1fbpfcp-zoom-in-crop-mark_4536_0_0_0.png)

流程有点多，静下心来也许才是最好的方法

