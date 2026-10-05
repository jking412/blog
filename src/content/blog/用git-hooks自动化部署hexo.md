---
title: 用git hooks自动化部署hexo
description: 背景 hexo是知名的博客部署框架，采用SSG（Static Site Generation）的方式生成静态页面，结合使用github等托管平台可以快速部署我们的站点。hexo也给我们提供了支持部署的插件，安装完成以后我们可以使用hexo deploy推送内容到托管平台。 虽然hexo已经给我们提供
date: 2022-11-23T20:35:14+08:00
tags:
  - git
  - hexo
categories: []
legacyPath: /2022/11/23/用git-hooks自动化部署hexo/
---

# 背景

hexo是知名的`博客部署框架`，采用`SSG（Static Site Generation）`的方式生成静态页面，结合使用github等托管平台可以快速部署我们的站点。hexo也给我们提供了支持部署的插件，安装完成以后我们可以使用`hexo deploy`推送内容到托管平台。

虽然hexo已经给我们提供了一套方便的部署方案，但是使用hexo最大的痛点之一就是当我们要换设备时无法方便的迁移。因为`hexo deploy`只负责把hexo生成的静态页面，也就是`public`目录下的内容推送到托管平台，我们如果要迁移我们的文章到另一台机器，只能把文件夹拷贝过去，非常的不方便，如果我们意外丢失这个文件夹，那么我们原来的`markdown`文章都会丢失。

今天要介绍的`git hooks`就是解决问题的一套方案，我们用`git`维护我们的hexo文件，不仅方便迁移，而且增加了维护历史版本的功能。

# git hooks

开始之前还是先简单的介绍一下git hooks

## 钩子

可以简单的理解为在特定时机触发的程序。我们用git hooks来举一个简单的例子

```shell
$ git init git-hooks-test
$ cd git-hooks-test/.git/hooks
$ ls
```

我们可以看到很多的文件

![image-20221124113801527](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221124113801527.png)

我们以`pre-commit`为例，这个文件中的脚本会在每次commit之前执行，我们来简单的测试一下，把`pre-commit`的内容复制为下文。

在复制内容之前记得把sample删除，带这个后缀的钩子文件会被忽略

```shell
#!/bin/bash
echo "Hello World"
```

测试一下

``` shell
$ git commit -m 'test hooks'
```

![image-20221124115136586](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221124115136586.png)

可以看到我们设置的hello world被打印出来，那么其它钩子也是同理的，不再说明

# 搭建环境

我们接下来分别搭建服务端和客户端的环境

## 服务端

### node和git

操作系统为`ubuntu`

```shell
$ sudo useradd hexo -m # 创建用户及其home目录
$ sudo passwd hexo # 配置一个密码
$ sudo apt update
$ sudo apt install git
# 由于ubuntu安装nodejs时发现版本过低，这里不用默认的软件源
$ sudo curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
# 这里的nodejs同时包含nodejs和npm
$ sudo apt install nodejs
# 安装hexo
$ node install -g hexo-cli
```

### git hooks配置

接下来配置git仓库和git hooks

```shell
$ cd /home/hexo
#  建立裸仓库
$ git init --bare blog.git
# 存放hexo文件
$ mkdir -p www/blog
# 编辑post-receive钩子，会在收到文件以后执行
$ vim blog.git/hooks/post-receive
```

配置如下

```shell
#!/bin/bash
git --work-tree=/home/hexo/www/blog --git-dir=/home/hexo/blog.git checkout -f master
cd /home/hexo/www/blog
npm install
hexo g
```

```shell
# 记得给执行权限
$ chmod +x blog.git/hooks/post-receive
```



暂时这样配置就好了

### nginx配置

接下来下载nginx

(这里下的nginx版本感觉过于落后，后面如果你的nginx没有相关文件那么只需要修改`/etc/nginx/nginx.conf`里的`root`位置就可以了)

```shell
$ sudo apt install nginx
# 进入nginx配置文件所在文件夹
$ cd /etc/nginx
# 一般来说，在conf.d子文件夹中添加配置文件是更好的选择，这里直接修改主配置文件
$ sudo o+w sites-available/default
$ vim sites-available/default
```

找到配置文件中`root`的配置，如果找不到可能是nginx版本不同，可以尝试直接修改`nginx.conf`文件中的对应部分

```nginx
# 不同的版本可能默认的root位置不同，总之现在修改为我们需要的root
root /var/share/nginx/html
# 修改为
root /home/hexo/www/blog/public
```

然后重启nginx

```shell
$ sudo nginx -s reload
```

## 客户端

hexo环境创建过程不再重复

```shell
$ hexo init myblog
$ cd myblog
$ npm install
# ssh相关命令最好使用git bash执行
$ ssh-keygen
$ ssh-copy-id -i ~/.ssh/id_rsa.pub hexo@ip
$ git init
# 配置ssh免密登录
$ git remote add origin ssh://hexo@ip:/home/hexo/blog.git
$ git add -A
$ git commit -m 'first commit'
$ git push -u origin master
```

自己可以看到正确的提示信息就是配置好了

![image-20221124181651635](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221124181651635.png)

然后试着访问服务器ip，查看部署情况



