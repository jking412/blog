---
title: 『git』git和github入门教程
description: git简介 git是一个分布式的版本控制系统。 git快速开始 安装git Git - Download 这里不讲述安装教程 体验git 我们先来快速的体验一下git，这一部分我将尽量避开git的细节，专注于git的使用 git和github 要体验git的强大功能，github是必不可少的。 但是
date: 2022-10-15T06:57:23+08:00
tags:
  - git
  - github
categories: []
legacyPath: /2022/10/15/git和github入门教程/
---

# git简介

git是一个分布式的版本控制系统。

# git快速开始

## 安装git

[Git - Download](https://git-scm.com/download/win)

这里不讲述安装教程

## 体验git

我们先来快速的体验一下git，这一部分我将尽量避开git的细节，专注于git的使用

### git和github

要体验git的强大功能，github是必不可少的。

但是虽然两者之间有着类似的名字，但两者之间的关系就好像是java和JavaScript之间的关系一样——两者之间完全不相同。

那么github有什么用呢？git是一个分布式版本控制系统，是一个工具，git是如何完成版本控制的呢，它会在本地创建一个仓库，这个仓库会记录下仓库中文件的各种信息。通过了git和他创建的仓库，我们就可以在本地实现版本控制，但是仅仅在本地的仓库很多时候并不能满足我们的需求。

我们更希望仓库保存本地的同时可以保存在云端，这样我们可以更好的保存我们创建的内容；于此同时，我们想要把自己创建的东西分享给其他人。那么github就是这样的远程代码托管平台。

我们可以借助于git，把本地的仓库放在github上，而放在github上的内容也可以被更多人看到，分享给更多的人，这对于互联网的发展是极其重要的。无数的开发者可以把自己的代码托管在github上，全世界范围内无数优秀的代码和智慧都开源在github上，我们可以去学习这些思想和代码，让自己的代码水平得以提升。

这样的代码托管平台并不只有github，在国内我们有自己的gitee，但是可以预见的是，github的体量和gitee的体量之间存在较大的差别，github是世界性的，gitee是国内的，这也直接导致了两者平台上代码质量的差距，所以我们一般来说会更多的使用github

### 使用git

![img](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/bg2015120901.png)

> git中的几个概念

通过上面git和github的概述，我们对git的工作流程有了一个大概的了解，至少已知的概念是本地文件，本地仓库和远程仓库。事实上，git的工作流程大概也是如此。

git在工作中有4个区域

- Workspace：工作区
- Index / Stage：暂存区
- Repository：仓库区（或本地仓库）
- Remote：远程仓库

本地文件所在位置就是工作区，在本地文件所在位置会有一个本地仓库，而github就是远程仓库，此外，在工作区和本地仓库之间有一个暂存区，用于暂时的保存文件

> git初体验

说了这么多，现在我们就要真正的开始使用git了

我们打开先尝试把github上的内容拉取到本地

https://github.com/jking412/hello-github

![image-20221012193257256](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012193257256.png)

我们打开这个仓库，点击右上角绿色的`Code`，复制下URL

接着，找到我们想要放置仓库的文件位置，在当前文件夹下打开git bash

```bash
$ git clone https://github.com/jking412/hello-github
```

![image-20221012193553880](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012193553880.png)

接着我们就可以看到`hello-github`文件夹

![image-20221012193630137](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012193630137.png)

点进去之后就可以看到仓库里的文件了

### 添加ssh key

在我们创建自己的仓库之前，我们要配置一下ssh key。

为什么要配置这个呢，加入你自己创建了仓库，如果谁都可以向这个仓库去推送和修改内容，那么这个仓库显然是不安全的，所以本地的git必须要获得远程仓库的许可之后才可以向远程仓库推送内容，这个许可就是ssh key。

我们打开git bash，按照下面的步骤执行命令

```shell
$ git config --global user.name 'yourname'
$ git config --global user.email 'youremail'
$ ssh-keygen -t rsa -C 'youremail'
# 接下来会出现一些信息需要填写，我们不必管它，一直按空格就可以了
```

这个时候我们ssh key就生成好了，我们打开ssh key所在位置，在你的C盘下的Users目录中，注意你可能会找不到.ssh目录，要注意打开隐藏文件夹

![image-20221012195206365](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012195206365.png)

我们打开.ssh目录

![image-20221012195336400](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012195336400.png)

我们打开`id_rsa.pub`，复制下其中的内容，然后打开github的settings

![image-20221012195432506](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012195432506.png)

去创建一个ssh key

![image-20221012195506157](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012195506157.png)

Title可以随便取，用于标识给你自己看，下面的Key就是复制下来的内容

![image-20221012195541215](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012195541215.png)

完成后添加就完成了配置

### 创建自己的仓库

接下来，我们终于可以创建自己的代码仓库并把本地仓库内容推送到远程仓库中

![image-20221012195714629](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012195714629.png)

去New一个仓库

![image-20221012195959441](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012195959441.png)

填写仓库名字就可以创建了

![image-20221012200144465](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012200144465.png)

我们先在一个你想要选取作为git本地仓库的位置创建文件（内容随意）

![image-20221012200343990](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012200343990.png)

打开git bash

```shell
$ git init
$ git add .
$ git commit -m 'first commit'
# 复制你的git仓库的URL
$ git remote add origin <你的代码仓库URL>
$ git branch -M main
$ git push -u origin main
```

这样你就可以看到本地的文件出现在github仓库上了

### 关键命令的解释

下面我们来解释一下上面命令的具体含义

> git init

初始化一个仓库

> git add .

```shell
$ git add <filename> # 把文件添加到暂存区，‘.’表示把当前文件夹下所有内容加入到暂存区
```

> git commit

```shell
$ git commit -m 'comment content' # commit命令把暂存区的内容提交到本地仓库，-m为这个提交添加注释
```

> git remote 

添加远程仓库

```shell
$ git remote add origin <你的代码仓库URL>
# 大家注意这里的origin实际上是<你的代码仓库URL>的一个别名
# 也就是说你可以在最后push的时候把origin的位置改成<你的代码仓库URL>
```

> git branch -M

给当前分支重命名（默认是master）

> git push

将本地内容提交到远程仓库

这里只提一下`-u`参数，git在提交的时候需要知道远程仓库的位置，这个`-u`就是告诉我们要将本地仓库推送到的远程仓库的位置，这个参数只需要在第一次push的时候添加，后面push的过程中直接`git push`就可以了







