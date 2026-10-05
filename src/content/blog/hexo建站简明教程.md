---
title: hexo建站简明教程
description: 安装node.js 前往官网下载长期稳定版的node.js Node.js 下载完成以后检查一下能否打印出版本，正常打印就表示下载成功 安装hexo 我们用npm在全局安装hexo 检查一下是否下载成功 初始化博客 找到你想要放置博客的目录，在当前目录下执行初始化命令，后面跟着你想给博客目录取的名字
date: 2022-11-05T09:26:38+08:00
tags:
  - hexo
categories: []
legacyPath: /2022/11/05/hexo建站简明教程/
---


# 安装node.js

前往官网下载长期稳定版的node.js

[Node.js ](https://nodejs.org/zh-cn/)

![image-20221105082507512](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221105082507512.png)

下载完成以后检查一下能否打印出版本，正常打印就表示下载成功

```shell
npm -v
node -v
```

# 安装hexo

我们用npm在全局安装hexo

```shell
npm install -g hexo-cli
```

检查一下是否下载成功

```shell
hexo -v
```

# 初始化博客

找到你想要放置博客的目录，在当前目录下执行初始化命令，后面跟着你想给博客目录取的名字

```
hexo init <dir-name>
```

![image-20221105083029837](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221105083029837.png)

现在你可以看到当前目录下多出了`my-blog`目录，我们进入到这个文件夹中

```shell
cd myblog
```

![image-20221105083256875](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221105083256875.png)

你看到目录结构大概是这样的，作为使用者，我们不需要了解每个目录的作用，我们着重需要关注的是下面这些文件

- source——`保存你的博客文章的源文件，也就是以后你写的文章都会在这个目录里面`
  - 点开source，我们会发现一个`_post`目录，这是存在已发布文章的目录，你可以看见这里面已经有一篇`helloworld`了
- _config.yml——`博客的配置文件`

# 运行你的博客

接下来我们将运行你的博客

```shell
npm install
hexo g
hexo s
```

![image-20221105083902252](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221105083902252.png)

然后在浏览器中输入`localhost:4000`，就可以看到你部署的博客

![image-20221105084002617](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221105084002617.png)

在控制台中输入`Ctrl+C`可以停止运行博客



# hexo初步使用

我们现在已经安装好了我们的hexo博客，下面我们来简单的使用一下它

```shell
# 创建文章
hexo new "my-first-post"
```

![image-20221105084328948](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221105084328948.png)

然后进入到`source/_post`目录中查看

![image-20221105084355396](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221105084355396.png)

可以看到之前创建的文章，然后我们打开它，随便输入一点测试内容

![image-20221105084502155](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221105084502155.png)

我们已经写好了我们的文章，现在我们要把这篇文章发布到博客上，我们现在需要hexo框架帮助我们生成对应的内容

```shell
hexo g
```

![image-20221105084749897](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221105084749897.png)

这样就生成好了，最后，我们再次运行我们的博客查看部署的情况

```shell
hexo s
```

刷新浏览器，点击`Archives` ，我们可以看到我们刚刚创建的文章

![image-20221105084936293](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221105084936293.png)

这样我们就初步掌握了hexo的使用，现在我来总结一些hexo常用命令

- `hexo clean `:清除由`hexo g`生成的文件，一般来说没什么用，当部署出现问题的时候可以尝试清除然后重新生成
- `hexo g`:把我们写好的文章生成对应的文件(其实是html)
- `hexo s`：运行博客
- `hexo new <post-name>`：生成文章模板

接下来的步骤都要使用git，没有git的小伙伴可以先暂停去下载git

# 美化和定制化博客

我们现在使用了博客默认的主题，有些人可能对这个主题并不满意，没有关系，hexo中有大量的主题可以供你选择，现在我们来尝试使用hexo最常用的博客主题之一——`butterfly`

下载安装`butterfly`

```shell
# 先不要急着输入命令，检查一下你是否在正确的目录，注意命令在有_config.yml的根目录下执行
git clone -b master https://github.com/jerryc127/hexo-theme-butterfly.git themes/butterfly
npm install hexo-renderer-pug hexo-renderer-stylus --save
```

然后我们可以看到出现了这个文件夹`themes/butterfly`

我们进入到这个文件夹中，复制一份`_config.yml`，将它改名为`_config.butterfly.yml`，然后把这个改名后的文件移动到你的博客目录下

![image-20221105090235722](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221105090235722.png)

剪切到博客目录下

![image-20221105090301838](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221105090301838.png)



打开博客目录下的`_config.yml`，修改主题为`butterfly`

![image-20221105090705931](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221105090705931.png)

最后重新生成文件然后运行博客，大功告成

```shell
hexo g
hexo s
```

![image-20221105090745946](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221105090745946.png)

怎么样，是不是比原来的好看一点了，关于站点信息的配置和更加详细的定制化需求，可以自行阅读`butterfly`的官方文档和`hexo`的文档

[Butterfly - A Simple and Card UI Design theme for Hexo](https://butterfly.js.org/)

[配置 | Hexo](https://hexo.io/zh-cn/docs/configuration.html)

如果想要配置其它的主题，可以自己上网搜索配置，主题的配置暂时就到这里了

# 部署博客到github

下面的教程都假设你已经完成了git的配置并且已经注册好了github账号

首先，我们创建一个仓库，仓库名叫做`<github用户名>.github.io`

比如我的的github用户名叫做`jking412`，那么这个仓库名就是`jking412.github.io`

然后复制下你仓库的地址（我的仓库之前已经创建过了，新创建的仓库是空的）![image-20221105091649357](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221105091649357.png)

在博客目录的`_config.yml`文件下的`deploy`中配置如下

```yaml
deploy:
  type: git
  repository: https://github.com/jking412/jking412.github.io.git # 这里是你的仓库链接
  branch: main
```

最后我们安装好依赖，就可以把我们本地的内容推送到github上了

```shell
npm install hexo-deployer-git --save
hexo d
```

在部署完成以后，我们可以访问`http://<github用户名>.github.io`访问到你的博客

比如我的博客网址就是`jking412.github.io`

部署可能会花费1~2分钟，我们耐心等待以后就可以看到啦

# 总结

总结一下我们日常使用hexo的流程

```shell
# 创建文章
hexo new "post"
# 修改文章以后生成
hexo g
# 现在本地看一下博客有没有问题
hexo s
# 没有问题就推送到github，注意不要推送的太频繁，可能会被github限制
hexo d
```

有了博客，我们就可以记录下自己生活中的点点滴滴，博客也是帮助自己走向优秀的重要工具，要好好使用它呀

