---
title: 『rss』ttrss极速搭建rss服务
description: 什么是rss Really Simple Syndication，简易资讯聚合。 名字并不重要，你可以理解为这是一个软件，可以帮助你订阅互联网上各种各样的信息，就好像微博你订阅了博主，然后你就可以特别的收到它的消息一样。只不过现在你可以订阅的范围变成了所有支持rss的网站 下面我们就尝试着使用ttr
date: 2022-10-12T16:21:03+08:00
tags:
  - rss
categories: []
legacyPath: /2022/10/12/ttrss极速搭建rss服务/
---


# 什么是rss

`Really Simple Syndication`，简易资讯聚合。

名字并不重要，你可以理解为这是一个软件，可以帮助你订阅互联网上各种各样的信息，就好像微博你订阅了博主，然后你就可以特别的收到它的消息一样。只不过现在你可以订阅的范围变成了所有支持rss的网站

下面我们就尝试着使用ttrss来订阅著名大佬阮一峰的博客

# ttrss

注意，以下的rss服务没有配置域名和https

## 开始的准备

在开始之前，你需有一些必要的工具

- docker
- 云服务器

## 什么是ttrss

ttrss即`tiny tiny rss`，是一个基于php的免费开源的rss聚合阅读器，下面我们将使用`docker compose`来搭建服务

## 开始搭建

首先在任意的地方创建`docker-compose.yml`文件，内容如下

```yaml
version: "3"
services:
  service.rss:
    image: wangqiru/ttrss:latest
    container_name: ttrss
    ports:
      - 181:80
    environment:
      - SELF_URL_PATH=http://localhost:181/ # please change to your own domain
      - DB_PASS=ttrss # use the same password defined in `database.postgres`
      - PUID=1000
      - PGID=1000
    volumes:
      - feed-icons:/var/www/feed-icons/
    networks:
      - public_access
      - service_only
      - database_only
    stdin_open: true
    tty: true
    restart: always

  service.mercury: # set Mercury Parser API endpoint to `service.mercury:3000` on TTRSS plugin setting page
    image: wangqiru/mercury-parser-api:latest
    container_name: mercury
    networks:
      - public_access
      - service_only
    restart: always

  service.opencc: # set OpenCC API endpoint to `service.opencc:3000` on TTRSS plugin setting page
    image: wangqiru/opencc-api-server:latest
    container_name: opencc
    environment:
      - NODE_ENV=production
    networks:
      - service_only
    restart: always

  database.postgres:
    image: postgres:13-alpine
    container_name: postgres
    environment:
      - POSTGRES_PASSWORD=ttrss # feel free to change the password
    volumes:
      - ~/postgres/data/:/var/lib/postgresql/data # persist postgres data to ~/postgres/data/ on the host
    networks:
      - database_only
    restart: always

  # utility.watchtower:
  #   container_name: watchtower
  #   image: containrrr/watchtower:latest
  #   volumes:
  #     - /var/run/docker.sock:/var/run/docker.sock
  #   environment:
  #     - WATCHTOWER_CLEANUP=true
  #     - WATCHTOWER_POLL_INTERVAL=86400
  #   restart: always

volumes:
  feed-icons:

networks:
  public_access: # Provide the access for ttrss UI
  service_only: # Provide the communication network between services only
    internal: true
  database_only: # Provide the communication between ttrss and database only
    internal: true
```

> 修改docker-compose.yml文件

将下面的url改成你访问该服务的url，在其它配置保持默认的情况下，把localhost改成服务器IP即可

```yaml
- SELF_URL_PATH=http://localhost:181/ # please change to your own domain
```

强烈建议你修改这两处的密码（虽然不修改依然可以运行，但是最好不要这样做），保持一致即可

```yaml
- DB_PASS=ttrss # use the same password defined in `database.postgres`

environment:
  - POSTGRES_PASSWORD=ttrss # feel free to change the password
```

然后再当前目录下执行命令

```shell
$ docker compose up -d
```

等待一小段时间即可部署成功

## 配置rss网站

> 修改默认密码

访问`ip:181`，默认账号`admin`，默认密码`password`，

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/1%7BP(%609FLRYI3OCK)%7B6~%6045H.png)

登录后在用户位置修改密码

![image-20221006212555462](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221006212555462.png)

配置好密码以后我们开启API，为之后我们可以手机上阅读做准备

![image-20221006213433683](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221006213433683.png)

再然后我们打开设置配置RSS源

![image-20221006213607133](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221006213607133.png)

填入阮一峰大佬的RSS源

http://www.ruanyifeng.com/blog/atom.xml

![image-20221006213642604](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221006213642604.png)

然后刷新一下就可以看到文章了（我这里在之前已经提前配置了RSS源，所以已经有了文章）

![image-20221006213829694](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221006213829694.png)

如果你看到的文章是直接展开的，可以在一旁的设置中把它收起

![image-20221006213916201](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221006213916201.png)

好了，至此我们就完成了RSS在PC端的配置，然后我们再去配置手机端

## 手机端RSS阅读器

首先下载阅读软件

[FeedMe](https://go-aliyun-oss.oss-cn-hangzhou.aliyuncs.com/FeedMe.apk?Expires=1665134217&OSSAccessKeyId=TMP.3KggvUkN12e6GAYuXtqhEuEfwKroxoxX85jgQpYHMug975JjxjyJJxju6i6sEu6kwjhn1U162cqy9WvzMF7PKrWfhfneP9&Signature=JO2w1YW0ZkynaoF1BgkqPedSqZs%3D)

打开软件，我们在`tiny tiny RSS`的位置输入信息

![Screenshot_2022-10-07-17-14-27-742_com.seazon.fee](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/Screenshot_2022-10-07-17-14-27-742_com.seazon.fee.jpg)

域名就是`http://ip:port`

登录之后按一下刷新按钮就可以看到文章了

![Screenshot_2022-10-07-17-15-33-169_com.seazon.fee](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/Screenshot_2022-10-07-17-15-33-169_com.seazon.fee.jpg)

这样就完成了RSS的基本配置，开启你的RSS之旅吧
