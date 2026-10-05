---
title: 『JavaWeb』基本坏境配置
description: 配置Tomcat 下载Tomcat9或者更低版本，Tomcat10的包目录结构有较大的改变，没有熟悉之前不建议使用 Apache Tomcat® - Apache Tomcat 9 Software Downloads 下载好之后解压到任意目录里 然后把Tomcat配置到环境变量里，我们需要有三个必
date: 2022-10-12T16:19:09+08:00
tags:
  - tomcat
  - maven
categories: []
legacyPath: /2022/10/12/JavaWeb基本坏境配置/
---

# 配置Tomcat

![image-20221012153129573](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012153129573.png)

下载Tomcat9或者更低版本，Tomcat10的包目录结构有较大的改变，没有熟悉之前不建议使用

[Apache Tomcat® - Apache Tomcat 9 Software Downloads](https://tomcat.apache.org/download-90.cgi)

下载好之后解压到任意目录里

![image-20221012153302786](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012153302786.png)

然后把Tomcat配置到环境变量里，我们需要有三个必须的环境变量

- JAVA_HOME：tomcat由java编写，必须要jdk环境，在开始之前就应该配置好
- CATALINA_HOME：tomcat的所在目录
- tomcat的bin目录

![image-20221012153708037](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012153708037.png)

![image-20221012153825082](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012153825082.png)

这样就完成了基本的环境变量配置了，然后我们来简单的检测一下环境变量是否配置成功

打开cmd控制台

```shell
$ startup.bat
```

![image-20221012154158959](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012154158959.png)

![image-20221012154206082](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012154206082.png)

这样就启动成功了，然后我们访问`localhost:8080`，出现以下页面就成功了

![image-20221012154331045](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012154331045.png)

测试成功就可以关闭服务了

# 配置maven

![image-20221012155135786](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012155135786.png)

[Maven – Download Apache Maven](https://maven.apache.org/download.cgi)

下载好之后解压到任务目录

需要配置两个环境变量

- MAVEN_HOME：maven所在目录
- maven的bin目录

![image-20221012155346953](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012155346953.png)

![image-20221012155327550](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012155327550.png)

![image-20221012155408605](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012155408605.png)

打开控制测试一下

```shell
$ mvn -v
```

![image-20221012155441330](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012155441330.png)

这样maven就配置好了

# 在IDEA中使用Tomcat和maven

创建一个maven项目，如果你的界面和我不一样也不用担心，在`Archetype`这一项选择`webapp`然后创建项目就可以了

![image-20221012161710988](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012161710988.png)

打开设置

![image-20221012155731409](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012155731409.png)

找到maven设置

![image-20221012155823822](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012155823822.png)

设置配置文件和仓库位置，给右边的`Override`选项打勾，如果没有`repository`目录可以新建一个

![image-20221012160008374](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012160008374.png)

在IDEA中配置tomcat

![image-20221012160102350](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012160102350.png)

找到tomcat选项

![image-20221012160144792](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012160144792.png)

这两个文件夹设置成tomcat所在目录就可以了，如果你配置好了环境变量这里应该会自动出现，如果没有出现就手动选择一下

![image-20221012160419644](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012160419644.png)

下面有一个浏览器的选择，在项目启动之后会自动在浏览器打开网页，如果没有google可以切换，也可以把这个功能关闭

![image-20221012161304523](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012161304523.png)

选择好之后继续配置

![image-20221012160713348](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012160713348.png)

选择第一个就ok

![image-20221012160738226](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012160738226.png)

记录一下下面这个数值，这就是你的web根目录，当然这个根目录很长，不太好用，你可以修改一下，这个值任意

![image-20221012160853525](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012160853525.png)

好了，现在就已经配置好了所有内容，启动项目吧

![image-20221012161143532](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012161143532.png)

如果你没有关闭自动打开，那么此时你已经可以看到这个界面，如果没有打开，

输入`localhost:8080/你的web根目录`

![image-20221012161529357](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221012161529357.png)

至此，已经完全配置完成了