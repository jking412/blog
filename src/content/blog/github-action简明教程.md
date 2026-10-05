---
title: github-action简明教程
description: Github Actions是什么 GitHub Actions 是一种持续集成和持续交付 (CI/CD) 平台，可用于自动执行生成、测试和部署管道。简单地说，就是通过编写符合Github Actions要求的"脚本"，让Github来执行这一的"脚本"。 在开始之前，还是有必要简单的介绍一下持续集
date: 2022-11-08T23:18:52+08:00
tags:
  - github action
categories: []
legacyPath: /2022/11/08/github-action简明教程/
---


# Github Actions是什么

GitHub Actions 是一种持续集成和持续交付 (CI/CD) 平台，可用于自动执行生成、测试和部署管道。简单地说，就是通过编写符合Github Actions要求的`"脚本"`，让Github来执行这一的`"脚本"`。

在开始之前，还是有必要简单的介绍一下持续集成。

**持续集成指的是，频繁地（一天多次）将代码集成到主干。**

它的好处主要有两个。

> **（1）快速发现错误。**每完成一点更新，就集成到主干，可以快速发现错误，定位错误也比较容易。
>
> **（2）防止分支大幅偏离主干。**如果不是经常集成，主干又在不断更新，会导致以后集成的难度变大，甚至难以集成。

**持续集成的目的，就是让产品可以快速迭代，同时还能保持高质量。**它的核心措施是，代码集成到主干之前，必须通过自动化测试。只要有一个测试用例失败，就不能集成。

# 理解Github Actions工作流

上文中我们提到的脚本在具体的实现中就是一个工作流文件，该文件采用yaml编写，文件的命名没有要求，放置在代码仓库的`.github/workflows`文件夹下。下面我们通过一个最简单的工作流文件来理解工作流的组成，然后我们尝试让Github帮助我们完成下面的工作。

`example.yaml`

```yaml
name: GitHub Actions Demo
run-name: ${{ github.actor }} is testing out GitHub Actions 🚀
on: [push]
jobs:
  # 工作名字，没有要求  
  Explore-GitHub-Actions:
    runs-on: ubuntu-latest
    steps:
      - run: echo "🎉 The job was automatically triggered by a ${{ github.event_name }} event."
      - run: echo "🐧 This job is now running on a ${{ runner.os }} server hosted by GitHub!"
      - run: echo "🔎 The name of your branch is ${{ github.ref }} and your repository is ${{ github.repository }}."
      - name: Check out repository code
        uses: actions/checkout@v3
      - run: echo "💡 The ${{ github.repository }} repository has been cloned to the runner."
      - run: echo "🖥️ The workflow is now ready to test your code on the runner."
      - name: List files in the repository
        run: |
          ls ${{ github.workspace }}
      - run: echo "🍏 This job's status is ${{ job.status }}."
```

![image-20221108214958201](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221108214958201.png)

## Github Actions组成

### Workflows——工作流

工作流是一个可配置的自动化过程，它将运行一个或多个作业。说得具体一点，工作流是对工作流程及其各操作步骤之间业务规则的抽象和概括描述。比如说你要做一件事，完成这件事要有很多的步骤，而这些步骤之间相互的关系和逻辑就是一个工作流。

在Github Actions中，工作流由签入到存储库的 YAML 文件定义，并在存储库中的事件触发时运行，也可以手动触发，或按定义的时间表触发，在上面这个例子中，由`on`标签定义触发事件，表示当你把代码push到仓库时触发这个工作流。

简单来说，一个yaml文件就代表了一个工作流。一个仓库可以配置多个工作流文件，它们将独立执行。

`name: GitHub Actions Demo`：定义了这个工作流的名字

`run-name`：当前正在运行的工作流名称

### Events——事件

一个具体的活动，用于触发工作流执行。

`on`：触发工作流的事件，在这个案例中表示向这个仓库中push就会执行这个工作流

### Jobs——工作和Steps——步骤

一个工作是一系列执行在同一个服务器上的步骤的集合。每个步骤都是一个Shell脚本或者一个actions（一系列由他人已经完成的脚本）。这些步骤会在同一台机器上运行，它们共享上下文和依赖，步骤之间按照顺序执行。

`name`：定义了步骤的名字

`run`：一个步骤具体要执行的内容

### Actions

一系列由他人写好的脚本，这些脚本在Github的`Marketplace`中可以找到，使用Actions可以大大减少我们需要编写的代码量，避免执行重复的操作，比如着这个示例文件中使用的`actions/checkout@v3`就是一个actions，它的作用是把当前仓库的文件转移到服务器中，如果工作流中需要执行脚本就必须包含这个actions，所以几乎大部分的工作流都会包含这个actions。

![image-20221108230338604](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221108230338604.png)

`use`：声明要使用的actions

`with`：配置actions参数

### Runners

运行工作流的服务器，这个服务器可以由Github免费提供，也可以运行在你自己的服务器上，目前Github提供三种操作系统

- Microsoft Windows
- Ubuntu Linux
- macOS

由Github提供的服务器每次运行都是一个全新的，未配置过的新服务器。

`runs-on`：定义了该工作使用的服务器

### 环境变量和上下文

即便没有学过，很明显`${{}}`语法是一种取出变量的用法，这里不具体介绍。

### Github Actions初步使用

介绍完了基础概念，下面我们来用上面的工作流文件来第一次使用Github Actions

首先我们创建一个文件夹，将`example.yaml`放在`.github/workflows`文件夹下。然后我们将这个文件夹连接一个Github仓库，把这个仓库推送到Github上，我们找到仓库中的`Actions`选项，就可以看到我们编写的Github Actions工作流被执行了（正常来说只有一个，我的仓库之前已经执行过一些别的工作流了）。

![image-20221108222144851](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221108222144851.png)



点开查看这个工作流，我们可以查看到工作流的详细信息。

![image-20221108222553490](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221108222553490.png)

这里的每一行都代表一个步骤，点开这些步骤你可以看到运行这些步骤产生的日志结果。比如我们设置的第一个步骤`🎉 The job was automatically triggered by a ${{ github.event_name }} event.`，我们可以看到运行结果`🎉 The job was automatically triggered by a push event.`，很明显触发这个工作流的事件名是`push`，其它的类似。

我们再来看看这个步骤

```yaml
name: List files in the repository
        run: |
          ls ${{ github.workspace }}
```

这个步骤要求列出工作空间中的文件，我们点开这个步骤可以看到运行的结果

![image-20221108223659524](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221108223659524.png)

现在我们完成了Github Actions的一个简单使用，如果想要更加深入的理解，可以自己动手去实践一下或者阅读我的博客

传送门：[从github page到github action](/2022/11/22/%E4%BB%8Egithub-page%E5%88%B0github-action/)



